@AGENTS.md

# イケメンデート — CLAUDE.md

イケメン男性と出会いたい女性向けの Web マッチングアプリ。双方向いいねでマッチング成立後にテキストチャットができる。想定ユーザー 100 人・完全無料・課金なし。

---

## 技術スタック

| 分類 | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js App Router | 16.2.6 |
| UI | React | 19.2.4 |
| スタイリング | Tailwind CSS | v4 |
| 言語 | TypeScript | ^5 |
| BaaS | Supabase (Auth / DB / Storage / Realtime) | latest |
| デプロイ | Vercel | — |

---

## よく使うコマンド

```bash
npm install          # 依存インストール
npm run dev          # 開発サーバー起動（Turbopack）
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
npm run lint         # ESLint 実行
npx vitest           # 単体テスト実行
npx playwright test  # E2E テスト実行
```

---

## ディレクトリ構成のルール

```
app/
  (auth)/          # 未ログインでアクセス可能な認証ページ
  (app)/           # ログイン必須ページ。layout.tsx でセッション検証を行う
  auth/callback/   # Supabase Auth のコールバックルート（変更しない）

components/        # 共有 UI コンポーネント
  ui/              # Button, Input, Avatar など汎用部品
  auth/            # 認証フォーム群
  profile/         # プロフィール表示
  chat/            # チャット関連（Realtime を扱う Client Components）
  user-card/       # ユーザーカード
  like-button/     # いいねボタン（Client Component）
  navigation/      # ボトムナビゲーション

lib/
  actions/         # Server Actions のみ（クライアントから DB を直接叩かない）
  queries/         # DB クエリ関数（Server Components から呼び出す）
  validations/     # Zod スキーマ（サーバーサイドバリデーション）
  supabase/        # Supabase クライアント（server.ts / client.ts）
  utils/           # 副作用のない純粋関数（age, ikemen-types, prefectures）

supabase/
  migrations/      # SQL マイグレーションファイル（直接 DB を変更しない）
  seed.sql         # ikemen_types 初期データ
```

### 配置の判断基準

- **Server Component か Client Component か**: データ取得・初期表示は Server Component。ユーザーインタラクション（Realtime サブスクライブ・フォーム状態管理）は Client Component。
- **Server Action か クライアント fetch か**: 書き込みはすべて Server Actions 経由。クライアントから Supabase に直接 INSERT / UPDATE / DELETE しない。
- **queries/ か actions/ か**: 読み取りは `queries/`、書き込みは `actions/`。両方を混在させない。

---

## コーディング規約

### TypeScript

- `any` は使用禁止。型が不明な場合は `unknown` + 型ガードを使う
- `lib/supabase/types.ts` は `supabase gen types typescript` で生成する。手書きしない
- Supabase クライアントの型ジェネリクス（`createBrowserClient<Database>()`）は使用しない。結果を `as` キャストする（v2.98+ の型推論崩壊回避）

### コンポーネント

- ファイル名・コンポーネント名は PascalCase（例: `UserCard.tsx`）
- `'use client'` ディレクティブは必要最小限のコンポーネントにのみ付与する
- props の型は同ファイル内に `type Props = {...}` として定義する（`interface` は使わない）

### Server Actions

- ファイルの先頭に `'use server'` を記述する
- 戻り値の型は `Promise<{ error?: string }>` に統一する（成功時は `error` を返さない）
- 退会など成功時に必ずリダイレクトで完結するアクションは `Promise<void>` も可
- `revalidatePath` は Action の末尾で呼び出す

### スタイリング

- Tailwind クラスのみ使用。インラインスタイル・CSS Modules は使わない
- モバイルファーストで記述する（デフォルトがモバイル、`sm:` 以上で PC 対応）
- 最小画面幅は 375px（iPhone SE）を基準にする

### Supabase クライアントの使い分け

| 場所 | 使用するクライアント |
|---|---|
| Server Components / Server Actions | `lib/supabase/server.ts` の `createServerSupabaseClient()` |
| Client Components | `lib/supabase/client.ts` の `getSupabaseBrowserClient()`（シングルトン） |

---

## 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| コンポーネントファイル | PascalCase | `UserCard.tsx`, `LikeButton.tsx` |
| それ以外のファイル | kebab-case | `age.ts`, `ikemen-types.ts` |
| Server Actions 関数 | camelCase・動詞始まり | `registerUser`, `sendLike`, `withdrawUser` |
| クエリ関数 | camelCase・`get` 始まり | `getOppositeUsers`, `getMessages` |
| 型・型エイリアス | PascalCase | `UserCardData`, `LikeStatus`, `Message` |
| DB カラム | snake_case（Supabase 規約に従う） | `sender_id`, `is_onboarding_complete` |
| Zod スキーマ変数 | camelCase・`Schema` サフィックス | `registerSchema`, `onboardingMaleSchema` |
| Storage パス | `avatars/{userId}.{ext}` | `avatars/abc123.jpg` |

---

## やってはいけないこと

### データアクセス

- **クライアントから DB に直接 INSERT / UPDATE / DELETE しない** — 書き込みは Server Actions のみ
- **RLS を無効化しない** — `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` は絶対に実行しない
- **`supabaseAdmin`（Service Role Key）をクライアントに渡さない** — Service Role Key は Server Actions 内でのみ使う
- **`profiles` テーブルへ直接 INSERT しない** — `auth.users` 作成時に発火する `handle_new_user` トリガーが自動生成する。Server Action は `createUser({ user_metadata: { gender, birth_date } })` で `user_metadata` を渡すだけでよい
- **`matches` テーブルに直接 INSERT しない** — マッチング生成は `likes` INSERT トリガー（`on_like_inserted`）が担う

### 認証・バリデーション

- **年齢確認をフロントエンドのみで行わない** — Server Actions でサーバーサイドバリデーション必須
- **メール確認前のユーザーをログイン状態にしない** — `email_confirmed_at` を確認してからセッションを発行する

### データ削除

- **退会時に `matches` / `messages` レコードを DELETE しない** — FK を SET NULL でチャット履歴を保持する
- **`profiles` を直接 DELETE しない** — `auth.users` を Admin API で削除すると CASCADE で `profiles` が消える

### UI / スタイリング

- **`min-w-[375px]` 未満の画面を想定したスタイルを書かない**
- **Realtime 以外でポーリングを使わない** — チャットのリアルタイム性は Supabase Realtime（WebSocket）で実現する

### その他

- **`supabase/migrations/` を手動で編集しない** — Supabase CLI のマイグレーションコマンドで管理する
- **`ikemen_types` テーブルの初期データを変更しない** — `display_order` が一覧の表示順・カードバッジの選択ロジックに影響する
- **`matches.user1_id < matches.user2_id` の順序を崩さない** — UNIQUE 制約と CHECK 制約がこの前提に依存している
