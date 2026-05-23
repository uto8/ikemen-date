import { describe, expect, it } from 'vitest'
import { calcAge } from './age'

describe('calcAge', () => {
  const birth = new Date(2000, 5, 15) // 2000-06-15

  it('誕生日前日は年齢が増えない', () => {
    expect(calcAge(birth, new Date(2024, 5, 14))).toBe(23)
  })

  it('誕生日当日に年齢が増える', () => {
    expect(calcAge(birth, new Date(2024, 5, 15))).toBe(24)
  })

  it('誕生日翌日は新しい年齢を維持する', () => {
    expect(calcAge(birth, new Date(2024, 5, 16))).toBe(24)
  })

  it('年をまたいだ誕生日前（1月1日 vs 12月生まれ）', () => {
    const decBirth = new Date(2000, 11, 1) // 2000-12-01
    expect(calcAge(decBirth, new Date(2024, 0, 1))).toBe(23)
  })

  it('誕生日が1月1日で元日に年齢が増える', () => {
    const janBirth = new Date(2000, 0, 1) // 2000-01-01
    expect(calcAge(janBirth, new Date(2024, 0, 1))).toBe(24)
  })
})
