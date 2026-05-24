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
        <p role="alert" className="rounded-md bg-warning-50 px-3 py-2 text-sm text-warning-500">
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
          className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {serverError && (
        <p role="alert" className="rounded-md bg-error-50 px-3 py-2 text-sm text-error-500">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-primary-500 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
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
