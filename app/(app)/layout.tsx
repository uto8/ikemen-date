import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUnreadLikeCount } from '@/lib/queries/likes'
import LikeBadgeProvider from '@/components/navigation/LikeBadgeProvider'
import BottomNav from '@/components/navigation/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const initialLikeCount = await getUnreadLikeCount(user.id)

  return (
    <LikeBadgeProvider userId={user.id} initialCount={initialLikeCount}>
      <div className="pb-16">{children}</div>
      <BottomNav />
    </LikeBadgeProvider>
  )
}
