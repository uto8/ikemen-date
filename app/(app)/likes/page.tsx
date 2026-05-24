import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getReceivedLikes } from '@/lib/queries/likes'
import { updateLikesLastRead } from '@/lib/actions/like'
import LikeBadgeResetter from '@/components/navigation/LikeBadgeResetter'

export default async function LikesPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [likes] = await Promise.all([
    getReceivedLikes(user.id),
    updateLikesLastRead(),
  ])

  return (
    <main className="px-4 py-6">
      <LikeBadgeResetter />
      <h1 className="mb-6 text-xl font-bold">もらったいいね</h1>
      {likes.length === 0 ? (
        <p className="text-center text-sm text-gray-400">まだいいねをもらっていません</p>
      ) : (
        <ul className="space-y-3">
          {likes.map((like) => (
            <li key={like.likeId}>
              <Link href={`/users/${like.sender.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {like.sender.avatar_url ? (
                    <img
                      src={like.sender.avatar_url}
                      alt={like.sender.nickname}
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{like.sender.nickname}</p>
                  <p className="text-xs text-gray-500">
                    {like.sender.age}歳・{like.sender.prefecture}
                  </p>
                </div>
                <svg className="h-5 w-5 shrink-0 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
