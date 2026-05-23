import { describe, it, expect, vi } from 'vitest'
import { transformMessages, buildUnreadMap, toMatchUnreadInfos } from './messages'

vi.mock('../supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

const baseRow = {
  id: 'msg-1',
  sender_id: 'user-1',
  content: 'こんにちは',
  is_read: false,
  created_at: '2024-01-01T10:00:00Z',
}

describe('transformMessages', () => {
  it('基本フィールドを camelCase にマッピングする', () => {
    const result = transformMessages([baseRow])
    expect(result[0].id).toBe('msg-1')
    expect(result[0].senderId).toBe('user-1')
    expect(result[0].content).toBe('こんにちは')
    expect(result[0].isRead).toBe(false)
    expect(result[0].createdAt).toBe('2024-01-01T10:00:00Z')
  })

  it('sender_id が null のメッセージ（退会済み）も変換できる', () => {
    const row = { ...baseRow, sender_id: null }
    const result = transformMessages([row])
    expect(result[0].senderId).toBeNull()
  })

  it('is_read = true のメッセージを正しく変換する', () => {
    const row = { ...baseRow, is_read: true }
    const result = transformMessages([row])
    expect(result[0].isRead).toBe(true)
  })

  it('複数メッセージをまとめて変換する', () => {
    const row2 = { ...baseRow, id: 'msg-2', sender_id: 'user-2', content: 'よろしく' }
    const result = transformMessages([baseRow, row2])
    expect(result).toHaveLength(2)
    expect(result[1].content).toBe('よろしく')
  })

  it('空配列を渡すと空配列を返す', () => {
    expect(transformMessages([])).toEqual([])
  })
})

describe('buildUnreadMap', () => {
  it('空配列のとき空オブジェクトを返す', () => {
    expect(buildUnreadMap([])).toEqual({})
  })

  it('同じ match_id の行をまとめてカウントする', () => {
    const rows = [
      { match_id: 'match-1' },
      { match_id: 'match-1' },
      { match_id: 'match-2' },
    ]
    expect(buildUnreadMap(rows)).toEqual({ 'match-1': 2, 'match-2': 1 })
  })

  it('全て異なる match_id のとき各カウントが 1', () => {
    const rows = [{ match_id: 'a' }, { match_id: 'b' }, { match_id: 'c' }]
    expect(buildUnreadMap(rows)).toEqual({ a: 1, b: 1, c: 1 })
  })
})

describe('toMatchUnreadInfos', () => {
  it('matchIds の全てを含む配列を返す', () => {
    const result = toMatchUnreadInfos(['match-1', 'match-2'], { 'match-1': 3 })
    expect(result).toHaveLength(2)
  })

  it('unreadMap に存在する matchId は unreadCount をセットする', () => {
    const result = toMatchUnreadInfos(['match-1'], { 'match-1': 5 })
    expect(result[0]).toEqual({ matchId: 'match-1', unreadCount: 5 })
  })

  it('unreadMap に存在しない matchId は unreadCount=0', () => {
    const result = toMatchUnreadInfos(['match-99'], {})
    expect(result[0]).toEqual({ matchId: 'match-99', unreadCount: 0 })
  })

  it('matchIds が空のとき空配列を返す', () => {
    expect(toMatchUnreadInfos([], { 'match-1': 3 })).toEqual([])
  })
})
