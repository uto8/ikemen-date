import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOppositeUsers } from '@/lib/queries/users'
import UserCard from '@/components/user-card/UserCard'

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

  const users = await getOppositeUsers(user.id, profile?.gender ?? '')

  return (
    <main className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">みんなを探す</h1>
      {users.length === 0 ? (
        <p className="text-center text-sm text-gray-400">まだユーザーがいません</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {users.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      )}
    </main>
  )
}
