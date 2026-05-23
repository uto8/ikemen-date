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
    <main className="px-4 pb-32 pt-6">
      {/* avatar */}
      <div className="relative mx-auto mb-4 aspect-square w-40 overflow-hidden rounded-2xl bg-gray-100">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.nickname}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
      </div>

      {/* name + basic info */}
      <h1 className="mb-1 text-center text-xl font-bold">{profile.nickname}</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        {profile.age}歳・{profile.prefecture}
      </p>

      {/* male-only details */}
      {isMale && (
        <div className="mb-6 space-y-4">
          {profile.occupation && (
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-gray-400">職業</span>
              <span className="text-sm">{profile.occupation}</span>
            </div>
          )}
          {profile.height && (
            <div className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-gray-400">身長</span>
              <span className="text-sm">{profile.height}cm</span>
            </div>
          )}
          {profile.bio && (
            <div>
              <p className="mb-1 text-xs text-gray-400">自己紹介</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
          {profile.ikemenTypes.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-gray-400">イケメンタイプ</p>
              <div className="flex flex-wrap gap-2">
                {profile.ikemenTypes.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isSelf && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4">
          <div className="w-full max-w-sm">
            <LikeButton targetUserId={id} initialStatus={likeStatus} />
          </div>
        </div>
      )}

      {isSelf && (
        <p className="text-center text-sm text-gray-400">自分のプロフィールです</p>
      )}
    </main>
  )
}
