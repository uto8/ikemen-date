'use client'

import type { Message } from '@/lib/queries/messages'

type Props = {
  matchId: string
  currentUserId: string
  initialMessages: Message[]
  isPartnerActive: boolean
}

// C-2 で Realtime サブスクライブを追加する
export default function ChatMessages({
  currentUserId,
  initialMessages,
  isPartnerActive,
}: Props) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!isPartnerActive && (
        <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-700">
          相手のアカウントは退会済みです
        </div>
      )}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {initialMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                msg.senderId === currentUserId
                  ? 'bg-pink-500 text-white'
                  : 'bg-white text-gray-900'
              }`}
            >
              {msg.senderId === null ? (
                <span className="italic text-gray-400">退会済みユーザー</span>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
