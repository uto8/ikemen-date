import { describe, it, expect, vi } from 'vitest'
import { transformToReceivedLikes } from './likes'

vi.mock('../supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

function birthDateYearsAgo(years: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().split('T')[0]
}

const baseRow = {
  id: 'like-1',
  profiles: {
    id: 'm-1',
    nickname: '太郎',
    birth_date: birthDateYearsAgo(30),
    prefecture: '東京都',
    avatar_url: 'https://example.com/avatar.jpg',
    gender: 'male',
  },
}

describe('transformToReceivedLikes', () => {
  it('基本フィールドを正しくマッピングする', () => {
    const result = transformToReceivedLikes([baseRow])
    expect(result[0].likeId).toBe('like-1')
    expect(result[0].sender.id).toBe('m-1')
    expect(result[0].sender.nickname).toBe('太郎')
    expect(result[0].sender.prefecture).toBe('東京都')
    expect(result[0].sender.avatar_url).toBe('https://example.com/avatar.jpg')
    expect(result[0].sender.gender).toBe('male')
  })

  it('birth_date から年齢を正しく算出する', () => {
    const result = transformToReceivedLikes([baseRow])
    expect(result[0].sender.age).toBe(30)
  })

  it('avatar_url が null でも変換できる', () => {
    const row = { ...baseRow, profiles: { ...baseRow.profiles, avatar_url: null } }
    const result = transformToReceivedLikes([row])
    expect(result[0].sender.avatar_url).toBeNull()
  })

  it('複数行をまとめて変換する', () => {
    const row2 = {
      id: 'like-2',
      profiles: {
        id: 'f-1',
        nickname: '花子',
        birth_date: birthDateYearsAgo(25),
        prefecture: '大阪府',
        avatar_url: null,
        gender: 'female',
      },
    }
    const result = transformToReceivedLikes([baseRow, row2])
    expect(result).toHaveLength(2)
    expect(result[0].likeId).toBe('like-1')
    expect(result[1].likeId).toBe('like-2')
  })

  it('空配列を渡すと空配列を返す', () => {
    expect(transformToReceivedLikes([])).toEqual([])
  })
})
