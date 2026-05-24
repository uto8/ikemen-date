import Link from 'next/link'
import type { MatchWithPartner } from '@/lib/queries/matches'

type Props = {
  matches: MatchWithPartner[]
  currentMatchId: string
}

export default function MatchesSidebar({ matches, currentMatchId }: Props) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-sm font-bold text-gray-900">マッチング</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {matches.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-gray-400">
            まだマッチングしていません
          </p>
        ) : (
          <ul>
            {matches.map((match) => (
              <li key={match.matchId}>
                <Link
                  href={`/chat/${match.matchId}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${
                    match.matchId === currentMatchId ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="relative h-10 w-10 shrink-0">
                    <div className="h-full w-full overflow-hidden rounded-full bg-gray-100">
                      {match.partner.avatar_url ? (
                        <img
                          src={match.partner.avatar_url}
                          alt={match.partner.nickname}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {match.unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
                        {match.unreadCount > 99 ? '99+' : match.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-semibold ${
                        match.matchId === currentMatchId ? 'text-primary-500' : 'text-gray-900'
                      }`}
                    >
                      {match.partner.nickname}
                    </p>
                    {match.lastMessage ? (
                      <p className="truncate text-xs text-gray-500">{match.lastMessage}</p>
                    ) : (
                      <p className="text-xs text-gray-400">メッセージを送ってみよう</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
