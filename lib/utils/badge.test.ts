import { describe, it, expect } from 'vitest'
import { formatBadgeCount } from './badge'

describe('formatBadgeCount', () => {
  it('0 は "0" を返す', () => {
    expect(formatBadgeCount(0)).toBe('0')
  })

  it('1〜99 はそのまま文字列で返す', () => {
    expect(formatBadgeCount(1)).toBe('1')
    expect(formatBadgeCount(99)).toBe('99')
  })

  it('100 以上は "99+" を返す', () => {
    expect(formatBadgeCount(100)).toBe('99+')
    expect(formatBadgeCount(999)).toBe('99+')
  })
})
