'use server'

import { createServerSupabaseClient } from '../supabase/server'
import { getMatchParticipants } from '../queries/matches'

export async function sendMessage(
  matchId: string,
  content: string
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'ログインしてください' }

  const participants = await getMatchParticipants(matchId, user.id)
  if (!participants.isParticipant) return { error: '権限がありません' }

  const { error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: user.id, content })

  if (error) return { error: 'メッセージの送信に失敗しました' }

  return {}
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
