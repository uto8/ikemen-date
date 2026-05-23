'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/queries/messages'

type Props = {
  matchId: string
  currentUserId: string
  initialMessages: Message[]
  isPartnerActive: boolean
}

export default function ChatMessages({
  matchId,
  currentUserId,
  initialMessages,
  isPartnerActive,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 新着メッセージで最下部にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages])

  // Realtime サブスクライブ
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string
            sender_id: string | null
            content: string
            is_read: boolean
            created_at: string
          }
          setMessages((prev) => [
            ...prev,
            {
              id: row.id,
              senderId: row.sender_id,
              content: row.content,
              isRead: row.is_read,
              createdAt: row.created_at,
            },
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!isPartnerActive && (
        <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-700">
          相手のアカウントは退会済みです
        </div>
      )}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
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
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
