import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calcAge } from '@/lib/utils/age'
import WithdrawButton from '@/components/settings/WithdrawButton'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, birth_date, prefecture, avatar_url')
    .eq('id', user.id)
    .single()

  const age =
    profile?.birth_date
      ? calcAge(new Date(profile.birth_date))
      : null

  return (
    <main className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">マイページ</h1>

      {/* profile card */}
      {profile && (
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.nickname ?? ''}
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
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-gray-900">
                {profile.nickname ?? 'ニックネーム未設定'}
              </p>
              <p className="text-sm text-gray-500">
                {age !== null ? `${age}歳` : ''}
                {age !== null && profile.prefecture ? '・' : ''}
                {profile.prefecture ?? ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-gray-700">プロフィール</h2>
        <Link
          href="/settings/profile"
          className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span>プロフィールを編集する</span>
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-medium text-gray-700">アカウント</h2>
        <p className="mb-4 text-xs text-gray-400">
          退会すると全てのデータが削除されます
        </p>
        <WithdrawButton />
      </div>
    </main>
  )
}
