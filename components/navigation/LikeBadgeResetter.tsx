'use client'

import { useEffect } from 'react'
import { useLikeBadge } from './LikeBadgeProvider'

export default function LikeBadgeResetter() {
  const { reset } = useLikeBadge()

  useEffect(() => {
    reset()
  }, [reset])

  return null
}
