import AuthHeader from '@/components/auth/AuthHeader'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader backHref="/login" />
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">パスワードをリセットする</h1>
        <p className="mb-8 text-sm text-gray-500">
          登録済みのメールアドレスにリセットリンクをお送りします
        </p>
        <ForgotPasswordForm />
      </main>
    </>
  )
}
