import { z } from 'zod'
import { calcAge } from '../utils/age'

const passwordRules = z
  .string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .regex(/[a-zA-Z]/, 'パスワードには英字を1文字以上含めてください')
  .regex(/[0-9]/, 'パスワードには数字を1文字以上含めてください')

export const passwordSchema = z.object({
  password: passwordRules,
})

export const registerSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  password: passwordRules,
  gender: z.enum(['male', 'female'], { error: '性別を選択してください' }),
  birthDate: z
    .string()
    .date('生年月日を正しく入力してください')
    .refine(
      (val) => calcAge(new Date(val)) >= 18,
      '18歳以上の方のみご利用いただけます'
    ),
})
