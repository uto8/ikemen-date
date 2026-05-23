import { z } from 'zod'
import { PREFECTURES } from '../utils/prefectures'
import type { Prefecture } from '../utils/prefectures'

export const femaleOnboardingSchema = z.object({
  nickname: z
    .string()
    .min(1, '必須項目です')
    .max(20, '20文字以内で入力してください'),
  prefecture: z
    .string()
    .refine(
      (val): val is Prefecture => PREFECTURES.includes(val as Prefecture),
      '都道府県を選択してください'
    ),
})

export const maleOnboardingSchema = femaleOnboardingSchema.extend({
  occupation: z
    .string()
    .min(1, '必須項目です')
    .max(30, '30文字以内で入力してください'),
  height: z.coerce
    .number({ error: '身長を入力してください' })
    .int()
    .min(100, '100cm以上で入力してください')
    .max(250, '250cm以下で入力してください'),
  bio: z
    .string()
    .min(1, '必須項目です')
    .max(300, '300文字以内で入力してください'),
  ikemen_type_ids: z
    .array(z.number().int())
    .min(1, '1つ以上選択してください'),
})
