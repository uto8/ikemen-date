import { describe, it, expect, vi } from 'vitest'
import { transformToUserCardData, transformToUserDetailData } from './users'

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

const baseMaleDetail = {
  id: 'm-1',
  nickname: '太郎',
  birth_date: birthDateYearsAgo(28),
  prefecture: '大阪府',
  avatar_url: 'https://example.com/avatar.jpg',
  gender: 'male',
  occupation: 'エンジニア',
  height: 178,
  bio: 'よろしくお願いします',
  profile_ikemen_types: [{ ikemen_type_id: 3 }, { ikemen_type_id: 1 }],
}

const baseFemaleDetail = {
  id: 'f-1',
  nickname: '花子',
  birth_date: birthDateYearsAgo(25),
  prefecture: '東京都',
  avatar_url: null,
  gender: 'female',
  occupation: null,
  height: null,
  bio: null,
  profile_ikemen_types: [],
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

describe('transformToUserDetailData', () => {
  it('男性の全フィールドを正しく変換する', () => {
    const result = transformToUserDetailData(baseMaleDetail)
    expect(result.id).toBe('m-1')
    expect(result.age).toBe(28)
    expect(result.occupation).toBe('エンジニア')
    expect(result.height).toBe(178)
    expect(result.bio).toBe('よろしくお願いします')
  })

  it('ikemenTypes は display_order 順に返す', () => {
    // id:1=王道アイドル系(order:1), id:3=犬系彼氏系(order:3)
    const result = transformToUserDetailData(baseMaleDetail)
    expect(result.ikemenTypes).toEqual(['王道アイドル系', '犬系彼氏系'])
  })

  it('profile_ikemen_types が空のとき ikemenTypes は空配列', () => {
    const row = { ...baseMaleDetail, profile_ikemen_types: [] }
    const result = transformToUserDetailData(row)
    expect(result.ikemenTypes).toEqual([])
  })

  it('女性の基本フィールドを正しく変換する', () => {
    const result = transformToUserDetailData(baseFemaleDetail)
    expect(result.id).toBe('f-1')
    expect(result.age).toBe(25)
    expect(result.occupation).toBeNull()
    expect(result.height).toBeNull()
    expect(result.bio).toBeNull()
    expect(result.ikemenTypes).toEqual([])
  })
})
