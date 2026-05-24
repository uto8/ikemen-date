# 技術設計書 — イケメンタイプフィルター

最終更新: 2026-05-24

---

## 1. データモデルの変更

### マイグレーション：不要

フィルターに必要なデータはすべて既存テーブルに存在する。

```
profile_ikemen_types
  ├── profile_id     uuid      FK → profiles.id  ON DELETE CASCADE
  └── ikemen_type_id smallint  FK → ikemen_types.id
```

絞り込みは `profile_ikemen_types` テーブルを `INNER JOIN` し、`ikemen_type_id` でフィルタリングすることで実現する。新規テーブル・カラム・インデックスの追加は不要。

### 将来の最適化（現時点では対応不要）

ユーザー数が 1,000 人超に達した場合は以下のインデックス追加を検討する。

```sql
CREATE INDEX ON public.profile_ikemen_types (ikemen_type_id);
```

現在の想定ユーザー数（最大 100 人）ではインデックスなしでもパフォーマンス要件を満たす。

---

## 2. API 設計

### 2.1 `getOppositeUsers`（`lib/queries/users.ts`）の変更

```typescript
// 変更前
export async function getOppositeUsers(
  currentUserId: string,
  currentGender: string,
  cursor?: string
): Promise<PaginatedUsers>

// 変更後
export async function getOppositeUsers(
  currentUserId: string,
  currentGender: string,
  cursor?: string,
  ikemenTypeId?: number
): Promise<PaginatedUsers>
```

**クエリロジック（フィルターあり時）**

`ikemenTypeId` が `number` のとき、`profile_ikemen_types` を `INNER JOIN`（`!inner`）し、`ikemen_type_id = ikemenTypeId` で絞り込む。

```typescript
let query = supabase
  .from('profiles')
  .select(
    ikemenTypeId
      ? '*, profile_ikemen_types!inner(ikemen_type_id)'
      : '*, profile_ikemen_types(ikemen_type_id)'
  )
  .neq('id', currentUserId)
  .eq('gender', oppositeGender)
  .eq('is_onboarding_complete', true)
  .order('created_at', { ascending: false })
  .limit(PAGE_SIZE + 1)

if (ikemenTypeId !== undefined) {
  query = query.eq('profile_ikemen_types.ikemen_type_id', ikemenTypeId)
}

if (cursor) {
  query = query.lt('created_at', cursor)
}
```

`ikemenTypeId` が `undefined` のとき、既存と同じ LEFT JOIN が維持される。既存の呼び出し元への破壊的変更なし。

### 2.2 `loadMoreUsers`（`lib/actions/users.ts`）の変更

```typescript
// 変更前
export async function loadMoreUsers(
  cursor: string
): Promise<PaginatedUsers>

// 変更後
export async function loadMoreUsers(
  cursor: string,
  ikemenTypeId?: number
): Promise<PaginatedUsers>
```

内部で `getOppositeUsers` を呼び出す際に `ikemenTypeId` を渡す。既存の呼び出し元への破壊的変更なし。

### 2.3 `fetchUsersWithFilter`（`lib/actions/users.ts`）の追加

フィルター切り替え時の初回取得専用 Server Action。カーソルを使わずに先頭から取得する。

```typescript
export async function fetchUsersWithFilter(
  ikemenTypeId?: number
): Promise<PaginatedUsers>
```

`loadMoreUsers` との違いは cursor を引数に取らない点のみ。内部実装は `getOppositeUsers(userId, gender, undefined, ikemenTypeId)` の呼び出しに相当する。

### 2.4 戻り値型（既存・変更なし）

```typescript
// lib/queries/users.ts
export type PaginatedUsers = {
  users: UserCardData[]
  nextCursor: string | null
}
```

---

## 3. 画面 / UI 設計

### 3.1 フィルターバーの配置

`/users` ページのカードグリッド上部に配置する。`UserGrid.tsx` の `return` の直前に `IkemenTypeFilter` を配置し、`isFemaleUser = true` のときのみ表示する。

```
┌─────────────────────────────────────┐
│  ヘッダー（固定）                       │
├─────────────────────────────────────┤
│  ← IkemenTypeFilter（女性のみ表示）     │
│  [すべて] [王道アイドル系] [塩顔クール系] …  │
│  （横スクロール）                       │
├─────────────────────────────────────┤
│  ユーザーカードグリッド（2カラム）          │
│                                     │
└─────────────────────────────────────┘
```

### 3.2 カードの視覚仕様

**「すべて」カード**

```
┌───────────────┐
│               │
│    すべて      │  ← テキストのみ（画像なし）・垂直中央揃え
│               │
└───────────────┘
  w-20 h-24 rounded-xl
```

**タイプカード**

```
┌───────────────┐
│               │
│   [画像]      │  ← public/{filename}.png（静的ファイル）
│               │
│ タイプ名テキスト │  ← text-xs text-center
└───────────────┘
  w-20 rounded-xl
  画像: aspect-square object-cover object-top
```

**選択状態のクラス差分**

| 状態 | border | background |
|---|---|---|
| 未選択 | `border-gray-200` | `bg-white` |
| 選択中 | `border-primary-500` | `bg-primary-50` |

`border-2` を常時適用し、選択状態の切り替えは `border-gray-200 bg-white` ↔ `border-primary-500 bg-primary-50` のクラス差し替えで行う。

### 3.3 横スクロールバーの実装

```tsx
<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-4">
  {/* すべてカード */}
  {/* 12タイプカード */}
</div>
```

`scrollbar-none` でスクロールバーを非表示にし、375px 幅でも全 12 タイプにアクセスできるようにする。

---

## 4. 既存コンポーネントの変更

### 4.1 `UserGrid.tsx`（`components/user-card/UserGrid.tsx`）

**props の追加**

```typescript
// 変更前
type Props = {
  initialUsers: UserCardData[]
  nextCursor: string | null
}

// 変更後
type Props = {
  initialUsers: UserCardData[]
  nextCursor: string | null
  isFemaleUser: boolean
}
```

**追加する state**

```typescript
const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
const [isPending, startTransition] = useTransition()
```

**フィルター変更時のリセットロジック**

```typescript
function handleTypeSelect(typeId: number | null) {
  startTransition(async () => {
    setSelectedTypeId(typeId)
    const result = await fetchUsersWithFilter(typeId ?? undefined)
    setUsers(result.users)
    setNextCursor(result.nextCursor)
  })
}
```

`useTransition` により UI のブロッキングなしに非同期リセットを実行する。

**`loadMore` 関数の変更**

```typescript
// 変更前
const data = await loadMoreUsers(nextCursor)

// 変更後
const data = await loadMoreUsers(nextCursor, selectedTypeId ?? undefined)
```

無限スクロールの追加取得時に、現在の `selectedTypeId` をそのまま渡すことでフィルター状態を維持する。

**`IkemenTypeFilter` の挿入位置**

```tsx
return (
  <div>
    {isFemaleUser && (
      <IkemenTypeFilter
        selectedTypeId={selectedTypeId}
        onSelect={handleTypeSelect}
      />
    )}
    {/* カードグリッド */}
  </div>
)
```

### 4.2 `app/(app)/users/page.tsx` の変更

Server Component 側で現在のユーザーの性別を取得し、`UserGrid` に `isFemaleUser` を渡す。

```typescript
// 変更前
<UserGrid initialUsers={users} nextCursor={nextCursor} />

// 変更後
<UserGrid
  initialUsers={users}
  nextCursor={nextCursor}
  isFemaleUser={profile.gender === 'female'}
/>
```

性別情報はすでに `getOppositeUsers` の呼び出しに必要なため、追加の DB クエリは不要。

---

## 5. 新規コンポーネント

### `IkemenTypeFilter.tsx`（`components/user-filter/IkemenTypeFilter.tsx`）

```typescript
'use client'

import { IKEMEN_TYPES } from '@/lib/utils/ikemen-types'

type Props = {
  selectedTypeId: number | null
  onSelect: (typeId: number | null) => void
}

export default function IkemenTypeFilter({ selectedTypeId, onSelect }: Props)
```

**責務**

- `IKEMEN_TYPES` 定数を読み取り、12 枚のタイプカードと「すべて」カードを横スクロール列で表示する
- 選択・解除のロジックを内部に持たず、`onSelect` コールバックで親（`UserGrid.tsx`）に委譲する
- カードのタップ時の動作：
  - `selectedTypeId === null`（すべて状態）でタイプカードをタップ → `onSelect(type.id)`
  - `selectedTypeId === type.id`（同じカードを再タップ）→ `onSelect(null)`
  - `selectedTypeId !== null` で別のカードをタップ → `onSelect(type.id)`
  - 「すべて」カードをタップ → `onSelect(null)`

**画像のソース**

`IKEMEN_TYPES` の各要素に定義済みの `image` フィールド（例: `/sawayakasports.png`）をそのまま使用する。`public/` の静的ファイルを参照するため、Supabase Storage へのリクエストは発生しない。

---

## 6. エラーハンドリング

### 6.1 絞り込み結果が 0 件の場合

`fetchUsersWithFilter` の結果として `users.length === 0` が返ってきた場合、カードグリッドの代わりに以下のメッセージを表示する。

```tsx
{users.length === 0 ? (
  <p className="py-16 text-center text-sm text-gray-400">
    このタイプに該当するユーザーはいません
  </p>
) : (
  /* カードグリッド */
)}
```

フィルターバーは表示を継続し、他のタイプへの切り替えを可能にする。

### 6.2 Server Action がエラーを返した場合

`fetchUsersWithFilter` / `loadMoreUsers` がネットワークエラー等でスローした場合は、`try/catch` で捕捉し以下のメッセージを表示する。

```tsx
<p className="py-16 text-center text-sm text-gray-400">
  ユーザーの取得に失敗しました。画面を更新してください
</p>
```

エラー発生時は `users` 状態を空配列にリセットせず、直前の表示を維持する（ちらつき防止）。

### 6.3 フィルター変更中の二重タップ

`useTransition` の `isPending` フラグを `IkemenTypeFilter` に渡し、ペンディング中はカードの `pointer-events: none` を適用して二重タップを防ぐ。

```tsx
<IkemenTypeFilter
  selectedTypeId={selectedTypeId}
  onSelect={handleTypeSelect}
  disabled={isPending}
/>
```

`disabled` 受信時、`IkemenTypeFilter` は `pointer-events-none opacity-60` をフィルターバー全体に適用する。
