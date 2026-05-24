'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/queries/messages'
import Link from 'next/link'

type Props = {
  matchId: string
  currentUserId: string
  initialMessages: Message[]
  isPartnerActive: boolean
  partnerId: string | null
  partnerAvatarUrl: string | null
  partnerNickname: string
}

function formatMsgTime(isoStr: string): string {
  const d = new Date(isoStr)
  const today = new Date()
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  if (isToday) return `${hh}:${mm}`
  return `${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm}`
}

export default function ChatMessages({
  matchId,
  currentUserId,
  initialMessages,
  isPartnerActive,
  partnerId,
  partnerAvatarUrl,
  partnerNickname,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [partnerActive, setPartnerActive] = useState(isPartnerActive)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView()
  }, [messages])

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
    return () => { supabase.removeChannel(channel) }
  }, [matchId])

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
        () => { setPartnerActive(false) }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
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
    const today = new Date().toISOString().slice(0, 10)
    if (iso === today) return '今日'
    const [y, m, d] = iso.split('-')
    return `${y}年${Number(m)}月${Number(d)}日`
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {groupedMessages.map(({ date, msgs }) => (
          <div key={date} className="space-y-4">
            {/* Date divider */}
            <div className="flex items-center gap-3 my-2">
              <hr className="flex-1 border-gray-200" />
              <span className="flex-shrink-0 text-xs text-gray-400">{formatDateLabel(date)}</span>
              <hr className="flex-1 border-gray-200" />
            </div>

            {msgs.map((msg) => {
              const isOwn = msg.senderId === currentUserId
              const isRetired = msg.senderId === null

              if (isOwn) {
                return (
                  <div key={msg.id} className="flex items-end justify-end gap-2">
                    <div className="max-w-[72%]">
                      <div className="rounded-2xl rounded-br-sm bg-primary-500 px-4 py-3 shadow-sm">
                        <p className="text-sm leading-relaxed text-white">{msg.content}</p>
                      </div>
                      <p className="mt-1 mr-1 text-right text-xs text-gray-400">
                        {formatMsgTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              }

              if (isRetired) {
                return (
                  <div key={msg.id} className="flex items-end gap-2 opacity-60">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                    <div className="max-w-[72%]">
                      <p className="mb-1 text-xs text-gray-400">退会済みユーザー</p>
                      <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
                        <p className="text-sm leading-relaxed text-gray-500">{msg.content}</p>
                      </div>
                      <p className="ml-1 mt-1 text-xs text-gray-400">{formatMsgTime(msg.createdAt)}</p>
                    </div>
                  </div>
                )
              }

              // Partner message
              return (
                <div key={msg.id} className="flex items-end gap-2">
                  <Link href={`/users/${partnerId}`}>
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                      {partnerAvatarUrl ? (
                        <img
                          src={partnerAvatarUrl}
                          alt={partnerNickname}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="max-w-[72%]">
                    <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                      <p className="text-sm leading-relaxed text-gray-900">{msg.content}</p>
                    </div>
                    <p className="ml-1 mt-1 text-xs text-gray-400">{formatMsgTime(msg.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Withdrawn banner — shown below messages, above input */}
      {!partnerActive && (
        <div className="flex-shrink-0 px-4 py-2">
          <div className="rounded-md border border-yellow-200 bg-warning-50 px-4 py-2.5 text-center text-xs text-warning-500">
            相手が退会しました。このチャットは利用できません
          </div>
        </div>
      )}
    </div>
  )
}
