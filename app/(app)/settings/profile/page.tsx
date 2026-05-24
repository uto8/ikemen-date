import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/queries/users'
import FemaleProfileEditForm from '@/components/profile/FemaleProfileEditForm'
import MaleProfileEditForm from '@/components/profile/MaleProfileEditForm'

export default async function ProfileEditPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getMyProfile(user.id)
  if (!profile) redirect('/settings')

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">
          ← 設定
        </Link>
        <h1 className="text-xl font-bold">プロフィール編集</h1>
      </div>

      {profile.gender === 'male' ? (
        <MaleProfileEditForm
          initialData={{
            nickname: profile.nickname,
            prefecture: profile.prefecture,
            avatarUrl: profile.avatar_url,
            occupation: profile.occupation,
            height: profile.height,
            bio: profile.bio,
            ikemenTypeIds: profile.ikemenTypeIds,
          }}
        />
      ) : (
        <FemaleProfileEditForm
          initialData={{
            nickname: profile.nickname,
            prefecture: profile.prefecture,
            avatarUrl: profile.avatar_url,
          }}
        />
      )}
    </main>
  )
}
