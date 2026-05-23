'use client'

import { useEffect } from 'react'
import { useMessageBadge } from './MessageBadgeProvider'

type Props = { matchId: string }

export default function ChatBadgeResetter({ matchId }: Props) {
  const { markMatchAsRead } = useMessageBadge()

  useEffect(() => {
    markMatchAsRead(matchId)
  }, [matchId, markMatchAsRead])

  return null
}
