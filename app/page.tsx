import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/users')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight text-primary-500">
            イケメンデート
          </span>
          <Link
            href="/login"
            className="text-sm text-gray-500 transition-colors hover:text-primary-500"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-500">
            完全無料・課金なし
          </p>
          <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            理想のイケメンと、
            <br className="md:hidden" />
            青春のときめきを。
          </h1>
          <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-gray-500 md:text-lg">
            イケメン男性と出会いたい女性のためのマッチングアプリ。
            <br />
            双方向いいねでマッチング成立、テキストチャットで話しかけてみよう。
          </p>
          <Link
            href="/register"
            className="inline-block rounded-full bg-primary-500 px-10 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
          >
            無料で始める
          </Link>
          <p className="mt-4 text-xs text-gray-400">登録費・月額費・追加課金一切なし</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900">
            3ステップで出会える
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                <svg
                  className="h-7 w-7 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">ギャラリーを眺める</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                イケメンタイプ別にカード形式で一覧表示。気になる相手を見つけよう。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                <svg
                  className="h-7 w-7 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">いいねを送る</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                気になった相手にいいねを送ろう。相手もいいねを返してくれたらマッチング成立。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                <svg
                  className="h-7 w-7 text-primary-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-lg font-bold text-gray-900">チャットで話しかける</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                マッチング後はテキストチャットで自由に会話。まずは気軽にメッセージを。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-primary-50 px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">さあ、始めてみよう</h2>
        <p className="mb-8 text-gray-500">登録は1分で完了します</p>
        <Link
          href="/register"
          className="inline-block rounded-full bg-primary-500 px-10 py-4 font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
        >
          無料で始める
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-8 text-center">
        <p className="mb-2 font-bold text-primary-500">イケメンデート</p>
        <p className="text-xs text-gray-400">© 2026 ikemen-date. All rights reserved.</p>
      </footer>
    </div>
  )
}
