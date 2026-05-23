import { calcAge } from '../utils/age'
import { createServerSupabaseClient } from '../supabase/server'

export type LikeStatus = 'none' | 'sent' | 'received'

export type ReceivedLike = {
  likeId: string
  sender: {
    id: string
    nickname: string
    age: number
    prefecture: string
    avatar_url: string | null
    gender: string
  }
}

type ReceivedLikeRow = {
  id: string
  profiles: {
    id: string
    nickname: string
    birth_date: string
    prefecture: string
    avatar_url: string | null
    gender: string
  }
}

export function transformToReceivedLikes(rows: ReceivedLikeRow[]): ReceivedLike[] {
  return rows.map((row) => {
    const p = row.profiles
    const [y, m, d] = p.birth_date.split('-').map(Number)
    const age = calcAge(new Date(y, m - 1, d))
    return {
      likeId: row.id,
      sender: {
        id: p.id,
        nickname: p.nickname,
        age,
        prefecture: p.prefecture,
        avatar_url: p.avatar_url,
        gender: p.gender,
      },
    }
  })
}

export async function getReceivedLikes(currentUserId: string): Promise<ReceivedLike[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('likes')
    .select(
      `
      id,
      profiles!sender_id (
        id,
        nickname,
        birth_date,
        prefecture,
        avatar_url,
        gender
      )
    `
    )
    .eq('receiver_id', currentUserId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return transformToReceivedLikes(data as unknown as ReceivedLikeRow[])
}

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
