import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-6xl font-bold text-gray-200">404</p>
      <h1 className="mb-2 text-xl font-bold text-gray-800">ページが見つかりません</h1>
      <p className="mb-8 text-sm text-gray-500">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link
        href="/"
        className="rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white hover:bg-pink-600"
      >
        トップへ戻る
      </Link>
    </main>
  )
}
