import { createServerSupabaseClient } from '../supabase/server'

export type MatchUnreadInfo = {
  matchId: string
  unreadCount: number
}

export function buildUnreadMap(rows: { match_id: string }[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const row of rows) {
    map[row.match_id] = (map[row.match_id] ?? 0) + 1
  }
  return map
}

export function toMatchUnreadInfos(
  matchIds: string[],
  unreadMap: Record<string, number>
): MatchUnreadInfo[] {
  return matchIds.map((matchId) => ({
    matchId,
    unreadCount: unreadMap[matchId] ?? 0,
  }))
}

export async function getMatchesWithUnreadCounts(
  userId: string
): Promise<MatchUnreadInfo[]> {
  const supabase = await createServerSupabaseClient()

  const [matchResult, msgResult] = await Promise.all([
    supabase
      .from('matches')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .not('user1_id', 'is', null)
      .not('user2_id', 'is', null),
    supabase
      .from('messages')
      .select('match_id')
      .eq('is_read', false)
      .neq('sender_id', userId)
      .not('sender_id', 'is', null),
  ])

  const matchIds = (matchResult.data ?? []).map((m) => (m as { id: string }).id)
  const unreadRows = (msgResult.data ?? []) as { match_id: string }[]

  return toMatchUnreadInfos(matchIds, buildUnreadMap(unreadRows))
}

export type Message = {
  id: string
  senderId: string | null
  content: string
  isRead: boolean
  createdAt: string
}

type MessageRow = {
  id: string
  sender_id: string | null
  content: string
  is_read: boolean
  created_at: string
}

export function transformMessages(rows: MessageRow[]): Message[] {
  return rows.map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    content: row.content,
    isRead: row.is_read,
    createdAt: row.created_at,
  }))
}

export async function getMessages(matchId: string): Promise<Message[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, content, is_read, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return transformMessages(data as MessageRow[])
}
