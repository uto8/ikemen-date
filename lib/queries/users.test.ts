import { describe, it, expect, vi } from 'vitest'
import { transformToUserCardData } from './users'

vi.mock('../supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

function birthDateYearsAgo(years: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().split('T')[0]
}

const baseFemale = {
  id: 'f-1',
  nickname: '花子',
  birth_date: birthDateYearsAgo(25),
  prefecture: '東京都',
  avatar_url: null,
  gender: 'female',
  created_at: '2024-01-01T00:00:00Z',
  profile_ikemen_types: [],
}

const baseMale = {
  id: 'm-1',
  nickname: '太郎',
  birth_date: birthDateYearsAgo(28),
  prefecture: '大阪府',
  avatar_url: 'https://example.com/avatar.jpg',
  gender: 'male',
  created_at: '2024-01-02T00:00:00Z',
  profile_ikemen_types: [{ ikemen_type_id: 3 }, { ikemen_type_id: 1 }],
}

describe('transformToUserCardData', () => {
  it('年齢を birth_date から正しく算出する', () => {
    const result = transformToUserCardData([baseFemale])
    expect(result[0].age).toBe(25)
  })

  it('女性は primaryIkemenType が undefined', () => {
    const result = transformToUserCardData([baseFemale])
    expect(result[0].primaryIkemenType).toBeUndefined()
  })

  it('男性は display_order 最小の ikemen type 名を primaryIkemenType に付与する', () => {
    // id:1 = 王道アイドル系 (displayOrder:1), id:3 = 犬系彼氏系 (displayOrder:3)
    // → 最小は id:1「王道アイドル系」
    const result = transformToUserCardData([baseMale])
    expect(result[0].primaryIkemenType).toBe('王道アイドル系')
  })

  it('男性のイケメンタイプが空のとき primaryIkemenType は undefined', () => {
    const noTypes = { ...baseMale, profile_ikemen_types: [] }
    const result = transformToUserCardData([noTypes])
    expect(result[0].primaryIkemenType).toBeUndefined()
  })

  it('複数プロフィールをまとめて変換する', () => {
    const result = transformToUserCardData([baseFemale, baseMale])
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('f-1')
    expect(result[1].id).toBe('m-1')
  })

  it('基本フィールドを正しくマッピングする', () => {
    const result = transformToUserCardData([baseFemale])
    const u = result[0]
    expect(u.id).toBe('f-1')
    expect(u.nickname).toBe('花子')
    expect(u.prefecture).toBe('東京都')
    expect(u.avatar_url).toBeNull()
    expect(u.gender).toBe('female')
  })
})
