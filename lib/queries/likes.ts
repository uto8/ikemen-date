import { createServerSupabaseClient } from '../supabase/server'

export type LikeStatus = 'none' | 'sent' | 'received'

export async function getLikeStatus(
  currentUserId: string,
  targetUserId: string
): Promise<LikeStatus> {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('likes')
    .select('sender_id')
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`
    )
    .limit(1)
    .maybeSingle()

  if (!data) return 'none'
  return data.sender_id === currentUserId ? 'sent' : 'received'
}
