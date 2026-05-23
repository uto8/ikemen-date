import { calcAge } from '../utils/age'
import { pickPrimaryIkemenType } from '../utils/ikemen-types'
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

export async function getOppositeUsers(
  currentUserId: string,
  currentGender: string
): Promise<UserCardData[]> {
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

  if (error || !data) return []

  return transformToUserCardData(data as ProfileRow[])
}
