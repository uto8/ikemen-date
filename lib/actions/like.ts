'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '../supabase/server'

export async function updateLikesLastRead(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ likes_last_read_at: new Date().toISOString() })
    .eq('id', user.id)
}

export async function sendLike(receiverId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインしてください' }

  const { error } = await supabase
    .from('likes')
    .insert({ sender_id: user.id, receiver_id: receiverId })

  if (error) {
    if (error.code === '23505') return { error: 'すでにいいね済みです' }
    return { error: 'いいねに失敗しました' }
  }

  revalidatePath(`/users/${receiverId}`)
  return {}
}
