import { calcAge } from '../utils/age'
import { createServerSupabaseClient } from '../supabase/server'

type PartnerProfileRow = {
  id: string
  nickname: string
  birth_date: string
  prefecture: string
  avatar_url: string | null
  gender: string
}

type MessageRow = {
  content: string
  created_at: string
  is_read: boolean
  sender_id: string | null
}

type MatchRow = {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  user1: PartnerProfileRow
  user2: PartnerProfileRow
  messages: MessageRow[]
}

export type MatchWithPartner = {
  matchId: string
  partner: {
    id: string
    nickname: string
    age: number
    prefecture: string
    avatar_url: string | null
    gender: string
  }
  unreadCount: number
  lastActivityAt: string
  lastMessage: string | null
}

export function transformToMatchWithPartner(
  match: MatchRow,
  currentUserId: string
): MatchWithPartner {
  const partnerProfile =
    match.user1_id === currentUserId ? match.user2 : match.user1

  const [y, m, d] = partnerProfile.birth_date.split('-').map(Number)
  const age = calcAge(new Date(y, m - 1, d))

  const unreadCount = match.messages.filter(
    (msg) => !msg.is_read && msg.sender_id !== null && msg.sender_id !== currentUserId
  ).length

  const sortedMessages = [...match.messages].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  )
  const lastMsg = sortedMessages.at(-1)

  return {
    matchId: match.id,
    partner: {
      id: partnerProfile.id,
      nickname: partnerProfile.nickname,
      age,
      prefecture: partnerProfile.prefecture,
      avatar_url: partnerProfile.avatar_url,
      gender: partnerProfile.gender,
    },
    unreadCount,
    lastActivityAt: lastMsg?.created_at ?? match.created_at,
    lastMessage: lastMsg?.content ?? null,
  }
}

export type MatchParticipants = {
  isParticipant: boolean
  isPartnerActive: boolean
  partnerId: string | null
}

export function resolveParticipants(
  user1_id: string | null,
  user2_id: string | null,
  currentUserId: string
): MatchParticipants {
  const isParticipant = user1_id === currentUserId || user2_id === currentUserId
  if (!isParticipant) return { isParticipant: false, isPartnerActive: false, partnerId: null }

  const partnerId = user1_id === currentUserId ? user2_id : user1_id
  return { isParticipant: true, isPartnerActive: partnerId !== null, partnerId }
}

export async function getMatchParticipants(
  matchId: string,
  currentUserId: string
): Promise<MatchParticipants> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('matches')
    .select('user1_id, user2_id')
    .eq('id', matchId)
    .single()

  if (error || !data) return { isParticipant: false, isPartnerActive: false, partnerId: null }

  const row = data as { user1_id: string | null; user2_id: string | null }
  return resolveParticipants(row.user1_id, row.user2_id, currentUserId)
}

export async function getMyMatches(currentUserId: string): Promise<MatchWithPartner[]> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('matches')
    .select(
      `
      id,
      user1_id,
      user2_id,
      created_at,
      user1:profiles!user1_id(id, nickname, birth_date, prefecture, avatar_url, gender),
      user2:profiles!user2_id(id, nickname, birth_date, prefecture, avatar_url, gender),
      messages(content, created_at, is_read, sender_id)
    `
    )
    .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
    .not('user1_id', 'is', null)
    .not('user2_id', 'is', null)

  if (error || !data) return []

  return (data as unknown as MatchRow[])
    .map((row) => transformToMatchWithPartner(row, currentUserId))
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
}
