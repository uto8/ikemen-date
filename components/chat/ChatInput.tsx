'use client'

import { useState, useTransition } from 'react'
import { sendMessage } from '@/lib/actions/chat'

type Props = {
  matchId: string
}

const MAX_LENGTH = 500
const WARN_LENGTH = 450

export default function ChatInput({ matchId }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isDisabled = value.trim().length === 0 || isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isDisabled) return
    const content = value.trim()
    setError(null)
    startTransition(async () => {
      const result = await sendMessage(matchId, content)
      if (result?.error) {
        setError(result.error)
      } else {
        setValue('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white px-4 py-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={MAX_LENGTH}
            rows={1}
            placeholder="メッセージを入力"
            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
          <p
            className={`mt-0.5 text-right text-xs ${
              value.length > WARN_LENGTH ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {value.length} / {MAX_LENGTH} 文字
          </p>
        </div>
        <button
          type="submit"
          disabled={isDisabled}
          className="mb-5 rounded-full bg-pink-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          送信
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </form>
  )
}
