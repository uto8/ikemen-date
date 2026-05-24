'use client'

import { useState, useTransition } from 'react'
import { resetPassword } from '@/lib/actions/auth'

export default function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await resetPassword(formData)
      if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          新しいパスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="英数字を含む8文字以上"
          className="w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-error-50 px-3 py-2 text-sm text-error-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-primary-500 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        {isPending ? '更新中…' : 'パスワードを更新する'}
      </button>
    </form>
  )
}
