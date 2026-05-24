# 実装タスク — イケメンタイプフィルター

最終更新: 2026-05-24（F-008 完了）

設計書: `docs/features/ikemen-type-filter/design.md`
影響範囲: `docs/features/ikemen-type-filter/impact.md`

---

## データモデル変更

マイグレーションなし。フィルターに必要な `profile_ikemen_types(profile_id, ikemen_type_id)` は既存テーブルで対応可能。

---

## 破壊的変更

`UserGrid.tsx` の `Props` 型に必須 prop `isFemaleUser: boolean` を追加すると、既存の唯一の呼び出し元 `app/(app)/users/page.tsx` がコンパイルエラーになる。
F-001 で `isFemaleUser?: boolean`（optional、デフォルト `false`）として先行追加し、F-005 で呼び出し元を更新した後に required へ昇格する。

---

## タスク一覧

---

### F-001 — 互換性レイヤー：`UserGrid` に `isFemaleUser` を optional で追加 ✅

**対象ファイル**: `components/user-card/UserGrid.tsx`

**作業内容**
- `Props` 型に `isFemaleUser?: boolean` を追加する（デフォルト `false`）
- コンポーネント本体の実装は変更しない（フィルター表示・状態管理は追加しない）

**完了条件**
- `npm run build` がエラーなく通る
- `app/(app)/users/page.tsx` を変更せずにコンパイルが成功する
- `/users` の画面表示・無限スクロール動作が変わらない

**ロールバック方法**
- `Props` 型から `isFemaleUser?: boolean` の1行を削除する
- 他ファイルへの変更がないため、この1行の削除のみで完全に元の状態に戻る

**依存タスク**: なし

---

### F-002 — `getOppositeUsers` に `ikemenTypeId` 引数追加 ✅

**対象ファイル**: `lib/queries/users.ts`

**作業内容**
- シグネチャに第4引数 `ikemenTypeId?: number` を追加する
- `ikemenTypeId` が `undefined` のとき: `select` を `'*, profile_ikemen_types(ikemen_type_id)'`（LEFT JOIN）のまま維持し、既存クエリを変えない
- `ikemenTypeId` が `number` のとき: `select` を `'*, profile_ikemen_types!inner(ikemen_type_id)'` に変更し、`.eq('profile_ikemen_types.ikemen_type_id', ikemenTypeId)` を追加する

```typescript
// 実装の骨格
const selectClause = ikemenTypeId
  ? '*, profile_ikemen_types!inner(ikemen_type_id)'
  : '*, profile_ikemen_types(ikemen_type_id)'

let query = supabase
  .from('profiles')
  .select(selectClause)
  /* ... 既存の .neq .eq .order .limit ... */

if (ikemenTypeId !== undefined) {
  query = query.eq('profile_ikemen_types.ikemen_type_id', ikemenTypeId)
}
if (cursor) {
  query = query.lt('created_at', cursor)
}
```

**完了条件**
- `npx vitest` の既存テストが全てパスする
- `ikemenTypeId` を渡さない既存の呼び出し（`users/page.tsx`・`actions/users.ts`）が変更なしで動作する
- `ikemenTypeId: 9` を渡すと、`profile_ikemen_types.ikemen_type_id = 9` を持つ男性のみが返る
- `ikemenTypeId: 9` と `cursor` を同時に渡すと、該当タイプ内でカーソルページングが機能する

**ロールバック方法**
- 追加した `ikemenTypeId` 引数と `selectClause` 条件分岐・`.eq` 呼び出しを削除して元のシグネチャに戻す
- 呼び出し元は変更していないため、このファイル1件の差し戻しのみで完全に元の状態に戻る

**依存タスク**: なし（F-001 と並行実施可）

---

### F-003 — `loadMoreUsers` に `ikemenTypeId` 引数追加 + `fetchUsersWithFilter` 新規追加 ✅

**対象ファイル**: `lib/actions/users.ts`

**作業内容**
- `loadMoreUsers(cursor: string)` に第2引数 `ikemenTypeId?: number` を追加し、内部の `getOppositeUsers` 呼び出しに渡す
- 新規 Server Action `fetchUsersWithFilter` を追加する

```typescript
// 追加するServer Action
'use server'

export async function fetchUsersWithFilter(
  ikemenTypeId?: number
): Promise<PaginatedUsers> {
  // カーソルなしで getOppositeUsers を呼ぶ（先頭ページ取得専用）
  return getOppositeUsers(userId, gender, undefined, ikemenTypeId)
}
```

**完了条件**
- `loadMoreUsers(cursor)` の既存の呼び出しが変更なしで動作する
- `fetchUsersWithFilter()` の戻り値が既存の初回取得と同じ結果を返す
- `fetchUsersWithFilter(9)` が `ikemen_type_id = 9` を持つ男性のみ・先頭20件を返す
- `fetchUsersWithFilter(9)` の戻り値の `nextCursor` が `null` でなければ、それを `loadMoreUsers(cursor, 9)` に渡すと続きが取得できる

**ロールバック方法**
- `loadMoreUsers` から `ikemenTypeId` 引数を削除する
- `fetchUsersWithFilter` 関数全体を削除する
- `UserGrid.tsx` はまだ `fetchUsersWithFilter` を呼び出していないため、このファイル1件の差し戻しのみで完全に元の状態に戻る

**依存タスク**: F-002

---

### F-004 — `UserGrid` にフィルター状態管理を追加 ✅

**対象ファイル**: `components/user-card/UserGrid.tsx`

**作業内容**
- `fetchUsersWithFilter` のインポートを追加する
- 以下の state と関数を追加する

```typescript
const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
const [isPending, startTransition] = useTransition()

function handleTypeSelect(typeId: number | null) {
  startTransition(async () => {
    setSelectedTypeId(typeId)
    const result = await fetchUsersWithFilter(typeId ?? undefined)
    setUsers(result.users)
    setNextCursor(result.nextCursor)
  })
}
```

- 既存の `loadMoreUsers` 呼び出しに `selectedTypeId ?? undefined` を第2引数として追加する

**完了条件**
- `isFemaleUser` が `false` のとき既存の無限スクロール動作が変わらない
- `handleTypeSelect(9)` を呼ぶと `users` がリセットされ、`selectedTypeId` が `9` になる
- `handleTypeSelect(null)` を呼ぶと `users` が全件リセットされ、`selectedTypeId` が `null` になる
- フィルター変更後に末尾スクロールが発火すると、`loadMoreUsers` に `selectedTypeId` が渡される
- フィルターA → フィルターB 切り替え時に、フィルターAのカーソルがフィルターBの取得に使われない（`fetchUsersWithFilter` がカーソルなしで先頭から取得する）

**ロールバック方法**
- `selectedTypeId` state・`isPending`・`handleTypeSelect` 関数を削除する
- `loadMoreUsers` 呼び出しを第1引数のみに戻す
- `fetchUsersWithFilter` のインポートを削除する

**依存タスク**: F-003

---

### F-005 — `users/page.tsx` で `isFemaleUser` を渡す・props を required に昇格 ✅

**対象ファイル**:
- `app/(app)/users/page.tsx`
- `components/user-card/UserGrid.tsx`

**作業内容**
- `users/page.tsx` の `<UserGrid>` 呼び出しに `isFemaleUser={profile.gender === 'female'}` を追加する
- `UserGrid.tsx` の `Props` 型の `isFemaleUser` から `?` を外し、required に変更する

```typescript
// app/(app)/users/page.tsx
<UserGrid
  initialUsers={users}
  nextCursor={nextCursor}
  isFemaleUser={profile.gender === 'female'}
/>

// UserGrid.tsx Props（F-001 の optional → required に昇格）
type Props = {
  initialUsers: UserCardData[]
  nextCursor: string | null
  isFemaleUser: boolean
}
```

**完了条件**
- `npm run build` がエラーなく通る
- 女性ユーザーでログインすると `isFemaleUser={true}` が渡る
- 男性ユーザーでログインすると `isFemaleUser={false}` が渡る
- `profile.gender` の取得に追加の DB クエリが発生しない（`getOppositeUsers` 呼び出しに使う変数を流用する）

**ロールバック方法**
- `users/page.tsx` から `isFemaleUser={...}` を削除する
- `UserGrid.tsx` の `Props` 型の `isFemaleUser` を `?: boolean` に戻す（F-001 の状態に戻る）
- `users/page.tsx` はコンパイルが通る状態に戻る

**依存タスク**: F-001, F-004

---

### F-006 — `IkemenTypeFilter.tsx` 新規コンポーネント作成 ✅

**対象ファイル**: `components/user-filter/IkemenTypeFilter.tsx`（新規）

**作業内容**

```typescript
'use client'

import { IKEMEN_TYPES } from '@/lib/utils/ikemen-types'

type Props = {
  selectedTypeId: number | null
  onSelect: (typeId: number | null) => void
  disabled?: boolean
}

export default function IkemenTypeFilter({ selectedTypeId, onSelect, disabled }: Props)
```

- 横スクロールコンテナ: `flex gap-3 overflow-x-auto pb-2 scrollbar-none px-4`
- 「すべて」カード: 画像なし・テキストのみ・`w-20 h-24 rounded-xl`・垂直中央揃え
- タイプカード（12枚）: `type.image` を `<img>` タグで表示・`aspect-square object-cover object-top`・`w-20 rounded-xl`
- 各カードの選択状態クラス:
  - 未選択: `border-2 border-gray-200 bg-white`
  - 選択中: `border-2 border-primary-500 bg-primary-50`
- タイプカードのタップロジック:
  - `selectedTypeId === type.id`（再タップ）→ `onSelect(null)`
  - それ以外 → `onSelect(type.id)`
- 「すべて」カードのタップ: `onSelect(null)`
- `disabled={true}` のとき: コンテナ全体に `pointer-events-none opacity-60` を適用する

**完了条件**
- `UserGrid` への接続前に単体で `isFemaleUser={true}` の環境でレンダリングできる
- 375px 幅で横スクロールにより全12タイプカードに到達できる
- 選択中カードに `border-primary-500 bg-primary-50` が適用される
- 同一カードの再タップで `onSelect(null)` が呼ばれる
- `disabled={true}` のときカードをタップしても `onSelect` が呼ばれない

**ロールバック方法**
- `components/user-filter/IkemenTypeFilter.tsx` を削除する
- F-007 完了後の場合: `UserGrid.tsx` からのインポート文と `<IkemenTypeFilter>` の呼び出し箇所を削除する

**依存タスク**: F-001

---

### F-007 — `UserGrid` に `IkemenTypeFilter` を組み込み・条件表示 ✅

**対象ファイル**: `components/user-card/UserGrid.tsx`

**作業内容**
- `IkemenTypeFilter` をインポートする
- `isFemaleUser === true` のときのみカードグリッド上部に表示する
- `selectedTypeId`・`handleTypeSelect`・`isPending` を props に渡す

```tsx
return (
  <div>
    {isFemaleUser && (
      <IkemenTypeFilter
        selectedTypeId={selectedTypeId}
        onSelect={handleTypeSelect}
        disabled={isPending}
      />
    )}
    {/* カードグリッド */}
  </div>
)
```

**完了条件**
- 女性ユーザーの `/users` にフィルターバーが表示される
- 男性ユーザーの `/users` にフィルターバーが表示されない
- タイプカードをタップするとユーザー一覧がリセットされ、該当タイプの男性のみ表示される
- 「すべて」カードタップ・選択中カードの再タップで全件表示に戻る
- フィルター絞り込み後に末尾スクロールすると、同じフィルター条件で続きの20件が追加される
- フィルター切り替え中（`isPending = true`）はフィルターバー全体がタップ不能になる

**ロールバック方法**
- `{isFemaleUser && <IkemenTypeFilter ... />}` の JSX 部分を削除する
- `IkemenTypeFilter` のインポート文を削除する
- フィルター状態管理（F-004）と呼び出し元の props 渡し（F-005）は独立しているため、この変更のみでフィルターバーが非表示になり、F-004 の状態管理だけが残る（無害）

**依存タスク**: F-005, F-006

---

### F-008 — 0件・エラー状態の表示実装 ✅

**対象ファイル**: `components/user-card/UserGrid.tsx`

**作業内容**
- `fetchError: string | null` state を追加する
- `handleTypeSelect` に try/catch を追加し、Server Action が throw した場合に `fetchError` をセットする。エラー時は `users` を空配列にリセットしない（ちらつき防止）

```typescript
function handleTypeSelect(typeId: number | null) {
  startTransition(async () => {
    setSelectedTypeId(typeId)
    try {
      const result = await fetchUsersWithFilter(typeId ?? undefined)
      setUsers(result.users)
      setNextCursor(result.nextCursor)
      setFetchError(null)
    } catch {
      setFetchError('ユーザーの取得に失敗しました。画面を更新してください')
    }
  })
}
```

- カードグリッド部分の条件分岐を以下の3パターンに変更する:

```tsx
{fetchError ? (
  <p className="py-16 text-center text-sm text-gray-400">{fetchError}</p>
) : users.length === 0 && selectedTypeId !== null ? (
  <p className="py-16 text-center text-sm text-gray-400">
    このタイプに該当するユーザーはいません
  </p>
) : (
  /* 既存のカードグリッド */
)}
```

**完了条件**
- 該当タイプが0件のフィルターを選択したとき、「このタイプに該当するユーザーはいません」が表示される
- 空状態でもフィルターバーは操作可能で、他のタイプに切り替えられる
- 「すべて」状態（`selectedTypeId === null`）でユーザーが0人のときは空状態メッセージを表示しない
- ネットワークエラーで Server Action が throw したとき、「ユーザーの取得に失敗しました。画面を更新してください」が表示される
- エラー発生時に直前に表示していたユーザー一覧が消えない

**ロールバック方法**
- `fetchError` state と try/catch を削除する
- カードグリッドの条件分岐を F-007 直後の状態（分岐なし）に戻す

**依存タスク**: F-007

---

### F-009 — 動作確認チェックリスト（手動テスト）

**対象**: ブラウザ実機確認（375px 幅・Chrome DevTools モバイルビュー）

**確認項目**

| # | シナリオ | 期待結果 |
|---|---|---|
| 1 | 女性ユーザーで `/users` を開く | フィルターバーが表示される |
| 2 | 男性ユーザーで `/users` を開く | フィルターバーが表示されない |
| 3 | 任意のタイプカードをタップ | 枠線が `primary-500`・背景が `primary-50` に変わり、該当タイプの男性のみ表示される |
| 4 | 選択中のカードを再タップ | 選択解除・「すべて」状態に戻り全男性が表示される |
| 5 | 「すべて」カードをタップ | 選択解除・全男性が表示される |
| 6 | フィルターA選択 → フィルターB選択 | フィルターAのカーソルを引き継がず、フィルターBの男性が先頭から表示される |
| 7 | フィルター絞り込み後に末尾スクロール | 同じタイプフィルターを維持して続きの20件が追加される |
| 8 | 0件のタイプを選択 | 「このタイプに該当するユーザーはいません」が表示され、フィルターバーは操作可能のまま |
| 9 | 375px 幅でフィルターバーを横スクロール | 全12タイプカードに到達できる |
| 10 | フィルター切り替え連打（高速タップ） | 二重タップが防止され、最後にタップしたタイプの結果が表示される |

**完了条件**
- 上記10項目が全てパスする

**ロールバック方法**
- テスト専用タスクのためコード変更なし。失敗した項目に対応する実装タスク（F-002〜F-008）へ差し戻す

**依存タスク**: F-008

---

## 依存関係サマリー

```
F-001（互換性レイヤー）─────────────────────────────────┐
                                                        │
F-002（getOppositeUsers 引数追加）                       │
  └── F-003（loadMoreUsers + fetchUsersWithFilter）      │
        └── F-004（UserGrid 状態管理）                   │
              └── F-005（users/page.tsx + props required化）← F-001
                    └── F-007（IkemenTypeFilter 組み込み）← F-006
                          └── F-008（0件・エラー表示）
                                └── F-009（手動テスト）

F-006（IkemenTypeFilter 新規作成）← F-001（Props設計確認）
```

**並行実施可能なタスクの組み合わせ**
- F-001 と F-002 は互いに独立しており並行実施可能
- F-006 は F-001 の完了後、F-003〜F-005 と並行実施可能
