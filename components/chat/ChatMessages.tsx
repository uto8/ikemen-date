'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/queries/messages'

type Props = {
  matchId: string
  currentUserId: string
  initialMessages: Message[]
  isPartnerActive: boolean
  partnerId: string | null
}

export default function ChatMessages({
  matchId,
  currentUserId,
  initialMessages,
  isPartnerActive,
  partnerId,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [partnerActive, setPartnerActive] = useState(isPartnerActive)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 新着メッセージで最下部にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages])

  // メッセージ Realtime サブスクライブ
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

  // パートナー退会 Realtime サブスクライブ
  useEffect(() => {
    if (!partnerId) return

    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel(`partner-withdraw-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${partnerId}`,
        },
        () => {
          setPartnerActive(false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, partnerId])

  const groupedMessages = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const d = msg.createdAt.slice(0, 10)
    const last = acc.at(-1)
    if (last && last.date === d) {
      last.msgs.push(msg)
    } else {
      acc.push({ date: d, msgs: [msg] })
    }
    return acc
  }, [])

  function formatDateLabel(iso: string) {
    const [y, m, d] = iso.split('-')
    return `${y}年${Number(m)}月${Number(d)}日`
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {!partnerActive && (
        <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-700">
          相手のアカウントは退会済みです
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {groupedMessages.map(({ date, msgs }) => (
          <div key={date}>
            {/* date separator */}
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">{formatDateLabel(date)}</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <div className="space-y-2">
              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 text-sm ${
                      msg.senderId === currentUserId
                        ? 'rounded-2xl rounded-br-sm bg-primary-500 text-white'
                        : 'rounded-2xl rounded-bl-sm bg-white text-gray-900 shadow-xs'
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
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
