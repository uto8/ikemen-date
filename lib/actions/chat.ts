'use server'

import { createServerSupabaseClient } from '../supabase/server'

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
