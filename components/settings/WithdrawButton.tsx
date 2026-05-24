'use client'

import { useState, useTransition } from 'react'
import { withdrawUser } from '@/lib/actions/user'

export default function WithdrawButton() {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await withdrawUser()
      if (result?.error) setError(result.error)
    })
  }

  if (confirming) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="mb-2 text-center font-bold text-gray-900">退会しますか？</p>
        <p className="mb-4 text-center text-xs leading-relaxed text-gray-500">
          退会すると元に戻せません。<br />
          プロフィールといいねは即時削除されます。
        </p>
        {error && (
          <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-center text-xs text-red-500">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm text-gray-500 disabled:opacity-40"
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 rounded-full bg-error-500 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {isPending ? '処理中…' : '退会する'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center pt-2">
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-error-500 hover:underline"
      >
        退会する
      </button>
    </div>
  )
}
