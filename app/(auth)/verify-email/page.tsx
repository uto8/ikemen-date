import VerifyEmailForm from '@/components/auth/VerifyEmailForm'

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <VerifyEmailForm email={email ?? ''} />
      </div>
    </main>
  )
}
