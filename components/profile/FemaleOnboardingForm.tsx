'use client'

import { useState, useTransition, useEffect } from 'react'
import AuthHeader from '@/components/auth/AuthHeader'
import { completeOnboarding } from '@/lib/actions/profile'
import { PREFECTURES } from '@/lib/utils/prefectures'

const TOTAL_STEPS = 3
const STEP_LABELS = ['プロフィール画像', 'ニックネーム', '居住地']
const STEP_TITLES = [
  'プロフィール画像を設定しましょう',
  'ニックネームを教えてください',
  '住んでいる都道府県を選んでください',
]
const STEP_SUBTITLES = [
  'あとで変更することもできます。スキップも可能です。',
  'アプリ内で表示される名前です。本名でなくて大丈夫です。',
  '一覧で相手に表示される情報です。',
]

export default function FemaleOnboardingForm() {
  const [step, setStep] = useState(1)
  const [avatarFile, setAvatarFile] = useState<File>()
  const [avatarPreview, setAvatarPreview] = useState<string>()
  const [nickname, setNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [prefectureError, setPrefectureError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [avatarPreview])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1))
  }

  function goNext() {
    if (step === 2) {
      if (nickname.trim().length === 0) {
        setNicknameError('必須項目です')
        return
      }
      setNicknameError('')
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function handleSubmit() {
    if (prefecture === '') {
      setPrefectureError('必須項目です')
      return
    }
    setPrefectureError('')
    setServerError('')
    startTransition(async () => {
      const fd = new FormData()
      fd.set('nickname', nickname.trim())
      fd.set('prefecture', prefecture)
      if (avatarFile) fd.set('avatar', avatarFile)
      const res = await completeOnboarding(fd)
      if (res?.error) setServerError(res.error)
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader onBack={step > 1 ? goBack : undefined} />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-10">
        {/* プログレスバー */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              ステップ {step} / {TOTAL_STEPS}
            </span>
            <span className="text-xs text-gray-400">{STEP_LABELS[step - 1]}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i < step ? 'bg-primary-500' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {/* 見出し */}
        <h1 className="mb-1 text-2xl font-bold text-gray-900">{STEP_TITLES[step - 1]}</h1>
        <p className="mb-10 text-sm text-gray-500">{STEP_SUBTITLES[step - 1]}</p>

        {/* ステップコンテンツ */}
        <div className="flex flex-1 flex-col">
          {step === 1 && (
            <div className="flex flex-1 flex-col items-center gap-6">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="プロフィール画像プレビュー"
                    className="h-32 w-32 rounded-full border-2 border-primary-500 object-cover shadow-sm"
                  />
                  <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-500 shadow-md">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      />
                    </svg>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-primary-500 bg-white shadow-sm transition-colors hover:bg-primary-50">
                  <svg
                    className="h-10 w-10 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-primary-500">写真を選ぶ</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                </label>
              )}
              <p className="text-center text-xs text-gray-400">JPEG / PNG / WEBP・10MB以下</p>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                ニックネーム <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  if (nicknameError) setNicknameError('')
                }}
                placeholder="例: はな、あおい、さくら..."
                maxLength={20}
                autoFocus
                className={`w-full rounded-md border bg-white px-4 py-3 text-base placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  nicknameError ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="mt-2 flex items-center justify-between">
                {nicknameError ? (
                  <p className="text-xs text-error-500">{nicknameError}</p>
                ) : (
                  <p className="text-xs text-gray-400">1〜20文字</p>
                )}
                <p className="text-xs text-gray-400">{nickname.length} / 20文字</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                居住地 <span className="text-error-500">*</span>
              </label>
              <div className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto pr-1">
                {PREFECTURES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPrefecture(p)
                      setPrefectureError('')
                    }}
                    className={`rounded-xl border-2 py-3 text-center text-sm transition-colors ${
                      prefecture === p
                        ? 'border-primary-500 bg-primary-50 font-semibold text-primary-500'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {prefectureError && (
                <p className="mt-2 text-xs text-error-500">{prefectureError}</p>
              )}
              {serverError && (
                <p className="mt-4 rounded-md bg-error-50 px-3 py-2 text-sm text-error-500">
                  {serverError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="mt-10 space-y-3">
          {step < TOTAL_STEPS ? (
            <>
              <button
                type="button"
                onClick={goNext}
                className="w-full rounded-full bg-primary-500 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
              >
                次へ
              </button>
              {step === 1 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-2 text-center text-sm text-gray-400 transition-colors hover:text-gray-600"
                >
                  スキップする
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full rounded-full bg-primary-500 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              {isPending ? '登録中…' : '登録する'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
