'use client'

import { useState, useTransition } from 'react'
import { withdrawUser } from '@/lib/actions/user'

export default function WithdrawButton() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleWithdraw() {
    if (
      !window.confirm(
        '退会すると全てのデータが削除されます。\n本当に退会しますか？'
      )
    )
      return

    setError(null)
    startTransition(async () => {
      const result = await withdrawUser()
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div>
      <button
        onClick={handleWithdraw}
        disabled={isPending}
        className="w-full rounded-xl py-3 text-sm font-medium text-red-500 disabled:opacity-40"
      >
        {isPending ? '処理中...' : '退会する'}
      </button>
      {error && <p className="mt-1 text-center text-xs text-red-500">{error}</p>}
    </div>
  )
}
