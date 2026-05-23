import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold">新規登録</h1>
        <RegisterForm />
      </div>
    </main>
  )
}
