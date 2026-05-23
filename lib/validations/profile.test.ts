import { describe, expect, it } from 'vitest'
import { femaleOnboardingSchema, maleOnboardingSchema } from './profile'

const validFemale = {
  nickname: 'テストユーザー',
  prefecture: '東京都',
}

const validMale = {
  ...validFemale,
  occupation: 'エンジニア',
  height: 175,
  bio: '自己紹介文です',
  ikemen_type_ids: [1, 3],
}

describe('femaleOnboardingSchema', () => {
  it('正常: 必須項目あり', () => {
    expect(femaleOnboardingSchema.safeParse(validFemale).success).toBe(true)
  })

  it('エラー: nickname が空', () => {
    const result = femaleOnboardingSchema.safeParse({ ...validFemale, nickname: '' })
    expect(result.success).toBe(false)
  })

  it('エラー: nickname が21文字', () => {
    const result = femaleOnboardingSchema.safeParse({
      ...validFemale,
      nickname: 'a'.repeat(21),
    })
    expect(result.success).toBe(false)
  })

  it('正常: nickname がちょうど20文字', () => {
    const result = femaleOnboardingSchema.safeParse({
      ...validFemale,
      nickname: 'a'.repeat(20),
    })
    expect(result.success).toBe(true)
  })

  it('エラー: prefecture が不正な値', () => {
    const result = femaleOnboardingSchema.safeParse({
      ...validFemale,
      prefecture: '架空県',
    })
    expect(result.success).toBe(false)
  })

  it('正常: prefecture が有効な都道府県', () => {
    const result = femaleOnboardingSchema.safeParse({
      ...validFemale,
      prefecture: '大阪府',
    })
    expect(result.success).toBe(true)
  })
})

describe('maleOnboardingSchema', () => {
  it('正常: 全必須項目あり・ikemen_type_ids 1件以上', () => {
    expect(maleOnboardingSchema.safeParse(validMale).success).toBe(true)
  })

  it('エラー: ikemen_type_ids が空配列', () => {
    const result = maleOnboardingSchema.safeParse({
      ...validMale,
      ikemen_type_ids: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes('ikemen_type_ids')
      )
      expect(issue).toBeDefined()
    }
  })

  it('エラー: occupation が空', () => {
    const result = maleOnboardingSchema.safeParse({ ...validMale, occupation: '' })
    expect(result.success).toBe(false)
  })

  it('エラー: occupation が31文字', () => {
    const result = maleOnboardingSchema.safeParse({
      ...validMale,
      occupation: 'a'.repeat(31),
    })
    expect(result.success).toBe(false)
  })

  it('エラー: height が99（下限未満）', () => {
    const result = maleOnboardingSchema.safeParse({ ...validMale, height: 99 })
    expect(result.success).toBe(false)
  })

  it('エラー: height が251（上限超）', () => {
    const result = maleOnboardingSchema.safeParse({ ...validMale, height: 251 })
    expect(result.success).toBe(false)
  })

  it('正常: height が境界値 100 / 250', () => {
    expect(maleOnboardingSchema.safeParse({ ...validMale, height: 100 }).success).toBe(true)
    expect(maleOnboardingSchema.safeParse({ ...validMale, height: 250 }).success).toBe(true)
  })

  it('エラー: bio が空', () => {
    const result = maleOnboardingSchema.safeParse({ ...validMale, bio: '' })
    expect(result.success).toBe(false)
  })

  it('エラー: bio が301文字', () => {
    const result = maleOnboardingSchema.safeParse({
      ...validMale,
      bio: 'a'.repeat(301),
    })
    expect(result.success).toBe(false)
  })

  it('正常: bio がちょうど300文字', () => {
    const result = maleOnboardingSchema.safeParse({
      ...validMale,
      bio: 'a'.repeat(300),
    })
    expect(result.success).toBe(true)
  })
})
