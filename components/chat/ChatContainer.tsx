'use client'

import { useState, useEffect, useRef } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { sendMessage } from '@/lib/actions/chat'
import type { Message } from '@/lib/queries/messages'
import ChatMessages from './ChatMessages'
import ChatInput from './ChatInput'

type Props = {
  matchId: string
  currentUserId: string
  initialMessages: Message[]
  isPartnerActive: boolean
  partnerId: string | null
  partnerAvatarUrl: string | null
  partnerNickname: string
}

export default function ChatContainer({
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
  // Track IDs we've already added optimistically to skip the Realtime duplicate
  const localIds = useRef<Set<string>>(new Set())

  // Realtime: incoming messages
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          const row = payload.new as {
            id: string
            sender_id: string | null
            content: string
            is_read: boolean
            created_at: string
          }
          // Skip if we already added this message via handleSend
          if (localIds.current.has(row.id)) {
            localIds.current.delete(row.id)
            return
          }
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev
            return [
              ...prev,
              {
                id: row.id,
                senderId: row.sender_id,
                content: row.content,
                isRead: row.is_read,
                createdAt: row.created_at,
              },
            ]
          })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  // Realtime: partner withdrawal
  useEffect(() => {
    if (!partnerId) return
    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`partner-withdraw-${matchId}`)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'profiles', filter: `id=eq.${partnerId}` },
        () => {
          setPartnerActive(false)
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId, partnerId])

  async function handleSend(content: string): Promise<{ error?: string }> {
    const result = await sendMessage(matchId, content)
    if (result?.error) return { error: result.error }
    if (result.message) {
      // Register the ID so the Realtime handler knows to skip it
      localIds.current.add(result.message.id)
      setMessages((prev) => [...prev, result.message!])
    }
    return {}
  }

  return (
    <>
      <ChatMessages
        currentUserId={currentUserId}
        messages={messages}
        partnerActive={partnerActive}
        partnerId={partnerId}
        partnerAvatarUrl={partnerAvatarUrl}
        partnerNickname={partnerNickname}
      />
      <ChatInput isPartnerActive={partnerActive} onSend={handleSend} />
    </>
  )
}
