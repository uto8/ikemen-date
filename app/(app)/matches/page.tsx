import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getMyMatches } from '@/lib/queries/matches'

export default async function MatchesPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const matches = await getMyMatches(user.id)

  return (
    <main className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">マッチング</h1>
      {matches.length === 0 ? (
        <p className="text-center text-sm text-gray-400">まだマッチングしていません</p>
      ) : (
        <ul className="space-y-3">
          {matches.map((match) => (
            <li key={match.matchId}>
              <Link
                href={`/chat/${match.matchId}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <div className="relative h-14 w-14 shrink-0">
                  <div className="h-full w-full overflow-hidden rounded-full bg-gray-100">
                    {match.partner.avatar_url ? (
                      <img
                        src={match.partner.avatar_url}
                        alt={match.partner.nickname}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {match.unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-xs font-bold text-white">
                      {match.unreadCount > 99 ? '99+' : match.unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{match.partner.nickname}</p>
                  {match.lastMessage ? (
                    <p className="truncate text-xs text-gray-500">{match.lastMessage}</p>
                  ) : (
                    <p className="text-xs text-gray-400">まだメッセージがありません</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
