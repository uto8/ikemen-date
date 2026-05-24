import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserById } from '@/lib/queries/users'
import { getLikeStatus } from '@/lib/queries/likes'
import LikeButton from '@/components/like-button/LikeButton'

type Props = { params: Promise<{ id: string }> }

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = await getUserById(id)
  if (!profile) notFound()

  const isSelf = user?.id === id
  const isMale = profile.gender === 'male'

  const likeStatus = !isSelf && user
    ? await getLikeStatus(user.id, id)
    : 'none'

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link href="/users" className="text-gray-500 hover:text-gray-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <span className="font-bold text-gray-900">プロフィール</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl pb-32">
        {/* Full-width avatar */}
        <div className="w-full overflow-hidden bg-gray-100 aspect-[3/4] max-h-[480px]">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.nickname}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="space-y-5 bg-white px-5 py-6">
          {/* Name & basic info */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.nickname}</h1>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span>{profile.age}歳</span>
              <span>{profile.prefecture}</span>
              {isMale && profile.occupation && <span>{profile.occupation}</span>}
              {isMale && profile.height && <span>{profile.height}cm</span>}
            </div>
          </div>

          {/* Ikemen type badges */}
          {isMale && profile.ikemenTypes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.ikemenTypes.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-500"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Divider + Bio */}
          {isMale && profile.bio && (
            <>
              <hr className="border-gray-100" />
              <div>
                <h2 className="mb-2 text-sm font-bold text-gray-900">自己紹介</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-500">{profile.bio}</p>
              </div>
            </>
          )}

          {isSelf && (
            <p className="text-center text-sm text-gray-400">自分のプロフィールです</p>
          )}
        </div>
      </main>

      {!isSelf && (
        <div className="fixed bottom-20 inset-x-0 z-20 px-4">
          <div className="mx-auto max-w-2xl">
            <LikeButton targetUserId={id} initialStatus={likeStatus} />
          </div>
        </div>
      )}
    </>
  )
}
