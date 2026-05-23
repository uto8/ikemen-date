import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUnreadLikeCount } from '@/lib/queries/likes'
import { getMatchesWithUnreadCounts } from '@/lib/queries/messages'
import LikeBadgeProvider from '@/components/navigation/LikeBadgeProvider'
import MessageBadgeProvider from '@/components/navigation/MessageBadgeProvider'
import BottomNav from '@/components/navigation/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [initialLikeCount, initialMatches] = await Promise.all([
    getUnreadLikeCount(user.id),
    getMatchesWithUnreadCounts(user.id),
  ])

  return (
    <LikeBadgeProvider userId={user.id} initialCount={initialLikeCount}>
      <MessageBadgeProvider userId={user.id} initialMatches={initialMatches}>
        <div className="pb-16">{children}</div>
        <BottomNav />
      </MessageBadgeProvider>
    </LikeBadgeProvider>
  )
}
