'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/actions/auth'

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await forgotPassword(formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          パスワードリセット用のメールを送信しました。メールをご確認ください。
        </p>
        <Link href="/login" className="text-sm text-pink-500 hover:underline">
          ログイン画面に戻る
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <p className="text-sm text-gray-500">
        登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
      </p>

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

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-pink-500 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
      >
        {isPending ? '送信中…' : 'リセットメールを送信'}
      </button>

      <Link href="/login" className="text-center text-sm text-gray-400 hover:underline">
        ログイン画面に戻る
      </Link>
    </form>
  )
}
