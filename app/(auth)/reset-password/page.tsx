import AuthHeader from '@/components/auth/AuthHeader'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeader />
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">新しいパスワードを設定する</h1>
        <p className="mb-8 text-sm text-gray-500">
          新しいパスワードを入力してください（英数字を含む8文字以上）
        </p>
        <ResetPasswordForm />
      </main>
    </>
  )
}
