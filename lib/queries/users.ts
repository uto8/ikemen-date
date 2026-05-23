import { calcAge } from '../utils/age'
import { IKEMEN_TYPES, pickPrimaryIkemenType } from '../utils/ikemen-types'
import { createServerSupabaseClient } from '../supabase/server'

export type UserCardData = {
  id: string
  nickname: string
  age: number
  prefecture: string
  avatar_url: string | null
  gender: string
  primaryIkemenType?: string
}

type ProfileRow = {
  id: string
  nickname: string
  birth_date: string
  prefecture: string
  avatar_url: string | null
  gender: string
  created_at: string
  profile_ikemen_types: Array<{ ikemen_type_id: number }>
}

export function transformToUserCardData(profiles: ProfileRow[]): UserCardData[] {
  return profiles.map((p) => {
    const [y, m, d] = p.birth_date.split('-').map(Number)
    const age = calcAge(new Date(y, m - 1, d))

    const primaryIkemenType =
      p.gender === 'male'
        ? pickPrimaryIkemenType(p.profile_ikemen_types)?.name
        : undefined

    return {
      id: p.id,
      nickname: p.nickname,
      age,
      prefecture: p.prefecture,
      avatar_url: p.avatar_url,
      gender: p.gender,
      primaryIkemenType,
    }
  })
}

export type UserDetailData = {
  id: string
  nickname: string
  age: number
  prefecture: string
  avatar_url: string | null
  gender: string
  occupation: string | null
  height: number | null
  bio: string | null
  ikemenTypes: string[]
}

type ProfileDetailRow = {
  id: string
  nickname: string
  birth_date: string
  prefecture: string
  avatar_url: string | null
  gender: string
  occupation: string | null
  height: number | null
  bio: string | null
  profile_ikemen_types: Array<{ ikemen_type_id: number }>
}

export function transformToUserDetailData(row: ProfileDetailRow): UserDetailData {
  const [y, m, d] = row.birth_date.split('-').map(Number)
  const age = calcAge(new Date(y, m - 1, d))

  const ikemenTypes = IKEMEN_TYPES.filter((t) =>
    row.profile_ikemen_types.some((pt) => pt.ikemen_type_id === t.id)
  ).map((t) => t.name)

  return {
    id: row.id,
    nickname: row.nickname,
    age,
    prefecture: row.prefecture,
    avatar_url: row.avatar_url,
    gender: row.gender,
    occupation: row.occupation,
    height: row.height,
    bio: row.bio,
    ikemenTypes,
  }
}

export async function getUserById(id: string): Promise<UserDetailData | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      nickname,
      birth_date,
      prefecture,
      avatar_url,
      gender,
      occupation,
      height,
      bio,
      profile_ikemen_types (
        ikemen_type_id
      )
    `
    )
    .eq('id', id)
    .eq('is_onboarding_complete', true)
    .single()

  if (error || !data) return null

  return transformToUserDetailData(data as ProfileDetailRow)
}

export type MyProfileData = {
  id: string
  gender: string
  nickname: string
  prefecture: string
  avatar_url: string | null
  occupation: string | null
  height: number | null
  bio: string | null
  ikemenTypeIds: number[]
}

export async function getMyProfile(userId: string): Promise<MyProfileData | null> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      gender,
      nickname,
      prefecture,
      avatar_url,
      occupation,
      height,
      bio,
      profile_ikemen_types (
        ikemen_type_id
      )
    `
    )
    .eq('id', userId)
    .single()

  if (error || !data) return null

  const row = data as {
    id: string
    gender: string
    nickname: string
    prefecture: string
    avatar_url: string | null
    occupation: string | null
    height: number | null
    bio: string | null
    profile_ikemen_types: Array<{ ikemen_type_id: number }>
  }

  return {
    id: row.id,
    gender: row.gender,
    nickname: row.nickname,
    prefecture: row.prefecture,
    avatar_url: row.avatar_url,
    occupation: row.occupation,
    height: row.height,
    bio: row.bio,
    ikemenTypeIds: row.profile_ikemen_types.map((pt) => pt.ikemen_type_id),
  }
}

export const USERS_PAGE_SIZE = 20

export type PaginatedUsers = {
  users: UserCardData[]
  nextCursor: string | null
}

export function getNextCursor(rows: Array<{ created_at: string }>, pageSize: number): string | null {
  return rows.length >= pageSize ? rows[rows.length - 1].created_at : null
}

export async function getOppositeUsers(
  currentUserId: string,
  currentGender: string,
  cursor?: string
): Promise<PaginatedUsers> {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('profiles')
    .select(
      `
      id,
      nickname,
      birth_date,
      prefecture,
      avatar_url,
      gender,
      created_at,
      profile_ikemen_types (
        ikemen_type_id
      )
    `
    )
    .neq('gender', currentGender)
    .neq('id', currentUserId)
    .eq('is_onboarding_complete', true)
    .order('created_at', { ascending: false })
    .limit(USERS_PAGE_SIZE)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error || !data) return { users: [], nextCursor: null }

  const rows = data as ProfileRow[]
  return {
    users: transformToUserCardData(rows),
    nextCursor: getNextCursor(rows, USERS_PAGE_SIZE),
  }
}
