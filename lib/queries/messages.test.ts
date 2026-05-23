import { describe, it, expect, vi } from 'vitest'
import { transformMessages } from './messages'

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
