'use server'

import { createServerSupabaseClient } from '../supabase/server'
import { getMatchParticipants } from '../queries/matches'
import type { Message } from '../queries/messages'

type InsertedRow = {
  id: string
  sender_id: string | null
  content: string
  is_read: boolean
  created_at: string
}

export async function sendMessage(
  matchId: string,
  content: string
): Promise<{ error?: string; message?: Message }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインしてください' }

  const participants = await getMatchParticipants(matchId, user.id)
  if (!participants.isParticipant) return { error: '権限がありません' }

  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: user.id, content })
    .select('id, sender_id, content, is_read, created_at')
    .single()

  if (error || !data) return { error: 'メッセージの送信に失敗しました' }

  const row = data as InsertedRow
  return {
    message: {
      id: row.id,
      senderId: row.sender_id,
      content: row.content,
      isRead: row.is_read,
      createdAt: row.created_at,
    },
  }
}

export async function markMessagesAsRead(matchId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('match_id', matchId)
    .neq('sender_id', user.id)
    .not('sender_id', 'is', null)
    .eq('is_read', false)
}
