'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import type { UserCardData } from '@/lib/queries/users'
import { loadMoreUsers } from '@/lib/actions/users'
import UserCard from './UserCard'

type Props = {
  initialUsers: UserCardData[]
  initialNextCursor: string | null
}

export default function UserGrid({ initialUsers, initialNextCursor }: Props) {
  const [users, setUsers] = useState<UserCardData[]>(initialUsers)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<string | null>(initialNextCursor)

  useEffect(() => {
    cursorRef.current = nextCursor
  }, [nextCursor])

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        const cursor = cursorRef.current
        if (!cursor) return

        startTransition(async () => {
          const result = await loadMoreUsers(cursor)
          setUsers((prev) => [...prev, ...result.users])
          setNextCursor(result.nextCursor)
        })
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  if (users.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400">まだユーザーがいません</p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {users.map((u) => (
          <UserCard key={u.id} user={u} />
        ))}
      </div>

      {nextCursor && (
        <div ref={sentinelRef} className="mt-4 flex justify-center py-4">
          {isPending && (
            <span className="text-sm text-gray-400">読み込み中…</span>
          )}
        </div>
      )}
    </>
  )
}
