'use client'

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
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <svg
          className="h-8 w-8 text-primary-500"
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
        <h1 className="mb-2 text-2xl font-bold">メールを確認してください</h1>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{email}</span>{' '}
          に確認メールを送信しました。
        </p>
        <p className="mt-1 text-sm text-gray-600">
          メール内のリンクをクリックして登録を完了してください。
        </p>
      </div>

      {serverError && (
        <p className="w-full rounded-md bg-error-50 px-3 py-2 text-center text-sm text-error-500">
          {serverError}
        </p>
      )}

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleResend}
          disabled={disabled}
          className="rounded-full bg-primary-500 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          {isPending
            ? '送信中…'
            : countdown > 0
              ? `再送信まで ${countdown} 秒`
              : '確認メールを再送信する'}
        </button>
        {countdown === 0 && !isPending && (
          <p className="text-xs text-gray-400">メールが届かない場合はご確認ください</p>
        )}
      </div>
    </div>
  )
}
