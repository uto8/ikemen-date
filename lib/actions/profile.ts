'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { femaleOnboardingSchema, maleOnboardingSchema } from '@/lib/validations/profile'

async function uploadAvatar(
  userId: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return {}

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${userId}.${ext}`
  const admin = createSupabaseAdminClient()

  const { error } = await admin.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (error) return { error: '画像のアップロードに失敗しました' }

  const url = admin.storage.from('avatars').getPublicUrl(path).data.publicUrl
  return { url }
}

async function deleteExistingAvatars(userId: string): Promise<void> {
  const admin = createSupabaseAdminClient()
  const { data: files } = await admin.storage.from('avatars').list('', { search: userId })
  if (files && files.length > 0) {
    await admin.storage.from('avatars').remove(files.map((f) => f.name))
  }
}

export async function completeOnboarding(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', user.id)
    .single()

  const isMale = profileRow?.gender === 'male'

  const { url: avatarUrl, error: avatarError } = await uploadAvatar(user.id, formData)
  if (avatarError) return { error: avatarError }

  const baseFields = {
    nickname: formData.get('nickname') as string,
    prefecture: formData.get('prefecture') as string,
  }

  if (isMale) {
    const raw = {
      ...baseFields,
      occupation: formData.get('occupation') as string,
      height: formData.get('height') as string,
      bio: formData.get('bio') as string,
      ikemen_type_ids: formData.getAll('ikemen_type_ids').map(Number),
    }
    const result = maleOnboardingSchema.safeParse(raw)
    if (!result.success) return { error: result.error.issues[0].message }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        nickname: result.data.nickname,
        prefecture: result.data.prefecture,
        occupation: result.data.occupation,
        height: result.data.height,
        bio: result.data.bio,
        is_onboarding_complete: true,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      })
      .eq('id', user.id)
    if (updateErr) return { error: 'プロフィールの保存に失敗しました' }

    await supabase.from('profile_ikemen_types').delete().eq('profile_id', user.id)

    const { error: insertErr } = await supabase
      .from('profile_ikemen_types')
      .insert(
        result.data.ikemen_type_ids.map((id) => ({
          profile_id: user.id,
          ikemen_type_id: id,
        }))
      )
    if (insertErr) return { error: 'イケメンタイプの保存に失敗しました' }
  } else {
    const result = femaleOnboardingSchema.safeParse(baseFields)
    if (!result.success) return { error: result.error.issues[0].message }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        nickname: result.data.nickname,
        prefecture: result.data.prefecture,
        is_onboarding_complete: true,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      })
      .eq('id', user.id)
    if (updateErr) return { error: 'プロフィールの保存に失敗しました' }
  }

  revalidatePath('/users')
  redirect('/users')
}

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', user.id)
    .single()

  const isMale = profileRow?.gender === 'male'

  const hasNewAvatar = (() => {
    const file = formData.get('avatar') as File | null
    return file !== null && file.size > 0
  })()

  if (hasNewAvatar) {
    await deleteExistingAvatars(user.id)
  }

  const { url: avatarUrl, error: avatarError } = await uploadAvatar(user.id, formData)
  if (avatarError) return { error: avatarError }

  const baseFields = {
    nickname: formData.get('nickname') as string,
    prefecture: formData.get('prefecture') as string,
  }

  if (isMale) {
    const raw = {
      ...baseFields,
      occupation: formData.get('occupation') as string,
      height: formData.get('height') as string,
      bio: formData.get('bio') as string,
      ikemen_type_ids: formData.getAll('ikemen_type_ids').map(Number),
    }
    const result = maleOnboardingSchema.safeParse(raw)
    if (!result.success) return { error: result.error.issues[0].message }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        nickname: result.data.nickname,
        prefecture: result.data.prefecture,
        occupation: result.data.occupation,
        height: result.data.height,
        bio: result.data.bio,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      })
      .eq('id', user.id)
    if (updateErr) return { error: 'プロフィールの保存に失敗しました' }

    await supabase.from('profile_ikemen_types').delete().eq('profile_id', user.id)

    const { error: insertErr } = await supabase
      .from('profile_ikemen_types')
      .insert(
        result.data.ikemen_type_ids.map((id) => ({
          profile_id: user.id,
          ikemen_type_id: id,
        }))
      )
    if (insertErr) return { error: 'イケメンタイプの保存に失敗しました' }
  } else {
    const result = femaleOnboardingSchema.safeParse(baseFields)
    if (!result.success) return { error: result.error.issues[0].message }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        nickname: result.data.nickname,
        prefecture: result.data.prefecture,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      })
      .eq('id', user.id)
    if (updateErr) return { error: 'プロフィールの保存に失敗しました' }
  }

  revalidatePath('/settings/profile')
  revalidatePath('/users')
  return {}
}
