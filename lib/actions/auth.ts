'use server'

import { redirect } from 'next/navigation'
import { loginSchema, registerSchema } from '@/lib/validations/auth'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function registerUser(formData: FormData): Promise<{ error?: string }> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    gender: formData.get('gender') as string,
    birthDate: formData.get('birthDate') as string,
  }

  const result = registerSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { email, password, gender, birthDate } = result.data

  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { gender, birth_date: birthDate },
    email_confirm: false,
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      return { error: 'このメールアドレスはすでに使用されています' }
    }
    return { error: 'アカウントの作成に失敗しました。しばらく経ってから再度お試しください' }
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`)
}

export async function loginUser(formData: FormData): Promise<{ error?: string }> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = loginSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { email, password } = result.data
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      redirect(`/verify-email?email=${encodeURIComponent(email)}`)
    }
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_onboarding_complete')
    .eq('id', data.user.id)
    .single()

  if (!profile?.is_onboarding_complete) {
    redirect('/onboarding')
  }
  redirect('/users')
}

export async function resendConfirmationEmail(
  email: string
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) {
    return { error: '再送信に失敗しました。しばらく経ってから再度お試しください' }
  }

  return {}
}
