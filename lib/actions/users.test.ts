import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadMoreUsers, fetchUsersWithFilter } from './users'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import * as usersQuery from '@/lib/queries/users'

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}))

vi.mock('@/lib/queries/users', () => ({
  getOppositeUsers: vi.fn(),
}))

const mockPaginated = { users: [], nextCursor: null }

function createMockSupabase(userId: string | null, gender: string) {
  const profileQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: gender ? { gender } : null }),
  }
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
      }),
    },
    from: vi.fn().mockReturnValue(profileQuery),
  }
}

describe('loadMoreUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersQuery.getOppositeUsers).mockResolvedValue(mockPaginated)
  })

  it('未認証のとき空の結果を返す', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      createMockSupabase(null, '') as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
    )
    const result = await loadMoreUsers('cursor-1')
    expect(result).toEqual({ users: [], nextCursor: null })
    expect(usersQuery.getOppositeUsers).not.toHaveBeenCalled()
  })

  it('cursor を getOppositeUsers に渡す', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      createMockSupabase('user-1', 'female') as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
    )
    await loadMoreUsers('cursor-abc')
    expect(usersQuery.getOppositeUsers).toHaveBeenCalledWith('user-1', 'female', 'cursor-abc', undefined)
  })

  it('ikemenTypeId を getOppositeUsers に渡す', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      createMockSupabase('user-1', 'female') as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
    )
    await loadMoreUsers('cursor-abc', 9)
    expect(usersQuery.getOppositeUsers).toHaveBeenCalledWith('user-1', 'female', 'cursor-abc', 9)
  })

  it('ikemenTypeId なしは undefined を渡す', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      createMockSupabase('user-1', 'male') as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
    )
    await loadMoreUsers('cursor-xyz')
    expect(usersQuery.getOppositeUsers).toHaveBeenCalledWith('user-1', 'male', 'cursor-xyz', undefined)
  })
})

describe('fetchUsersWithFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersQuery.getOppositeUsers).mockResolvedValue(mockPaginated)
  })

  it('未認証のとき空の結果を返す', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      createMockSupabase(null, '') as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
    )
    const result = await fetchUsersWithFilter()
    expect(result).toEqual({ users: [], nextCursor: null })
    expect(usersQuery.getOppositeUsers).not.toHaveBeenCalled()
  })

  it('cursor なし（undefined）で getOppositeUsers を呼ぶ', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      createMockSupabase('user-1', 'female') as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
    )
    await fetchUsersWithFilter()
    expect(usersQuery.getOppositeUsers).toHaveBeenCalledWith('user-1', 'female', undefined, undefined)
  })

  it('ikemenTypeId を getOppositeUsers に渡す', async () => {
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      createMockSupabase('user-1', 'female') as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
    )
    await fetchUsersWithFilter(5)
    expect(usersQuery.getOppositeUsers).toHaveBeenCalledWith('user-1', 'female', undefined, 5)
  })

  it('getOppositeUsers の結果をそのまま返す', async () => {
    const mockResult = { users: [{ id: 'u1' } as never], nextCursor: 'cur' }
    vi.mocked(usersQuery.getOppositeUsers).mockResolvedValue(mockResult)
    vi.mocked(createServerSupabaseClient).mockResolvedValue(
      createMockSupabase('user-1', 'female') as unknown as Awaited<ReturnType<typeof createServerSupabaseClient>>
    )
    const result = await fetchUsersWithFilter(3)
    expect(result).toEqual(mockResult)
  })
})
