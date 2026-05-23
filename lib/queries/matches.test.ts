import { describe, it, expect, vi } from 'vitest'
import { transformToMatchWithPartner, resolveParticipants } from './matches'

vi.mock('../supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

function birthDateYearsAgo(years: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().split('T')[0]
}

const user1Profile = {
  id: 'user-1',
  nickname: '花子',
  birth_date: birthDateYearsAgo(25),
  prefecture: '東京都',
  avatar_url: null,
  gender: 'female',
}

const user2Profile = {
  id: 'user-2',
  nickname: '太郎',
  birth_date: birthDateYearsAgo(28),
  prefecture: '大阪府',
  avatar_url: 'https://example.com/avatar.jpg',
  gender: 'male',
}

const baseMatch = {
  id: 'match-1',
  user1_id: 'user-1',
  user2_id: 'user-2',
  created_at: '2024-01-01T00:00:00Z',
  user1: user1Profile,
  user2: user2Profile,
  messages: [],
}

describe('transformToMatchWithPartner', () => {
  it('currentUser が user1 のとき partner は user2', () => {
    const result = transformToMatchWithPartner(baseMatch, 'user-1')
    expect(result.partner.id).toBe('user-2')
    expect(result.partner.nickname).toBe('太郎')
  })

  it('currentUser が user2 のとき partner は user1', () => {
    const result = transformToMatchWithPartner(baseMatch, 'user-2')
    expect(result.partner.id).toBe('user-1')
    expect(result.partner.nickname).toBe('花子')
  })

  it('partner の年齢を birth_date から正しく算出する', () => {
    const result = transformToMatchWithPartner(baseMatch, 'user-1')
    expect(result.partner.age).toBe(28)
  })

  it('基本フィールドを正しくマッピングする', () => {
    const result = transformToMatchWithPartner(baseMatch, 'user-1')
    expect(result.matchId).toBe('match-1')
    expect(result.partner.prefecture).toBe('大阪府')
    expect(result.partner.avatar_url).toBe('https://example.com/avatar.jpg')
  })

  it('メッセージなしのとき lastActivityAt は match.created_at', () => {
    const result = transformToMatchWithPartner(baseMatch, 'user-1')
    expect(result.lastActivityAt).toBe('2024-01-01T00:00:00Z')
  })

  it('メッセージがあるとき lastActivityAt は最新メッセージの created_at', () => {
    const match = {
      ...baseMatch,
      messages: [
        { created_at: '2024-01-02T10:00:00Z', is_read: true,  sender_id: 'user-2' },
        { created_at: '2024-01-03T09:00:00Z', is_read: false, sender_id: 'user-2' },
        { created_at: '2024-01-02T08:00:00Z', is_read: true,  sender_id: 'user-1' },
      ],
    }
    const result = transformToMatchWithPartner(match, 'user-1')
    expect(result.lastActivityAt).toBe('2024-01-03T09:00:00Z')
  })

  it('未読件数: 相手からの未読メッセージのみカウントする', () => {
    const match = {
      ...baseMatch,
      messages: [
        { created_at: '2024-01-02T10:00:00Z', is_read: false, sender_id: 'user-2' },
        { created_at: '2024-01-02T11:00:00Z', is_read: false, sender_id: 'user-2' },
        { created_at: '2024-01-02T12:00:00Z', is_read: true,  sender_id: 'user-2' },
        { created_at: '2024-01-02T13:00:00Z', is_read: false, sender_id: 'user-1' },
      ],
    }
    const result = transformToMatchWithPartner(match, 'user-1')
    expect(result.unreadCount).toBe(2)
  })

  it('未読件数: sender_id が null のメッセージはカウントしない（退会ユーザー）', () => {
    const match = {
      ...baseMatch,
      messages: [
        { created_at: '2024-01-02T10:00:00Z', is_read: false, sender_id: null },
        { created_at: '2024-01-02T11:00:00Z', is_read: false, sender_id: 'user-2' },
      ],
    }
    const result = transformToMatchWithPartner(match, 'user-1')
    expect(result.unreadCount).toBe(1)
  })

  it('メッセージが全て既読のとき unreadCount は 0', () => {
    const match = {
      ...baseMatch,
      messages: [
        { created_at: '2024-01-02T10:00:00Z', is_read: true, sender_id: 'user-2' },
      ],
    }
    const result = transformToMatchWithPartner(match, 'user-1')
    expect(result.unreadCount).toBe(0)
  })
})

describe('resolveParticipants', () => {
  it('currentUser が user1 のとき isParticipant=true・partnerId=user2', () => {
    const result = resolveParticipants('user-1', 'user-2', 'user-1')
    expect(result.isParticipant).toBe(true)
    expect(result.isPartnerActive).toBe(true)
    expect(result.partnerId).toBe('user-2')
  })

  it('currentUser が user2 のとき isParticipant=true・partnerId=user1', () => {
    const result = resolveParticipants('user-1', 'user-2', 'user-2')
    expect(result.isParticipant).toBe(true)
    expect(result.isPartnerActive).toBe(true)
    expect(result.partnerId).toBe('user-1')
  })

  it('currentUser が含まれない場合 isParticipant=false・partnerId=null', () => {
    const result = resolveParticipants('user-1', 'user-2', 'user-3')
    expect(result.isParticipant).toBe(false)
    expect(result.isPartnerActive).toBe(false)
    expect(result.partnerId).toBeNull()
  })

  it('パートナーが退会済み（null）のとき isPartnerActive=false・partnerId=null', () => {
    const result = resolveParticipants('user-1', null, 'user-1')
    expect(result.isParticipant).toBe(true)
    expect(result.isPartnerActive).toBe(false)
    expect(result.partnerId).toBeNull()
  })
})
