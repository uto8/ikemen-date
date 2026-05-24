import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOppositeUsers } from '@/lib/queries/users'
import UserGrid from '@/components/user-card/UserGrid'

export default async function UsersPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', user.id)
    .single()

  const { users, nextCursor } = await getOppositeUsers(user.id, profile?.gender ?? '')

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">みんなを探す</h1>
      <UserGrid initialUsers={users} initialNextCursor={nextCursor} isFemaleUser={profile?.gender === 'female'} />
    </main>
  )
}
