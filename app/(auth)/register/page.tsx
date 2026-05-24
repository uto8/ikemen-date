import Link from 'next/link'
import AuthHeader from '@/components/auth/AuthHeader'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <>
      <AuthHeader />
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">新規登録</h1>
        <p className="mb-8 text-sm text-gray-500">アカウントを作成して始めましょう</p>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="font-medium text-primary-500 hover:text-primary-600">
            ログイン
          </Link>
        </p>
      </main>
    </>
  )
}
