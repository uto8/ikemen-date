'use client'

import { useState, useTransition, useEffect } from 'react'
import type { z } from 'zod'
import { maleOnboardingSchema } from '@/lib/validations/profile'
import { completeOnboarding } from '@/lib/actions/profile'
import { PREFECTURES } from '@/lib/utils/prefectures'
import { IKEMEN_TYPES } from '@/lib/utils/ikemen-types'

type FieldErrors = Partial<Record<keyof z.infer<typeof maleOnboardingSchema>, string>>

type FormState = {
  errors: FieldErrors
  serverError?: string
}

export default function MaleOnboardingForm() {
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
      occupation: formData.get('occupation') as string,
      height: formData.get('height') as string,
      bio: formData.get('bio') as string,
      ikemen_type_ids: formData.getAll('ikemen_type_ids').map(Number),
    }

    const result = maleOnboardingSchema.safeParse(raw)
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

      {/* occupation */}
      <div className="flex flex-col gap-1">
        <label htmlFor="occupation" className="text-sm font-medium">
          職業 <span className="text-red-500">*</span>
        </label>
        <input
          id="occupation"
          name="occupation"
          type="text"
          maxLength={30}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        {state.errors.occupation && (
          <p className="text-xs text-red-500">{state.errors.occupation}</p>
        )}
      </div>

      {/* height */}
      <div className="flex flex-col gap-1">
        <label htmlFor="height" className="text-sm font-medium">
          身長（cm） <span className="text-red-500">*</span>
        </label>
        <input
          id="height"
          name="height"
          type="number"
          min={100}
          max={250}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        {state.errors.height && (
          <p className="text-xs text-red-500">{state.errors.height}</p>
        )}
      </div>

      {/* bio */}
      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className="text-sm font-medium">
          自己紹介 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          maxLength={300}
          rows={4}
          className="resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        {state.errors.bio && (
          <p className="text-xs text-red-500">{state.errors.bio}</p>
        )}
      </div>

      {/* ikemen_type_ids */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          イケメンタイプ <span className="text-red-500">*</span>
        </span>
        <p className="text-xs text-gray-400">当てはまるタイプをすべて選択してください</p>
        <div className="grid grid-cols-2 gap-y-2">
          {IKEMEN_TYPES.map((type) => (
            <label key={type.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="ikemen_type_ids"
                value={type.id}
                className="accent-pink-500"
              />
              {type.name}
            </label>
          ))}
        </div>
        {state.errors.ikemen_type_ids && (
          <p className="text-xs text-red-500">{state.errors.ikemen_type_ids}</p>
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
