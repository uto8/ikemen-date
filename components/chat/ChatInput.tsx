'use client'

import { useState, useTransition } from 'react'
import { sendMessage } from '@/lib/actions/chat'

type Props = {
  matchId: string
  isPartnerActive: boolean
}

const MAX_LENGTH = 500
const WARN_LENGTH = 450

export default function ChatInput({ matchId, isPartnerActive }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isDisabled = value.trim().length === 0 || isPending || !isPartnerActive

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
    <form onSubmit={handleSubmit} className="flex-shrink-0 border-t border-gray-200 bg-white">
      <div className="px-4 py-3">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={1}
              placeholder="メッセージを入力..."
              disabled={!isPartnerActive}
              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ minHeight: 44, maxHeight: 120 }}
            />
            <p
              className={`mt-1 text-right text-xs ${
                value.length > WARN_LENGTH ? 'text-error-500' : 'text-gray-400'
              }`}
            >
              {value.length} / {MAX_LENGTH}
            </p>
          </div>
          <button
            type="submit"
            disabled={isDisabled}
            className="mb-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-500 shadow-sm transition-colors hover:bg-primary-600 disabled:opacity-40"
          >
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
        {error && <p role="alert" className="mt-1 text-xs text-error-500">{error}</p>}
      </div>
    </form>
  )
}
