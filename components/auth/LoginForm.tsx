'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { loginUser } from '@/lib/actions/auth'

type Props = {
  errorParam?: string
}

export default function LoginForm({ errorParam }: Props) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string>()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setServerError(undefined)
    startTransition(async () => {
      const res = await loginUser(formData)
      if (res?.error) {
        setServerError(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {errorParam === 'expired' && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          確認リンクの有効期限が切れました。もう一度メールを確認するか、再送信してください。
        </p>
      )}

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
          autoComplete="current-password"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-pink-500 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
      >
        {isPending ? 'ログイン中…' : 'ログインする'}
      </button>

      <Link
        href="/forgot-password"
        className="text-center text-sm text-gray-400 hover:underline"
      >
        パスワードをお忘れの方はこちら
      </Link>
    </form>
  )
}
