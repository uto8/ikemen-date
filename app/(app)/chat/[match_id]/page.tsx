import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getMatchParticipants } from '@/lib/queries/matches'
import { getMessages } from '@/lib/queries/messages'
import { markMessagesAsRead } from '@/lib/actions/chat'
import ChatMessages from '@/components/chat/ChatMessages'
import ChatInput from '@/components/chat/ChatInput'
import ChatBadgeResetter from '@/components/navigation/ChatBadgeResetter'

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

  const [messages] = await Promise.all([
    getMessages(match_id),
    markMessagesAsRead(match_id),
  ])

  return (
    <main className="flex h-[calc(100dvh-4rem)] flex-col">
      <ChatBadgeResetter matchId={match_id} />
      <ChatMessages
        matchId={match_id}
        currentUserId={user.id}
        initialMessages={messages}
        isPartnerActive={participants.isPartnerActive}
        partnerId={participants.partnerId}
      />
      <ChatInput matchId={match_id} />
    </main>
  )
}
