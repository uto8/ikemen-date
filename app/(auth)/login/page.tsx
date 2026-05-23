import LoginForm from '@/components/auth/LoginForm'

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold">ログイン</h1>
        <LoginForm errorParam={error} />
      </div>
    </main>
  )
}
