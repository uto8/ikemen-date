export const IKEMEN_TYPES = [
  { id: 1,  name: '王道アイドル系',       displayOrder: 1  },
  { id: 2,  name: '塩顔クール系',         displayOrder: 2  },
  { id: 3,  name: '犬系彼氏系',           displayOrder: 3  },
  { id: 4,  name: 'ワイルド色気系',       displayOrder: 4  },
  { id: 5,  name: '中性美容系',           displayOrder: 5  },
  { id: 6,  name: '韓国アイドル系',       displayOrder: 6  },
  { id: 7,  name: '年上お兄さん系',       displayOrder: 7  },
  { id: 8,  name: 'チャラモテ系',         displayOrder: 8  },
  { id: 9,  name: '爽やかスポーツ系',     displayOrder: 9  },
  { id: 10, name: '沼系ミステリアス系',   displayOrder: 10 },
  { id: 11, name: '陽キャムードメーカー系', displayOrder: 11 },
  { id: 12, name: 'かわいい系',           displayOrder: 12 },
] as const

export type IkemenType = (typeof IKEMEN_TYPES)[number]

/** カードバッジ用: display_order が最小のタイプを返す */
export function pickPrimaryIkemenType(
  types: ReadonlyArray<{ ikemen_type_id: number }>
): IkemenType | undefined {
  if (types.length === 0) return undefined
  const ids = new Set(types.map((t) => t.ikemen_type_id))
  return IKEMEN_TYPES.find((t) => ids.has(t.id))
}
