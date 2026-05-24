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
    <main className="pb-32">
      {/* full-width avatar */}
      <div className="relative w-full aspect-[3/4] bg-gray-100">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.nickname}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        {/* name + basic info */}
        <h1 className="mb-1 text-xl font-bold">{profile.nickname}</h1>
        <p className="mb-4 text-sm text-gray-500">
          {profile.age}歳・{profile.prefecture}
        </p>

        {/* male-only details */}
        {isMale && (
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm space-y-4">
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
                      className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-500"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isSelf && (
          <p className="text-center text-sm text-gray-400">自分のプロフィールです</p>
        )}
      </div>

      {!isSelf && (
        <div className="fixed bottom-16 inset-x-0 px-4 pb-4">
          <LikeButton targetUserId={id} initialStatus={likeStatus} />
        </div>
      )}
    </main>
  )
}
