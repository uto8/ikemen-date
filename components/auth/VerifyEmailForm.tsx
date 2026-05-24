'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { resendConfirmationEmail } from '@/lib/actions/auth'

type Props = {
  email: string
}

export default function VerifyEmailForm({ email }: Props) {
  const [countdown, setCountdown] = useState(0)
  const [serverError, setServerError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function handleResend() {
    startTransition(async () => {
      const res = await resendConfirmationEmail(email)
      if (res.error) {
        setServerError(res.error)
        return
      }
      setServerError(undefined)
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    })
  }

  const disabled = isPending || countdown > 0

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
        <svg
          className="h-10 w-10 text-primary-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>

      <div className="text-center">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">確認メールを送りました</h1>
        <p className="text-sm text-primary-500 font-semibold">{email}</p>
        <p className="mt-2 text-sm text-gray-500">
          メール内のリンクをクリックして登録を完了してください。
        </p>
      </div>

      {serverError && (
        <p role="alert" className="w-full rounded-md bg-error-50 px-3 py-2 text-center text-sm text-error-500">
          {serverError}
        </p>
      )}

      <div className="flex w-full flex-col items-center gap-3">
        <button
          onClick={handleResend}
          disabled={disabled}
          className={`w-full rounded-full border-2 py-3.5 text-sm font-semibold transition-colors ${
            disabled
              ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
              : 'border-primary-500 text-primary-500 hover:bg-primary-50'
          }`}
        >
          {isPending
            ? '送信中…'
            : countdown > 0
              ? `あと ${countdown} 秒後に再送信できます`
              : '確認メールを再送信する'}
        </button>
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← ログイン画面に戻る
        </Link>
      </div>
    </div>
  )
}
