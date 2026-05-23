'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type LikeBadgeContextValue = {
  count: number
  reset: () => void
}

export const LikeBadgeContext = createContext<LikeBadgeContextValue>({
  count: 0,
  reset: () => {},
})

export function useLikeBadge() {
  return useContext(LikeBadgeContext)
}

type Props = {
  userId: string
  initialCount: number
  children: React.ReactNode
}

export default function LikeBadgeProvider({ userId, initialCount, children }: Props) {
  const [count, setCount] = useState(initialCount)

  const reset = useCallback(() => setCount(0), [])

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const channel = supabase
      .channel('like-badge')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          setCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <LikeBadgeContext.Provider value={{ count, reset }}>
      {children}
    </LikeBadgeContext.Provider>
  )
}
