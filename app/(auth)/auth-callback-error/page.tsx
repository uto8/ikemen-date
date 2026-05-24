import Link from 'next/link'

export default function AuthCallbackErrorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex shrink-0 justify-center pb-4 pt-8">
        <span className="text-xl font-bold tracking-tight text-primary-500">
          イケメンデート
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-24">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-error-50">
          <svg
            className="h-8 w-8 text-error-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <div className="max-w-xs space-y-2 text-center">
          <h1 className="text-lg font-bold leading-snug text-gray-900">
            確認リンクの有効期限が切れています
          </h1>
          <p className="text-sm leading-relaxed text-gray-500">
            再度ログインして、確認メールを再送信してください。
          </p>
        </div>

        <Link
          href="/login"
          className="w-full max-w-xs rounded-full bg-primary-500 py-3 text-center font-bold text-white transition-colors hover:bg-primary-600 active:bg-primary-600"
        >
          ログイン画面へ
        </Link>
      </main>
    </div>
  )
}
