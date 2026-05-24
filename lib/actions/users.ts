'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOppositeUsers } from '@/lib/queries/users'
import type { PaginatedUsers } from '@/lib/queries/users'

async function getCurrentUserAndGender() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', user.id)
    .single()

  return { supabase, userId: user.id, gender: profile?.gender ?? '' }
}

export async function loadMoreUsers(
  cursor: string,
  ikemenTypeId?: number
): Promise<PaginatedUsers> {
  const ctx = await getCurrentUserAndGender()
  if (!ctx) return { users: [], nextCursor: null }
  return getOppositeUsers(ctx.userId, ctx.gender, cursor, ikemenTypeId)
}

export async function fetchUsersWithFilter(
  ikemenTypeId?: number
): Promise<PaginatedUsers> {
  const ctx = await getCurrentUserAndGender()
  if (!ctx) return { users: [], nextCursor: null }
  return getOppositeUsers(ctx.userId, ctx.gender, undefined, ikemenTypeId)
}
