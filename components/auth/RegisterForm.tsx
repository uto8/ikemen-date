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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        {state.errors.email && (
          <p className="text-xs text-red-500">{state.errors.email}</p>
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <p className="text-xs text-gray-400">英字・数字を含む8文字以上</p>
        {state.errors.password && (
          <p className="text-xs text-red-500">{state.errors.password}</p>
        )}
      </div>

      {/* gender */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">性別</span>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="gender" value="female" className="accent-pink-500" />
            女性
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="gender" value="male" className="accent-pink-500" />
            男性
          </label>
        </div>
        {state.errors.gender && (
          <p className="text-xs text-red-500">{state.errors.gender}</p>
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <p className="text-xs text-gray-400">18歳以上の方のみご利用いただけます</p>
        {state.errors.birthDate && (
          <p className="text-xs text-red-500">{state.errors.birthDate}</p>
        )}
      </div>

      {/* server error */}
      {state.serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-pink-500 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
      >
        {isPending ? '登録中…' : '登録する'}
      </button>
    </form>
  )
}
