import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getMatchParticipants, getMyMatches } from '@/lib/queries/matches'
import { getMessages } from '@/lib/queries/messages'
import { markMessagesAsRead } from '@/lib/actions/chat'
import ChatMessages from '@/components/chat/ChatMessages'
import ChatInput from '@/components/chat/ChatInput'
import ChatBadgeResetter from '@/components/navigation/ChatBadgeResetter'
import MatchesSidebar from '@/components/chat/MatchesSidebar'

type Props = { params: Promise<{ match_id: string }> }

export default async function ChatPage({ params }: Props) {
  const { match_id } = await params

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const participants = await getMatchParticipants(match_id, user.id)
  if (!participants.isParticipant) redirect('/matches')

  const [messages, matches] = await Promise.all([
    getMessages(match_id),
    getMyMatches(user.id),
    markMessagesAsRead(match_id),
  ])

  const partner = matches.find((m) => m.matchId === match_id)?.partner ?? null

  return (
    <div className="mx-auto flex h-[calc(100dvh-5rem)] w-full max-w-2xl">
      <MatchesSidebar matches={matches} currentMatchId={match_id} />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="flex h-14 items-center gap-3 px-4">
            <Link href="/matches" className="text-gray-500 hover:text-gray-900">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
              {partner?.avatar_url ? (
                <img
                  src={partner.avatar_url}
                  alt={partner.nickname}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {partner?.nickname ?? '退会済みユーザー'}
              </p>
              {partner && (
                <p className="text-xs text-gray-400">
                  {partner.age}歳 · {partner.prefecture}
                </p>
              )}
            </div>
          </div>
        </header>

        <ChatBadgeResetter matchId={match_id} />
        <ChatMessages
          matchId={match_id}
          currentUserId={user.id}
          initialMessages={messages}
          isPartnerActive={participants.isPartnerActive}
          partnerId={participants.partnerId}
          partnerAvatarUrl={partner?.avatar_url ?? null}
          partnerNickname={partner?.nickname ?? ''}
        />
        <ChatInput matchId={match_id} isPartnerActive={participants.isPartnerActive} />
      </main>
    </div>
  )
}
