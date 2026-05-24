import AuthHeader from '@/components/auth/AuthHeader'
import VerifyEmailForm from '@/components/auth/VerifyEmailForm'

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <>
      <AuthHeader />
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <VerifyEmailForm email={email ?? ''} />
      </main>
    </>
  )
}
