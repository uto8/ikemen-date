import Link from 'next/link'
import WithdrawButton from '@/components/settings/WithdrawButton'

export default function SettingsPage() {
  return (
    <main className="px-4 py-6">
      <h1 className="mb-8 text-xl font-bold">設定</h1>

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium text-gray-700">プロフィール</h2>
        <Link
          href="/settings/profile"
          className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm hover:bg-gray-50"
        >
          <span>プロフィールを編集する</span>
          <span className="text-gray-400">›</span>
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
