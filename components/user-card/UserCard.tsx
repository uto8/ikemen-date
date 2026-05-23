import type { UserCardData } from '@/lib/queries/users'

type Props = {
  user: UserCardData
}

// G-2 で実装予定
export default function UserCard({ user }: Props) {
  return (
    <div className="rounded-xl bg-gray-100 p-3 text-sm">
      <p className="font-medium">{user.nickname}</p>
      <p className="text-gray-500">{user.age}歳・{user.prefecture}</p>
      {user.primaryIkemenType && (
        <p className="text-xs text-pink-500">{user.primaryIkemenType}</p>
      )}
    </div>
  )
}
