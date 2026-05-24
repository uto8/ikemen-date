'use client'

import { useState, useTransition } from 'react'
import { registerSchema } from '@/lib/validations/auth'
import { registerUser } from '@/lib/actions/auth'
import type { z } from 'zod'

type FieldErrors = Partial<Record<keyof z.infer<typeof registerSchema>, string>>

type FormState = {
  errors: FieldErrors
  serverError?: string
}

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<FormState>({ errors: {} })
  const [gender, setGender] = useState<'female' | 'male'>('female')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      gender: formData.get('gender') as string,
      birthDate: formData.get('birthDate') as string,
    }

    const result = registerSchema.safeParse(raw)
    if (!result.success) {
      const errors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (!errors[key]) errors[key] = issue.message
      }
      setState({ errors })
      return
    }

    setState({ errors: {} })
    startTransition(async () => {
      const res = await registerUser(formData)
      if (res.error) {
        setState({ errors: {}, serverError: res.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* email */}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!state.errors.email}
          aria-describedby={state.errors.email ? 'email-error' : undefined}
          className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {state.errors.email && (
          <p id="email-error" role="alert" className="text-xs text-error-500">{state.errors.email}</p>
        )}
      </div>

      {/* password */}
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!state.errors.password}
          aria-describedby={state.errors.password ? 'password-error' : 'password-hint'}
          className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p id="password-hint" className="text-xs text-gray-400">英字・数字を含む8文字以上</p>
        {state.errors.password && (
          <p id="password-error" role="alert" className="text-xs text-error-500">{state.errors.password}</p>
        )}
      </div>

      {/* gender */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">性別</span>
        {/* <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="gender" value="female" className="accent-primary-500" />
            女性
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="gender" value="male" className="accent-primary-500" />
            男性
          </label>
        </div> */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            性別
          </label>

          <div className="flex gap-4">
            {/* 女性 */}
            <label
              className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-md py-3 cursor-pointer transition-colors ${
                gender === 'female'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
                className="accent-primary-500"
              />

              <span
                className={`text-sm font-semibold ${
                  gender === 'female'
                    ? 'text-primary-500'
                    : 'text-gray-500'
                }`}
              >
                女性
              </span>
            </label>

            {/* 男性 */}
            <label
              className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-md py-3 cursor-pointer transition-colors ${
                gender === 'male'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
                className="accent-primary-500"
              />

              <span
                className={`text-sm font-semibold ${
                  gender === 'male'
                    ? 'text-primary-500'
                    : 'text-gray-500'
                }`}
              >
                男性
              </span>
            </label>
          </div>
        </div>
        {state.errors.gender && (
          <p className="text-xs text-error-500">{state.errors.gender}</p>
        )}
      </div>

      {/* birthDate */}
      <div className="flex flex-col gap-1">
        <label htmlFor="birthDate" className="text-sm font-medium">
          生年月日
        </label>
        <input
          id="birthDate"
          name="birthDate"
          type="date"
          defaultValue="2000-08-26"
          aria-invalid={!!state.errors.birthDate}
          aria-describedby={state.errors.birthDate ? 'birthDate-error' : 'birthDate-hint'}
          className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p id="birthDate-hint" className="text-xs text-gray-400">18歳以上の方のみご利用いただけます</p>
        {state.errors.birthDate && (
          <p id="birthDate-error" role="alert" className="text-xs text-error-500">{state.errors.birthDate}</p>
        )}
      </div>

      {/* server error */}
      {state.serverError && (
        <p role="alert" className="rounded-md bg-error-50 px-3 py-2 text-sm text-error-500">
          {state.serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-primary-500 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        {isPending ? '登録中…' : '登録する'}
      </button>
    </form>
  )
}
