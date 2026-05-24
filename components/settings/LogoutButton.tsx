'use client'

import { useState, useTransition } from 'react'
import { logoutUser } from '@/lib/actions/user'

export default function LogoutButton() {
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      await logoutUser()
    })
  }

  if (confirming) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="mb-4 text-center font-bold text-gray-900">ログアウトしますか？</p>
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
            className="flex-1 rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            {isPending ? '処理中…' : 'ログアウト'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full rounded-full border-2 border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300"
    >
      ログアウト
    </button>
  )
}
