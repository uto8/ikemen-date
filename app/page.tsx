import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const IKEMEN_TYPES = [
  { src: '/charamote.png', label: 'チャラ目' },
  { src: '/inukeikareshi.png', label: '犬系彼氏' },
  { src: '/kawaii.png', label: 'かわいい系' },
  { src: '/koreaidol.png', label: '韓国アイドル系' },
  { src: '/numagaomistery.png', label: '沼顔ミステリー' },
  { src: '/odouidol.png', label: '踊るアイドル' },
  { src: '/sawayakasports.png', label: '爽やかスポーツ' },
  { src: '/siogaocool.png', label: '塩顔クール' },
  { src: '/toshiueonisan.png', label: '年上お兄さん' },
  { src: '/tyuseibiyou.png', label: '中性美容系' },
  { src: '/wildiroke.png', label: 'ワイルド色気' },
  { src: '/youkyamoodmaker.png', label: '陽キャムードメーカー' },
]

export default async function RootPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/users')

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-900 text-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-gray-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-lg font-black tracking-tight text-transparent">
            イケメンデート
          </span>
          <Link
            href="/login"
            className="text-sm text-gray-400 transition-colors hover:text-primary-400"
          >
            ログイン
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-gray-900 pt-14">
        {/* Glow blobs */}
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-primary-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[100px]" />

        <div className="relative mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-4 py-24 md:grid-cols-2">
          {/* Left: Copy */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-400">
                完全無料・課金なし
              </span>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
              理想のイケメンと、
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                青春のときめきを。
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-gray-400 md:text-lg">
              イケメン男性と出会いたい女性のためのマッチングアプリ。双方向いいねでマッチング成立、テキストチャットで話しかけよう。
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-cyan-400 px-8 py-4 text-base font-bold text-gray-900 shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5 hover:scale-105 hover:shadow-primary-500/50"
              >
                無料で始める →
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-gray-300 transition-all hover:border-white/40 hover:text-white"
              >
                ログイン
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-600">登録費・月額費・追加課金一切なし</p>
          </div>

          {/* Right: Image collage (desktop only) */}
          <div className="hidden grid-cols-2 gap-3 md:grid">
            {IKEMEN_TYPES.slice(0, 4).map((type, i) => (
              <div
                key={type.src}
                className={`relative overflow-hidden rounded-2xl ring-1 ring-white/10 ${i % 2 === 1 ? 'mt-8' : ''} aspect-[3/4] shadow-2xl`}
              >
                <Image src={type.src} alt={type.label} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-primary-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {type.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee 1 */}
      <div className="overflow-hidden border-y border-white/5 bg-white/5 py-7">
        <div className="animate-marquee flex w-max gap-4">
          {[...IKEMEN_TYPES, ...IKEMEN_TYPES].map((type, i) => (
            <div
              key={i}
              className="relative h-44 w-32 flex-none overflow-hidden rounded-2xl ring-1 ring-white/10"
            >
              <Image src={type.src} alt={type.label} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent" />
              <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-white/90">
                {type.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="bg-gray-900 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-primary-400">
            How it works
          </p>
          <h2 className="mb-14 text-center text-3xl font-black text-white">3ステップで出会える</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'ギャラリーを眺める',
                desc: 'イケメンタイプ別にカード形式で一覧表示。気になる相手を見つけよう。',
                gradient: 'from-primary-500 to-cyan-400',
              },
              {
                step: '02',
                title: 'いいねを送る',
                desc: '気になった相手にいいねを送ろう。相手もいいねを返してくれたらマッチング成立。',
                gradient: 'from-blue-500 to-primary-500',
              },
              {
                step: '03',
                title: 'チャットで話しかける',
                desc: 'マッチング後はテキストチャットで自由に会話。まずは気軽にメッセージを。',
                gradient: 'from-purple-500 to-blue-500',
              },
            ].map(({ step, title, desc, gradient }) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10"
              >
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-lg font-black text-white shadow-lg`}
                >
                  {step}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee 2 (reverse) */}
      <div className="overflow-hidden border-y border-white/5 bg-white/5 py-7">
        <div className="animate-marquee-reverse flex w-max gap-4">
          {[...IKEMEN_TYPES.slice(6), ...IKEMEN_TYPES.slice(6)].map((type, i) => (
            <div
              key={i}
              className="relative h-44 w-32 flex-none overflow-hidden rounded-2xl ring-1 ring-white/10"
            >
              <Image src={type.src} alt={type.label} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent" />
              <span className="absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-white/90">
                {type.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="relative overflow-hidden px-4 py-28 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-gray-900 to-blue-600/10" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/10 blur-[100px]" />
        <div className="relative">
          <h2 className="mb-4 text-3xl font-black text-white md:text-5xl">
            さあ、
            <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">
              始めてみよう
            </span>
          </h2>
          <p className="mb-10 text-lg text-gray-400">登録は1分で完了。完全無料です。</p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-cyan-400 px-14 py-5 text-lg font-bold text-gray-900 shadow-2xl shadow-primary-500/30 transition-all hover:-translate-y-1 hover:scale-105 hover:shadow-primary-500/50"
          >
            無料で始める →
          </Link>
          <p className="mt-6 text-sm text-gray-600">登録費・月額費・追加課金一切なし</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gray-900 px-4 py-8 text-center">
        <p className="mb-1 bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text font-bold text-transparent">
          イケメンデート
        </p>
        <p className="text-xs text-gray-600">© 2026 ikemen-date. All rights reserved.</p>
      </footer>
    </div>
  )
}
