'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '../supabase/server'
import { createSupabaseAdminClient } from '../supabase/admin'

export async function logoutUser(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function withdrawUser(): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインしてください' }

  const admin = createSupabaseAdminClient()

  // Storage から avatars/{userId}.* を削除
  const { data: files } = await admin.storage.from('avatars').list('', {
    search: user.id,
  })
  if (files && files.length > 0) {
    await admin.storage.from('avatars').remove(files.map((f) => f.name))
  }

  // auth.users を削除（CASCADE で profiles/likes/profile_ikemen_types が削除される）
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { error: '退会処理に失敗しました' }

  // セッションをクリア
  await supabase.auth.signOut()

  redirect('/')
}
