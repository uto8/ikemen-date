import Link from 'next/link'
import type { UserCardData } from '@/lib/queries/users'

type Props = {
  user: UserCardData
}

export default function UserCard({ user }: Props) {
  return (
    <Link href={`/users/${user.id}`} className="block">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md">
        {/* image area */}
        <div className="relative aspect-[3/4] bg-gray-100">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.nickname}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <svg
                className="h-16 w-16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          )}

          {/* ikemen type badge — male only */}
          {user.primaryIkemenType && (
            <span className="absolute bottom-2 left-2 rounded-full bg-primary-500 px-2 py-0.5 text-xs font-medium text-white">
              {user.primaryIkemenType}
            </span>
          )}
        </div>

        {/* info */}
        <div className="px-2 py-2">
          <p className="truncate text-sm font-semibold">{user.nickname}</p>
          <p className="text-xs text-gray-500">
            {user.age}歳・{user.prefecture}
          </p>
        </div>
      </div>
    </Link>
  )
}
