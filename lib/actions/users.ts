'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOppositeUsers } from '@/lib/queries/users'
import type { PaginatedUsers } from '@/lib/queries/users'

export async function loadMoreUsers(cursor: string): Promise<PaginatedUsers> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { users: [], nextCursor: null }

  const { data: profile } = await supabase
    .from('profiles')
    .select('gender')
    .eq('id', user.id)
    .single()

  return getOppositeUsers(user.id, profile?.gender ?? '', cursor)
}
