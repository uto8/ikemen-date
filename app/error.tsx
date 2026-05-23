'use client'

import { useEffect } from 'react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-5xl font-bold text-gray-200">500</p>
      <h1 className="mb-2 text-xl font-bold text-gray-800">エラーが発生しました</h1>
      <p className="mb-8 text-sm text-gray-500">
        しばらく経ってから再度お試しください。
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-pink-500 px-6 py-2 text-sm font-semibold text-white hover:bg-pink-600"
      >
        再試行する
      </button>
    </main>
  )
}
