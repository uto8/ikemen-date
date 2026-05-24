# 影響範囲調査 — イケメンタイプフィルター機能

## 概要

女性ユーザーがユーザー一覧（`/users`）でイケメンタイプを画像カードで選択し、
男性ユーザーを絞り込める機能。

---

## 変更・追加が必要なファイル一覧

### 変更（既存ファイル）

| ファイル | 変更内容 | 破壊的変更 |
|---|---|---|
| `lib/queries/users.ts` | `getOppositeUsers` に `ikemenTypeId?: number` を追加 | なし（任意引数） |
| `lib/actions/users.ts` | `loadMoreUsers(cursor, ikemenTypeId?)` に引数追加 | なし（任意引数） |
| `components/user-card/UserGrid.tsx` | フィルター状態の保持・変更時リセット・再取得ロジックを追加 | なし |
| `app/(app)/users/page.tsx` | 現在のユーザーの性別を `UserGrid` に props 渡し | なし |

### 追加（新規ファイル）

| ファイル | 内容 |
|---|---|
| `components/user-filter/IkemenTypeFilter.tsx` | 画像カード選択 UI（横スクロール） |
| `lib/actions/users.ts` 内に新関数追加 OR 既存を拡張 | フィルター変更時の初回ページ取得用 Server Action |

---

## 影響を受ける既存機能

### 直接影響

| 機能 | 影響 | 理由 |
|---|---|---|
| ユーザー一覧（`/users`） | あり | フィルター UI 追加、リスト取得ロジック変更 |
| 無限スクロール | あり | フィルター変更時にカーソルリセットと再取得が必要 |

### 間接影響（ほぼなし）

| 機能 | 影響 | 理由 |
|---|---|---|
| ユーザー詳細（`/users/[id]`） | なし | データモデル変更なし |
| いいね・マッチング | なし | 絞り込みはあくまで表示フィルター |
| オンボーディング | なし | `IKEMEN_TYPES` 定数への `image` 追加は完了済み |
| プロフィール編集 | なし | 同上 |

---

## 既存のデータモデルへの変更

### マイグレーション：不要

フィルターに必要なデータはすべて既存テーブルに存在する。

```
profile_ikemen_types
  ├── profile_id     uuid      (FK → profiles.id)
  └── ikemen_type_id smallint  (FK → ikemen_types.id)
```

- `getOppositeUsers` のクエリに `.eq('profile_ikemen_types.ikemen_type_id', id)` + `!inner` JOIN を追加するだけで絞り込みが実現できる
- 新規テーブル・カラム・インデックスの追加は不要

---

## 既存 API への変更

### `getOppositeUsers`（`lib/queries/users.ts`）

```typescript
// 変更前
getOppositeUsers(currentUserId: string, currentGender: string, cursor?: string)

// 変更後
getOppositeUsers(currentUserId: string, currentGender: string, cursor?: string, ikemenTypeId?: number)
```

- 任意引数の追加のみ → **破壊的変更なし**
- 既存の呼び出し元（`users/page.tsx`・`actions/users.ts`）はそのまま動作する

### `loadMoreUsers`（`lib/actions/users.ts`）

```typescript
// 変更前
loadMoreUsers(cursor: string): Promise<PaginatedUsers>

// 変更後
loadMoreUsers(cursor: string, ikemenTypeId?: number): Promise<PaginatedUsers>
```

- 任意引数の追加のみ → **破壊的変更なし**
- `UserGrid.tsx` 内の呼び出しを更新する必要あり（フィルター状態を渡す）

### `UserGrid` コンポーネントの props

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
  isFemaleUser: boolean   // 追加：フィルターUIの表示制御用
}
```

- 既存の呼び出し元（`users/page.tsx`）に `isFemaleUser` を渡す変更が必要

---

## 影響を受けるテスト

### 既存テストへの影響

| テストファイル | 影響 |
|---|---|
| `lib/queries/users.test.ts` | `transformToUserCardData` 等の純粋関数テストのみ → **変更不要** |
| `lib/validations/profile.test.ts` | バリデーションスキーマは変更なし → **変更不要** |
| `lib/validations/auth.test.ts` | 変更なし → **影響なし** |
| `lib/queries/matches.test.ts` | 変更なし → **影響なし** |
| `e2e/auth.spec.ts` | 変更なし → **影響なし** |
| `e2e/protected-routes.spec.ts` | 変更なし → **影響なし** |

### 新規テストの推奨（任意）

- `getOppositeUsers` にフィルター引数を渡したときの絞り込み動作（結合テスト）
- フィルター変更時のカーソルリセット動作（コンポーネントテスト）

---

## リスクと懸念点

### 1. カーソルとフィルターの組み合わせ問題（中リスク）

カーソルは `created_at` タイムスタンプベース。フィルター変更時に前のフィルターのカーソルをそのまま使うと、異なるタイプのデータを誤って続きから取得してしまう。

**対策：** フィルター変更時に `cursor` と `users` 状態を両方リセットし、初回取得と同じ状態から再スタートする。初回取得用に `fetchUsersWithFilter(ikemenTypeId?)` Server Action を別途用意する（または `loadMoreUsers` の `cursor` を空文字 `""` として扱う分岐を追加する）。

### 2. `!inner` JOIN によるパフォーマンスへの影響（低リスク）

フィルターあり時は `profile_ikemen_types` を `INNER JOIN` に変更する。ユーザー数が現在 100人程度の想定のため、インデックスなしでも問題ないレベル。ただし将来的なスケールを考えると `profile_ikemen_types(ikemen_type_id)` へのインデックス追加を検討。

### 3. フィルターなし時のクエリ変化なし確認（低リスク）

`ikemenTypeId` が `undefined` のとき、既存と同じクエリが実行されることを確認する必要がある。`!inner` JOIN をフィルターあり時のみ条件分岐でつけ、`undefined` 時は現行の LEFT JOIN を維持する実装にする。

### 4. 「タイプなしの男性」の扱い（低リスク）

DB 制約（`check_male_ikemen_types` トリガー）によりオンボーディング完了時に最低1タイプが必須。`is_onboarding_complete = true` を条件にしているので、タイプ未設定の男性は一覧に表示されない。フィルター時も同様に問題なし。

### 5. `UserGrid.tsx` の責務肥大（低リスク）

現在の `UserGrid.tsx` はリスト表示＋無限スクロールのみ担当。フィルター状態管理を同じコンポーネントに追加すると責務が広がる。問題になるほどのサイズではないが、`UsersPageClient.tsx` として分離する選択肢もある。
