'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import type { UserCardData } from '@/lib/queries/users'
import { loadMoreUsers, fetchUsersWithFilter } from '@/lib/actions/users'
import UserCard from './UserCard'
import IkemenTypeFilter from '@/components/user-filter/IkemenTypeFilter'

export type Props = {
  initialUsers: UserCardData[]
  initialNextCursor: string | null
  isFemaleUser: boolean
}

export default function UserGrid({ initialUsers, initialNextCursor, isFemaleUser = false }: Props) {
  const [users, setUsers] = useState<UserCardData[]>(initialUsers)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<string | null>(initialNextCursor)
  const selectedTypeIdRef = useRef<number | null>(null)

  useEffect(() => {
    cursorRef.current = nextCursor
  }, [nextCursor])

  useEffect(() => {
    selectedTypeIdRef.current = selectedTypeId
  }, [selectedTypeId])

  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        const cursor = cursorRef.current
        if (!cursor) return

        startTransition(async () => {
          const result = await loadMoreUsers(cursor, selectedTypeIdRef.current ?? undefined)
          setUsers((prev) => [...prev, ...result.users])
          setNextCursor(result.nextCursor)
        })
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  function handleTypeSelect(typeId: number | null) {
    startTransition(async () => {
      setSelectedTypeId(typeId)
      try {
        const result = await fetchUsersWithFilter(typeId ?? undefined)
        setUsers(result.users)
        setNextCursor(result.nextCursor)
        setFetchError(null)
      } catch {
        setFetchError('ユーザーの取得に失敗しました。画面を更新してください')
      }
    })
  }

  return (
    <div>
      {isFemaleUser && (
        <div className="mb-4">
          <button
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="flex w-full items-center justify-between px-1 py-2 text-sm font-medium text-gray-600"
          >
            <span className="flex items-center gap-2">
              絞り込み
              {selectedTypeId !== null && (
                <span className="h-2 w-2 rounded-full bg-primary-500" />
              )}
            </span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isFilterOpen && (
            <IkemenTypeFilter
              selectedTypeId={selectedTypeId}
              onSelect={handleTypeSelect}
              disabled={isPending}
            />
          )}
        </div>
      )}

      {fetchError ? (
        <p className="py-16 text-center text-sm text-gray-400">{fetchError}</p>
      ) : users.length === 0 && selectedTypeId !== null ? (
        <p className="py-16 text-center text-sm text-gray-400">
          このタイプに該当するユーザーはいません
        </p>
      ) : users.length === 0 ? (
        <p className="text-center text-sm text-gray-400">まだユーザーがいません</p>
      ) : (
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
      )}
    </div>
  )
}
