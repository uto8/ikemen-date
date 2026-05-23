'use client'

import { useState, useTransition } from 'react'
import { sendLike } from '@/lib/actions/like'
import type { LikeStatus } from '@/lib/queries/likes'

type Props = {
  targetUserId: string
  initialStatus: LikeStatus
}

export default function LikeButton({ targetUserId, initialStatus }: Props) {
  const [status, setStatus] = useState<LikeStatus>(initialStatus)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isSent = status === 'sent'

  function handleClick() {
    if (isSent) return
    setError(null)
    startTransition(async () => {
      const result = await sendLike(targetUserId)
      if (result?.error) {
        setError(result.error)
      } else {
        setStatus('sent')
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isSent || isPending}
        className={
          isSent
            ? 'w-full rounded-full bg-gray-200 py-3 text-sm font-medium text-gray-400'
            : 'w-full rounded-full bg-pink-500 py-3 text-sm font-medium text-white active:opacity-80 disabled:opacity-60'
        }
      >
        {isSent ? 'いいね済み' : isPending ? '送信中…' : 'いいね ♡'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
