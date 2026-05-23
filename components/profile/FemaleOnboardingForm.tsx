'use client'

import { useState, useTransition, useEffect } from 'react'
import type { z } from 'zod'
import { femaleOnboardingSchema } from '@/lib/validations/profile'
import { completeOnboarding } from '@/lib/actions/profile'
import { PREFECTURES } from '@/lib/utils/prefectures'

type FieldErrors = Partial<Record<keyof z.infer<typeof femaleOnboardingSchema>, string>>

type FormState = {
  errors: FieldErrors
  serverError?: string
}

export default function FemaleOnboardingForm() {
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<FormState>({ errors: {} })
  const [preview, setPreview] = useState<string>()

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (preview) URL.revokeObjectURL(preview)
    setPreview(file ? URL.createObjectURL(file) : undefined)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const raw = {
      nickname: formData.get('nickname') as string,
      prefecture: formData.get('prefecture') as string,
    }

    const result = femaleOnboardingSchema.safeParse(raw)
    if (!result.success) {
      const errors: FieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors
        if (!errors[key]) errors[key] = issue.message
      }
      setState({ errors })
      return
    }

    setState({ errors: {} })
    startTransition(async () => {
      const res = await completeOnboarding(formData)
      if (res.error) {
        setState({ errors: {}, serverError: res.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* avatar */}
      <div className="flex flex-col items-center gap-3">
        {preview ? (
          <img
            src={preview}
            alt="プロフィール画像プレビュー"
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
        <label className="cursor-pointer text-sm font-medium text-pink-500">
          プロフィール画像を選択（任意）
          <input
            name="avatar"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* nickname */}
      <div className="flex flex-col gap-1">
        <label htmlFor="nickname" className="text-sm font-medium">
          ニックネーム <span className="text-red-500">*</span>
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          maxLength={20}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        {state.errors.nickname && (
          <p className="text-xs text-red-500">{state.errors.nickname}</p>
        )}
      </div>

      {/* prefecture */}
      <div className="flex flex-col gap-1">
        <label htmlFor="prefecture" className="text-sm font-medium">
          都道府県 <span className="text-red-500">*</span>
        </label>
        <select
          id="prefecture"
          name="prefecture"
          defaultValue=""
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        >
          <option value="" disabled>
            選択してください
          </option>
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {state.errors.prefecture && (
          <p className="text-xs text-red-500">{state.errors.prefecture}</p>
        )}
      </div>

      {/* server error */}
      {state.serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-pink-500 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
      >
        {isPending ? '保存中…' : 'つぎへ'}
      </button>
    </form>
  )
}
