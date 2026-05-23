import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getMatchParticipants } from '@/lib/queries/matches'
import { getMessages } from '@/lib/queries/messages'
import { markMessagesAsRead } from '@/lib/actions/chat'
import ChatMessages from '@/components/chat/ChatMessages'
import ChatInput from '@/components/chat/ChatInput'

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
    <main className="flex h-screen flex-col">
      <ChatMessages
        matchId={match_id}
        currentUserId={user.id}
        initialMessages={messages}
        isPartnerActive={participants.isPartnerActive}
      />
      <ChatInput matchId={match_id} />
    </main>
  )
}
