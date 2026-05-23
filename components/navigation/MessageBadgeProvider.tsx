'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { MatchUnreadInfo } from '@/lib/queries/messages'

type MessageBadgeContextValue = {
  count: number
  markMatchAsRead: (matchId: string) => void
}

export const MessageBadgeContext = createContext<MessageBadgeContextValue>({
  count: 0,
  markMatchAsRead: () => {},
})

export function useMessageBadge() {
  return useContext(MessageBadgeContext)
}

type Props = {
  userId: string
  initialMatches: MatchUnreadInfo[]
  children: React.ReactNode
}

function buildInitialCounts(matches: MatchUnreadInfo[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const { matchId, unreadCount } of matches) {
    map[matchId] = unreadCount
  }
  return map
}

function sumCounts(map: Record<string, number>): number {
  return Object.values(map).reduce((sum, n) => sum + n, 0)
}

export default function MessageBadgeProvider({ userId, initialMatches, children }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(
    () => buildInitialCounts(initialMatches)
  )

  const userIdRef = useRef(userId)
  const initialMatchesRef = useRef(initialMatches)

  // Realtime subscriptions per match (runs once on mount)
  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const currentUserId = userIdRef.current

    const channels = initialMatchesRef.current.map(({ matchId }) =>
      supabase
        .channel(`msg-badge-${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${matchId}`,
          },
          (payload) => {
            const row = payload.new as { sender_id: string | null }
            if (row.sender_id !== null && row.sender_id !== currentUserId) {
              setCounts((prev) => ({
                ...prev,
                [matchId]: (prev[matchId] ?? 0) + 1,
              }))
            }
          }
        )
        .subscribe()
    )

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch))
    }
  }, [])

  const markMatchAsRead = useCallback((matchId: string) => {
    setCounts((prev) => {
      if ((prev[matchId] ?? 0) === 0) return prev
      return { ...prev, [matchId]: 0 }
    })
  }, [])

  return (
    <MessageBadgeContext.Provider value={{ count: sumCounts(counts), markMatchAsRead }}>
      {children}
    </MessageBadgeContext.Provider>
  )
}
