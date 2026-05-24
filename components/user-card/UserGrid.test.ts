import { describe, it, expectTypeOf } from 'vitest'
import type { Props } from './UserGrid'
import type { UserCardData } from '@/lib/queries/users'

const baseProps: Props = {
  initialUsers: [] as UserCardData[],
  initialNextCursor: null,
  isFemaleUser: false,
}

describe('UserGrid Props — isFemaleUser', () => {
  it('isFemaleUser: true を渡した Props が Props 型に代入できる', () => {
    const props = { ...baseProps, isFemaleUser: true } satisfies Props
    expectTypeOf(props).toMatchTypeOf<Props>()
  })

  it('isFemaleUser: false を渡した Props が Props 型に代入できる', () => {
    const props = { ...baseProps, isFemaleUser: false } satisfies Props
    expectTypeOf(props).toMatchTypeOf<Props>()
  })

  it('isFemaleUser は boolean 型である', () => {
    expectTypeOf<Props['isFemaleUser']>().toEqualTypeOf<boolean>()
  })
})
