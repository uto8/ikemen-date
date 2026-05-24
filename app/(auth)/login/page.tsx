import Link from 'next/link'
import AuthHeader from '@/components/auth/AuthHeader'
import LoginForm from '@/components/auth/LoginForm'

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <>
      <AuthHeader />
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">ログイン</h1>
        <p className="mb-8 text-sm text-gray-500">おかえりなさい</p>
        <LoginForm errorParam={error} />
        <p className="mt-6 text-center text-sm text-gray-500">
          アカウントをお持ちでない方は{' '}
          <Link href="/register" className="font-medium text-primary-500 hover:text-primary-600">
            新規登録
          </Link>
        </p>
      </main>
    </>
  )
}
