import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calcAge } from '@/lib/utils/age'
import { IKEMEN_TYPES } from '@/lib/utils/ikemen-types'
import LogoutButton from '@/components/settings/LogoutButton'
import WithdrawButton from '@/components/settings/WithdrawButton'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, birth_date, prefecture, avatar_url, gender, occupation, height, bio, profile_ikemen_types(ikemen_type_id)')
    .eq('id', user.id)
    .single()

  const age = profile?.birth_date ? calcAge(new Date(profile.birth_date)) : null

  const ikemenTypeIds = (
    (profile?.profile_ikemen_types as { ikemen_type_id: number }[] | null) ?? []
  ).map((t) => t.ikemen_type_id)

  const ikemenTypeNames = IKEMEN_TYPES.filter((t) => ikemenTypeIds.includes(t.id)).map(
    (t) => t.name
  )

  const isMale = profile?.gender === 'male'

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <h1 className="font-bold text-gray-900">マイページ</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        {/* Profile card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.nickname ?? ''}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {profile?.nickname ?? 'ニックネーム未設定'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {age !== null ? `${age}歳` : ''}
                  {age !== null && profile?.prefecture ? ' · ' : ''}
                  {profile?.prefecture ?? ''}
                </p>
              </div>
            </div>
            <Link
              href="/settings/profile"
              className="text-xs text-primary-500 hover:underline"
            >
              編集する
            </Link>
          </div>

          {/* Info rows */}
          <div className="space-y-0 text-sm">
            <div className="flex items-center justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">年齢</span>
              <span className="font-semibold text-gray-900">
                {age !== null ? `${age}歳` : '未設定'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 py-2">
              <span className="text-gray-500">居住地</span>
              <span className="font-semibold text-gray-900">
                {profile?.prefecture ?? '未設定'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500">メールアドレス</span>
              <span className="max-w-[200px] truncate text-right font-semibold text-gray-900">
                {user.email}
              </span>
            </div>

            {/* Male-only fields */}
            {isMale && (
              <>
                {profile?.occupation && (
                  <div className="flex items-center justify-between border-t border-gray-100 py-2">
                    <span className="text-gray-500">職業</span>
                    <span className="font-semibold text-gray-900">{profile.occupation}</span>
                  </div>
                )}
                {profile?.height && (
                  <div className="flex items-center justify-between border-t border-gray-100 py-2">
                    <span className="text-gray-500">身長</span>
                    <span className="font-semibold text-gray-900">{profile.height}cm</span>
                  </div>
                )}
                {profile?.bio && (
                  <div className="border-t border-gray-100 py-2">
                    <p className="mb-2 text-gray-500">自己紹介</p>
                    <p className="leading-relaxed text-gray-900">{profile.bio}</p>
                  </div>
                )}
                {ikemenTypeNames.length > 0 && (
                  <div className="border-t border-gray-100 py-2">
                    <p className="mb-2 text-gray-500">イケメンタイプ</p>
                    <div className="flex flex-wrap gap-2">
                      {ikemenTypeNames.map((name) => (
                        <span
                          key={name}
                          className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-500"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <LogoutButton />
          <WithdrawButton />
        </div>
      </main>
    </>
  )
}
