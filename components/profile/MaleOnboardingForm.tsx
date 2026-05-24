'use client'

import { useState, useTransition, useEffect } from 'react'
import AuthHeader from '@/components/auth/AuthHeader'
import { completeOnboarding } from '@/lib/actions/profile'
import { PREFECTURES } from '@/lib/utils/prefectures'
import { IKEMEN_TYPES } from '@/lib/utils/ikemen-types'

const TOTAL_STEPS = 7
const STEP_LABELS = ['プロフィール画像', 'ニックネーム', '居住地', '職業', '身長', '自己紹介', 'イケメンタイプ']
const STEP_TITLES = [
  'プロフィール画像を設定してください',
  'ニックネームを教えてください',
  '住んでいる都道府県を選んでください',
  '職業を教えてください',
  '身長を教えてください',
  '自己紹介を書いてください',
  'あなたのイケメンタイプは？',
]
const STEP_SUBTITLES = [
  '女性ユーザーに最初に見られる写真です。必須項目です。',
  'アプリ内で表示される名前です。本名でなくて大丈夫です。',
  '一覧で相手に表示される情報です。',
  'プロフィールに表示されます。',
  'プロフィールに表示されます。',
  'プロフィールに表示されます。趣味や人柄を自由に書いてください。',
  '当てはまるものをすべて選んでください（1つ以上）。',
]

const TYPE_COLORS = [
  'bg-rose-100',
  'bg-slate-100',
  'bg-amber-100',
  'bg-orange-100',
  'bg-purple-100',
  'bg-pink-100',
  'bg-indigo-100',
  'bg-yellow-100',
  'bg-green-100',
  'bg-violet-100',
  'bg-sky-100',
  'bg-teal-100',
]

export default function MaleOnboardingForm() {
  const [step, setStep] = useState(1)
  const [avatarFile, setAvatarFile] = useState<File>()
  const [avatarPreview, setAvatarPreview] = useState<string>()
  const [avatarError, setAvatarError] = useState('')
  const [nickname, setNickname] = useState('')
  const [nicknameError, setNicknameError] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const [prefectureError, setPrefectureError] = useState('')
  const [occupation, setOccupation] = useState('')
  const [occupationError, setOccupationError] = useState('')
  const [height, setHeight] = useState('')
  const [heightError, setHeightError] = useState('')
  const [bio, setBio] = useState('')
  const [bioError, setBioError] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<number[]>([])
  const [typesError, setTypesError] = useState('')
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
      setAvatarError('')
    }
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1))
  }

  function goNext() {
    switch (step) {
      case 1:
        if (!avatarFile) {
          setAvatarError('プロフィール画像は必須です')
          return
        }
        setAvatarError('')
        break
      case 2:
        if (nickname.trim().length === 0) {
          setNicknameError('必須項目です')
          return
        }
        setNicknameError('')
        break
      case 3:
        if (!prefecture) {
          setPrefectureError('必須項目です')
          return
        }
        setPrefectureError('')
        break
      case 4:
        if (occupation.trim().length === 0) {
          setOccupationError('必須項目です')
          return
        }
        setOccupationError('')
        break
      case 5: {
        const h = parseInt(height, 10)
        if (!height || isNaN(h) || h < 100 || h > 250) {
          setHeightError('100〜250の整数で入力してください')
          return
        }
        setHeightError('')
        break
      }
      case 6:
        if (bio.trim().length === 0) {
          setBioError('必須項目です')
          return
        }
        setBioError('')
        break
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function toggleType(id: number) {
    setSelectedTypes((prev) => (prev.includes(id) ? [] : [id]))
    setTypesError('')
  }

  function handleSubmit() {
    if (selectedTypes.length === 0) {
      setTypesError('タイプを1つ選択してください')
      return
    }
    setTypesError('')
    setServerError('')
    startTransition(async () => {
      const fd = new FormData()
      fd.set('nickname', nickname.trim())
      fd.set('prefecture', prefecture)
      fd.set('occupation', occupation.trim())
      fd.set('height', height)
      fd.set('bio', bio.trim())
      selectedTypes.forEach((id) => fd.append('ikemen_type_ids', String(id)))
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
          <div className="flex gap-1">
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
          {/* Step 1: アバター */}
          {step === 1 && (
            <div className="flex flex-1 flex-col items-center gap-6">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="プロフィール画像プレビュー"
                    className="h-36 w-36 rounded-full border-2 border-primary-500 object-cover object-top shadow-sm"
                  />
                  <label className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-500 shadow-md">
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
                <label className="flex h-44 w-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-primary-500 bg-white shadow-sm transition-colors hover:bg-primary-50">
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
                  <span className="text-sm font-semibold text-primary-500">写真を選ぶ</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                </label>
              )}
              {avatarError && <p className="text-center text-xs text-error-500">{avatarError}</p>}
              <p className="text-center text-xs text-gray-400">JPEG / PNG / WEBP・10MB以下</p>
            </div>
          )}

          {/* Step 2: ニックネーム */}
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
                placeholder="例: 翔太、りく、けん..."
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

          {/* Step 3: 都道府県 */}
          {step === 3 && (
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                居住地 <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 overflow-y-auto">
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
            </div>
          )}

          {/* Step 4: 職業 */}
          {step === 4 && (
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                職業 <span className="text-error-500">*</span>
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => {
                  setOccupation(e.target.value)
                  if (occupationError) setOccupationError('')
                }}
                placeholder="例: エンジニア、教師、デザイナー..."
                maxLength={30}
                autoFocus
                className={`w-full rounded-md border bg-white px-4 py-3 text-base placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  occupationError ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="mt-2 flex items-center justify-between">
                {occupationError ? (
                  <p className="text-xs text-error-500">{occupationError}</p>
                ) : (
                  <p className="text-xs text-gray-400">1〜30文字</p>
                )}
                <p className="text-xs text-gray-400">{occupation.length} / 30文字</p>
              </div>
            </div>
          )}

          {/* Step 5: 身長 */}
          {step === 5 && (
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                身長 <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value)
                    if (heightError) setHeightError('')
                  }}
                  placeholder="例: 175"
                  min={100}
                  max={250}
                  autoFocus
                  className={`w-full rounded-md border bg-white px-4 py-3 pr-12 text-base placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    heightError ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                  cm
                </span>
              </div>
              {heightError ? (
                <p className="mt-2 text-xs text-error-500">{heightError}</p>
              ) : (
                <p className="mt-2 text-xs text-gray-400">100〜250の整数で入力してください</p>
              )}
            </div>
          )}

          {/* Step 6: 自己紹介 */}
          {step === 6 && (
            <div className="flex flex-1 flex-col">
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                自己紹介 <span className="text-error-500">*</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value)
                  if (bioError) setBioError('')
                }}
                placeholder="例: 週末はテニスをしています。穏やかで話しやすいとよく言われます。一緒においしいものを食べに行きたいです！"
                maxLength={300}
                autoFocus
                rows={6}
                className={`flex-1 w-full resize-none rounded-md border bg-white px-4 py-3 text-base placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  bioError ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              <div className="mt-2 flex items-center justify-between">
                {bioError ? (
                  <p className="text-xs text-error-500">{bioError}</p>
                ) : (
                  <p className="text-xs text-gray-400">1〜300文字</p>
                )}
                <p className="text-xs text-gray-400">{bio.length} / 300文字</p>
              </div>
            </div>
          )}

          {/* Step 7: イケメンタイプ */}
          {step === 7 && (
            <div className="flex flex-1 flex-col">
              <p className="mb-4 text-xs text-gray-400">女性が一覧を絞り込む際のフィルターになります。</p>
              <div className="grid grid-cols-2 gap-3 flex-1">
                {IKEMEN_TYPES.map((type, index) => {
                  const isSelected = selectedTypes.includes(type.id)
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type.id)}
                      className={`rounded-2xl overflow-hidden border-2 text-left transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 bg-white hover:border-primary-500'
                      }`}
                    >
                      <div
                        className={`aspect-square w-full ${TYPE_COLORS[index % TYPE_COLORS.length]} flex items-center justify-center`}
                      />
                      <div className="flex items-center justify-between px-3 py-2">
                        <span
                          className={`text-xs font-semibold ${isSelected ? 'text-primary-500' : 'text-gray-700'}`}
                        >
                          {type.name}
                        </span>
                        <svg
                          className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-primary-500' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
              {typesError && <p className="mt-3 text-xs text-error-500">{typesError}</p>}
              {serverError && (
                <p className="mt-4 rounded-md bg-error-50 px-3 py-2 text-sm text-error-500">
                  {serverError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ナビゲーション */}
        <div className="mt-10">
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              className="w-full rounded-full bg-primary-500 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600"
            >
              次へ
            </button>
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
