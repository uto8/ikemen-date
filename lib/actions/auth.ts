'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { loginSchema, passwordSchema, registerSchema } from '@/lib/validations/auth'
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

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { gender, birth_date: birthDate },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.log("===error", error)
    const msg = error.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      return { error: 'このメールアドレスはすでに使用されています' }
    }
    return { error: 'アカウントの作成に失敗しました。しばらく経ってから再度お試しください' }
  }

  redirect('/onboarding')
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

export async function forgotPassword(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''

  if (!z.string().email().safeParse(email).success) {
    return { error: 'メールアドレスの形式が正しくありません' }
  }

  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const supabase = await createServerSupabaseClient()
  // 列挙攻撃対策: 未登録メールでも成功扱いにする（エラーを無視）
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  return { success: true }
}

export async function resetPassword(formData: FormData): Promise<{ error?: string }> {
  const raw = { password: formData.get('password') as string }

  const result = passwordSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.updateUser({ password: result.data.password })

  if (error) {
    return { error: 'パスワードの更新に失敗しました。リンクが期限切れの場合は再度お試しください' }
  }

  redirect('/login')
}

export async function resendConfirmationEmail(
  email: string
): Promise<{ error?: string }> {
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) {
    return { error: '再送信に失敗しました。しばらく経ってから再度お試しください' }
  }

  return {}
}
