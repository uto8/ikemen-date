import { describe, expect, it } from 'vitest'
import { loginSchema, registerSchema, passwordSchema } from './auth'

// テスト基準日を固定するために birthDate を動的に計算する
function ageAgo(years: number, offsetDays = 0): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

const validBase = {
  email: 'test@example.com',
  password: 'Password1',
  gender: 'female' as const,
  birthDate: ageAgo(20),
}

describe('registerSchema', () => {
  describe('email', () => {
    it('正常: 有効なメールアドレス', () => {
      expect(registerSchema.safeParse(validBase).success).toBe(true)
    })

    it('エラー: メール形式でない', () => {
      const result = registerSchema.safeParse({ ...validBase, email: 'not-email' })
      expect(result.success).toBe(false)
    })
  })

  describe('password', () => {
    it('エラー: 英字のみ（数字なし）', () => {
      const result = registerSchema.safeParse({ ...validBase, password: 'Password' })
      expect(result.success).toBe(false)
    })

    it('エラー: 数字のみ（英字なし）', () => {
      const result = registerSchema.safeParse({ ...validBase, password: '12345678' })
      expect(result.success).toBe(false)
    })

    it('エラー: 7文字（8文字未満）', () => {
      const result = registerSchema.safeParse({ ...validBase, password: 'Pass1ab' })
      expect(result.success).toBe(false)
    })

    it('正常: 英字・数字含む8文字以上', () => {
      const result = registerSchema.safeParse({ ...validBase, password: 'Secure01' })
      expect(result.success).toBe(true)
    })
  })

  describe('gender', () => {
    it('エラー: 性別未選択（空文字）', () => {
      const result = registerSchema.safeParse({ ...validBase, gender: '' as never })
      expect(result.success).toBe(false)
    })

    it('エラー: 不正な値', () => {
      const result = registerSchema.safeParse({ ...validBase, gender: 'other' as never })
      expect(result.success).toBe(false)
    })

    it('正常: male', () => {
      const result = registerSchema.safeParse({ ...validBase, gender: 'male' })
      expect(result.success).toBe(true)
    })
  })

  describe('birthDate（年齢制限）', () => {
    it('エラー: 17歳', () => {
      const result = registerSchema.safeParse({ ...validBase, birthDate: ageAgo(17, -1) })
      expect(result.success).toBe(false)
    })

    it('正常: ちょうど18歳（誕生日当日）', () => {
      const result = registerSchema.safeParse({ ...validBase, birthDate: ageAgo(18) })
      expect(result.success).toBe(true)
    })

    it('正常: 18歳より1日前（昨日18歳になった）', () => {
      const result = registerSchema.safeParse({ ...validBase, birthDate: ageAgo(18, 1) })
      expect(result.success).toBe(true)
    })
  })
})

describe('loginSchema', () => {
  const validLogin = { email: 'test@example.com', password: 'Password1' }

  it('正常: 有効な認証情報', () => {
    expect(loginSchema.safeParse(validLogin).success).toBe(true)
  })

  it('エラー: メール形式でない', () => {
    const result = loginSchema.safeParse({ ...validLogin, email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('エラー: パスワード空', () => {
    const result = loginSchema.safeParse({ ...validLogin, password: '' })
    expect(result.success).toBe(false)
  })

  it('正常: パスワードは1文字以上あれば通過（複雑さ要件なし）', () => {
    const result = loginSchema.safeParse({ ...validLogin, password: 'a' })
    expect(result.success).toBe(true)
  })
})

describe('passwordSchema', () => {
  it('エラー: 英字のみ', () => {
    const result = passwordSchema.safeParse({ password: 'OnlyLetters' })
    expect(result.success).toBe(false)
  })

  it('正常: 英字・数字含む8文字以上', () => {
    const result = passwordSchema.safeParse({ password: 'NewPass1' })
    expect(result.success).toBe(true)
  })
})
