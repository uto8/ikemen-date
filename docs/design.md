# イケメンデート 技術設計書

最終更新: 2026-05-24（requirements・data-model との整合性修正）

---

## 1. アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                    ブラウザ（Safari / Chrome）             │
│  Next.js 16 App Router（Vercel Edge Network）             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Server       │  │ Client       │  │ Supabase      │  │
│  │ Components   │  │ Components   │  │ Realtime      │  │
│  │ Server       │  │ (React 19)   │  │ (WebSocket)   │  │
│  │ Actions      │  │              │  │               │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                  │           │
└─────────┼─────────────────┼──────────────────┼───────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                      Supabase (Free プラン)               │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │  PostgreSQL   │  │ Supabase Auth │  │  Storage    │  │
│  │  (RLS 有効)   │  │ (Email+PW)    │  │  (Public)   │  │
│  └───────────────┘  └───────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### データフローの原則

- **読み取り**: Server Components がサーバーサイドで Supabase をクエリし、初期 HTML として配信する
- **書き込み**: Server Actions がサーバーサイドでバリデーション → DB 更新を担う（クライアントから直接 DB を叩かない）
- **リアルタイム**: チャット画面のみ Client Components で Supabase Realtime（WebSocket）をサブスクライブする

---

## 2. 技術スタック

| 分類 | 採用技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js (App Router) | 16.2.6 |
| UI ライブラリ | React | 19.2.4 |
| スタイリング | Tailwind CSS | v4 |
| 言語 | TypeScript | ^5 |
| BaaS | Supabase | latest |
| デプロイ | Vercel | — |

### 選定理由と代替案の比較

#### Next.js 16（App Router）を採用した理由

Server Actions によりフォームのサーバーサイドバリデーションとアカウント作成を同一関数内に記述できる。要件定義書の「サーバーサイドで検証してからアカウントを作成」という制約を自然に実現できる。  
代替として Remix も Server/Client の分離が明確だが、Vercel との親和性・Supabase SDK の豊富なサンプルを優先して Next.js を選択した。

#### Supabase を採用した理由

Auth・PostgreSQL・Realtime・Storage を単一サービスで提供し、Realtime チャットの要件（ポーリング禁止）を追加コストなく満たせる。Free プランで想定ユーザー 100 人・同時接続 100 の規模に十分対応できる。  
代替として Firebase があるが、PostgreSQL + RLS による行レベルアクセス制御の表現力（JOIN・複合ポリシー）と SQL の使い慣れた構文を優先して Supabase を選択した。

#### Tailwind CSS v4 を採用した理由

CSS ファイル不要でコンポーネントにスタイルを閉じ込められる。モバイルファースト設計と相性がよく、`sm:` / `md:` プレフィックスでレスポンシブを宣言的に記述できる。CSS Modules や styled-components に比べて設計書の規約が少ない分、小規模チームでの一貫性が保ちやすい。

---

## 3. ディレクトリ構成

```
ikemen-date/
├── app/                          # Next.js App Router のルートディレクトリ
│   ├── layout.tsx                # ルートレイアウト（フォント・共通メタ）
│   ├── globals.css               # Tailwind v4 のグローバルスタイル
│   ├── page.tsx                  # トップ（ランディング）ページ
│   │
│   ├── (auth)/                   # 認証関連ページ群（ルートグループ）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx          # 確認メール送信済み画面
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   │
│   ├── (app)/                    # ログイン必須ページ群（ルートグループ）
│   │   ├── layout.tsx            # セッション検証 + ナビゲーション
│   │   ├── onboarding/
│   │   │   └── page.tsx          # プロフィール登録（性別で UI 分岐）
│   │   ├── users/
│   │   │   ├── page.tsx          # ユーザー一覧（ギャラリー）
│   │   │   └── [id]/
│   │   │       └── page.tsx      # ユーザー詳細
│   │   ├── likes/
│   │   │   └── page.tsx          # もらったいいね一覧
│   │   ├── matches/
│   │   │   └── page.tsx          # マッチング一覧
│   │   ├── chat/
│   │   │   └── [match_id]/
│   │   │       └── page.tsx      # チャット画面
│   │   └── settings/
│   │       └── page.tsx          # 退会ページ（設定）
│   │
│   └── auth/
│       └── callback/
│           └── route.ts          # Supabase Auth コールバックルート
│
├── components/                   # 共有 UI コンポーネント
│   ├── ui/                       # 汎用 UI 部品（Button, Input, Avatar 等）
│   ├── auth/                     # 認証フォーム群
│   ├── profile/                  # プロフィール表示・編集
│   ├── user-card/                # ユーザーカード（一覧用）
│   ├── user-filter/              # イケメンタイプフィルターバー（女性向け）
│   ├── like-button/              # いいねボタン（Client Component）
│   ├── chat/                     # チャット関連（メッセージ一覧・入力欄）
│   └── navigation/               # ボトムナビゲーション
│
├── lib/                          # ビジネスロジック・ユーティリティ
│   ├── supabase/
│   │   ├── server.ts             # サーバーサイド Supabase クライアント
│   │   ├── client.ts             # クライアントサイド Supabase クライアント
│   │   └── types.ts              # Database 型定義（supabase gen types で生成）
│   ├── actions/                  # Server Actions
│   │   ├── auth.ts               # 登録・ログイン・ログアウト・PW リセット
│   │   ├── profile.ts            # オンボーディング・プロフィール更新
│   │   ├── like.ts               # いいね送信
│   │   └── user.ts               # 退会処理
│   ├── queries/                  # DB クエリ関数（Server Components 向け）
│   │   ├── users.ts
│   │   ├── likes.ts
│   │   ├── matches.ts
│   │   └── messages.ts
│   ├── validations/              # Zod スキーマ定義
│   │   ├── auth.ts
│   │   └── profile.ts
│   └── utils/
│       ├── age.ts                # 生年月日 → 年齢算出
│       ├── ikemen-types.ts       # イケメンタイプ定義（定数）
│       └── prefectures.ts        # 47 都道府県定義（定数）
│
├── public/
│   └── default-avatar.png        # デフォルトアバター画像
│
├── supabase/
│   ├── migrations/               # SQL マイグレーションファイル
│   └── seed.sql                  # ikemen_types 初期データ
│
└── docs/
    ├── requirements.md
    ├── data-model.md
    └── design.md                 # 本ファイル
```

---

## 4. データモデル（詳細）

### テーブル一覧と関係

```
auth.users (Supabase 管理)
  └── 1:1 → public.profiles (ON DELETE CASCADE)
                ├── 1:N → profile_ikemen_types (ON DELETE CASCADE)
                │           └── N:1 → ikemen_types (固定参照)
                ├── 1:N → likes.sender_id    (ON DELETE CASCADE)
                ├── 1:N → likes.receiver_id  (ON DELETE CASCADE)
                ├── 1:N → matches.user1_id   (ON DELETE SET NULL)
                ├── 1:N → matches.user2_id   (ON DELETE SET NULL)
                └── 1:N → messages.sender_id (ON DELETE SET NULL)
                                  ↑
matches.id → 1:N → messages.match_id (ON DELETE CASCADE)
```

### DDL（マイグレーション用）

```sql
-- profiles
CREATE TABLE public.profiles (
  id                   uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gender               text        NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date           date        NOT NULL,
  nickname             varchar(20) NOT NULL,
  prefecture           varchar(10) NOT NULL,
  avatar_url           text,
  occupation           varchar(30),
  height               smallint    CHECK (height BETWEEN 100 AND 250),
  bio                  text        CHECK (bio IS NULL OR char_length(bio) BETWEEN 1 AND 300),
  is_onboarding_complete boolean   NOT NULL DEFAULT false,
  likes_last_read_at   timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_male_fields_required CHECK (
    gender = 'female'
    OR (avatar_url IS NOT NULL AND occupation IS NOT NULL
        AND height IS NOT NULL AND bio IS NOT NULL)
  )
);
CREATE INDEX ON public.profiles (gender);

-- ikemen_types
CREATE TABLE public.ikemen_types (
  id            smallint    PRIMARY KEY,
  name          varchar(30) NOT NULL UNIQUE,
  display_order smallint    NOT NULL UNIQUE
);

-- profile_ikemen_types
CREATE TABLE public.profile_ikemen_types (
  profile_id     uuid     NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ikemen_type_id smallint NOT NULL REFERENCES public.ikemen_types(id),
  PRIMARY KEY (profile_id, ikemen_type_id)
);

-- likes
CREATE TABLE public.likes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- matches
CREATE TABLE public.matches (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  user2_id   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- messages
CREATE TABLE public.messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   uuid        NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  content    text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  is_read    boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.messages (match_id, created_at ASC);
CREATE INDEX ON public.messages (match_id, is_read);
```

### RLS ポリシー方針

| テーブル | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | 全ログインユーザーが読める | 禁止（handle_new_user トリガーが SECURITY DEFINER で実行） | 自分の ID のみ | 禁止（auth.users 削除による CASCADE で自動削除） |
| ikemen_types | 全ログインユーザーが読める | 禁止 | 禁止 | 禁止 |
| profile_ikemen_types | 全ログインユーザーが読める | 自分の profile_id のみ | 禁止 | 自分の profile_id のみ |
| likes | 自分が送受信したもの | 自分が sender のもの | 禁止 | 禁止 |
| matches | 自分が user1 or user2 のもの | 禁止（DB トリガーで生成） | 禁止 | 禁止 |
| messages | 自分が含まれる match_id のもの | 自分が sender かつ match に属する | is_read = true への更新のみ（sender_id != 自分 かつ match に属するもの） | 禁止 |

`matches` の INSERT は `likes` テーブルへの INSERT をトリガーにした DB 関数で実行し、アプリから直接 INSERT させない。これにより「双方向いいねのみマッチング成立」という制約をDB層で担保する。

### マッチング生成トリガー

```sql
CREATE OR REPLACE FUNCTION create_match_if_mutual()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  reverse_like_exists boolean;
  uid1 uuid;
  uid2 uuid;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.likes
    WHERE sender_id = NEW.receiver_id AND receiver_id = NEW.sender_id
  ) INTO reverse_like_exists;

  IF reverse_like_exists THEN
    uid1 := LEAST(NEW.sender_id, NEW.receiver_id);
    uid2 := GREATEST(NEW.sender_id, NEW.receiver_id);
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (uid1, uid2)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_like_inserted
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION create_match_if_mutual();
```

---

## 5. 主要な API / 関数 / コンポーネントのインターフェース

### 5.1 Server Actions（`lib/actions/`）

#### `registerUser` — 新規登録

```typescript
// lib/actions/auth.ts
export async function registerUser(
  formData: FormData
): Promise<{ error?: string }>;
```

処理フロー:
1. `formData` から `email`, `password`, `gender`, `birthDate` を取得
2. Zod スキーマでサーバーサイドバリデーション（年齢・パスワード強度・性別）
3. Supabase Admin API（`supabaseAdmin.auth.admin.createUser({ user_metadata: { gender, birth_date } })`）でアカウント作成。DB トリガー `handle_new_user` が `profiles(id, gender, birth_date)` を自動生成する
4. 成功時: `/verify-email` にリダイレクト

エラー: バリデーション違反は `{ error: "..." }` を返す。Supabase エラーの `email_address_not_authorized` はフロントに「このメールアドレスはすでに使用されています」として返す。

#### `completeOnboarding` — プロフィール登録

```typescript
// lib/actions/profile.ts
export async function completeOnboarding(
  formData: FormData
): Promise<{ error?: string }>;
```

処理フロー:
1. セッションから `userId` と `gender` を取得
2. 性別に応じたバリデーション（男性: 画像・職業・身長・自己紹介・イケメンタイプ必須）
3. 画像が含まれる場合: Supabase Storage `avatars/{userId}.{ext}` にアップロード
4. `profiles` を UPDATE（`avatar_url`, `nickname`, `prefecture`, 男性専用フィールド）
5. 男性の場合: `profile_ikemen_types` を一括 INSERT
6. `is_onboarding_complete = true` に設定
7. `/users` にリダイレクト

#### `sendLike` — いいね送信

```typescript
// lib/actions/like.ts
export async function sendLike(
  receiverId: string
): Promise<{ error?: string }>;
```

処理フロー:
1. セッションから `senderId` を取得
2. `likes` テーブルに `{ sender_id, receiver_id }` を INSERT
3. INSERT トリガーが双方向チェック → マッチング生成を DB 側で実行
4. 成功時: `{ error: undefined }` を返す（画面更新は `revalidatePath`）

#### `withdrawUser` — 退会

```typescript
// lib/actions/user.ts
export async function withdrawUser(): Promise<void>;
```

処理フロー:
1. セッションから `userId` を取得
2. Storage の `avatars/{userId}.*` を削除
3. `auth.users` を Admin API で削除（CASCADE により `profiles` → `likes` → `profile_ikemen_types` も削除）
4. `matches` / `messages` の FK は DB 側で SET NULL
5. セッションをクリアして `/` にリダイレクト

### 5.2 クエリ関数（`lib/queries/`）

#### ユーザー一覧取得

```typescript
// lib/queries/users.ts
export type UserCardData = {
  id: string;
  nickname: string;
  prefecture: string;
  avatar_url: string | null;
  age: number;                       // birth_date から算出済み
  primary_ikemen_type?: string;      // 男性のみ（display_order 最小）
};

export type PaginatedUsers = {
  users: UserCardData[];
  nextCursor: string | null;         // 次ページ取得用 created_at タイムスタンプ
};

export async function getOppositeUsers(
  currentUserId: string,
  currentGender: 'male' | 'female',
  cursor?: string,
  ikemenTypeId?: number              // 女性向けフィルター。undefined = 全件
): Promise<PaginatedUsers>;
```

クエリ: `profiles` を `gender != currentGender` でフィルタリングし、`created_at DESC`（新着順）でソート。男性の場合は `profile_ikemen_types` を JOIN して `display_order` 最小のタイプを 1 件取得。`ikemenTypeId` が指定された場合は `profile_ikemen_types` を `INNER JOIN`（`!inner`）し、`ikemen_type_id = ikemenTypeId` で男性を絞り込む。詳細: `docs/features/ikemen-type-filter/design.md`

#### フィルター付き初回取得（`lib/actions/users.ts`）

```typescript
// フィルター切り替え時のカーソルリセットを伴う先頭ページ取得
export async function fetchUsersWithFilter(
  ikemenTypeId?: number
): Promise<PaginatedUsers>;

// 無限スクロールの追加取得（フィルター状態を引き継ぐ）
export async function loadMoreUsers(
  cursor: string,
  ikemenTypeId?: number
): Promise<PaginatedUsers>;
```

#### いいね状態取得

```typescript
// lib/queries/likes.ts
export type LikeStatus = 'none' | 'sent' | 'received' | 'matched';

export async function getLikeStatus(
  currentUserId: string,
  targetUserId: string
): Promise<LikeStatus>;
```

#### マッチング一覧取得

```typescript
// lib/queries/matches.ts
export type MatchWithPartner = {
  matchId: string;
  partner: UserCardData;
  createdAt: string;
  unreadCount: number;
};

export async function getMyMatches(
  currentUserId: string
): Promise<MatchWithPartner[]>;
```

クエリ: `user1_id IS NOT NULL AND user2_id IS NOT NULL` で絞り込み。自分の ID と逆側の `user_id` でパートナー情報を JOIN する。

#### チャット履歴取得

```typescript
// lib/queries/messages.ts
export type Message = {
  id: string;
  senderId: string | null;     // null = 退会済みユーザー
  content: string;
  createdAt: string;
  isMine: boolean;
};

export async function getMessages(
  matchId: string,
  currentUserId: string
): Promise<Message[]>;
```

### 5.3 主要コンポーネント

#### `<LikeButton>` — いいねボタン（Client Component）

```typescript
// components/like-button/LikeButton.tsx
type Props = {
  receiverId: string;
  initialStatus: 'none' | 'sent' | 'received';
};

export function LikeButton({ receiverId, initialStatus }: Props): JSX.Element;
```

- `initialStatus` に応じて「いいね」または「いいね済み」を初期表示
- 押下時に `sendLike` Server Action を `useTransition` で呼び出す
- 成功後にボタンをローカルで「いいね済み（非活性）」に更新

#### `<ChatMessages>` — チャットメッセージ一覧（Client Component）

```typescript
// components/chat/ChatMessages.tsx
type Props = {
  matchId: string;
  currentUserId: string;
  initialMessages: Message[];
  isPartnerActive: boolean;   // false = 退会済み
};

export function ChatMessages(props: Props): JSX.Element;
```

- マウント時に Supabase Realtime をサブスクライブ（`messages` テーブルの `match_id = matchId` フィルタ）
- 新着メッセージを受信するたびにローカル state に追加
- `isPartnerActive = false` のとき入力欄と送信ボタンを `disabled` に設定

#### `<UserCard>` — ユーザーカード

```typescript
// components/user-card/UserCard.tsx
type Props = {
  user: UserCardData;
  href: string;
};

export function UserCard({ user, href }: Props): JSX.Element;
```

#### `<BottomNav>` — ボトムナビゲーション

```typescript
// components/navigation/BottomNav.tsx
// タブ: ユーザー一覧 / もらったいいね / マッチング / 設定
export function BottomNav(): JSX.Element;
```

### 5.4 Supabase クライアント

```typescript
// lib/supabase/server.ts — Server Components / Server Actions 用
import { createServerClient } from '@supabase/ssr';
export function createServerSupabaseClient(): SupabaseClient;

// lib/supabase/client.ts — Client Components 用（シングルトン）
import { createBrowserClient } from '@supabase/ssr';
export function getSupabaseBrowserClient(): SupabaseClient;
```

型ジェネリクスは使用せず、結果を `as` キャストする（Supabase v2.98+ の型推論崩壊を回避するため）。

---

## 6. エラーハンドリング方針

### 分類と対応

| エラー種別 | 発生箇所 | 対応方針 |
|---|---|---|
| バリデーションエラー | Server Actions / フォーム | `{ error: "..." }` を返し、フォーム横にインラインメッセージを表示 |
| 認証エラー（未ログイン） | `(app)/layout.tsx` | `/login` にリダイレクト |
| オンボーディング未完了 | `(app)/layout.tsx` | `/onboarding` にリダイレクト |
| 権限エラー（RLS） | クエリ / Server Actions | `error.code === 'PGRST116'` を 403 として扱い、一覧にリダイレクト |
| チャット不正アクセス | `/chat/[match_id]` Server Component | マッチング確認失敗時は `/matches` にリダイレクト |
| Storage アップロード失敗 | `completeOnboarding` | ロールバック（profiles UPDATE はせず）してエラーを返す |
| 退会済みパートナーのチャット | `<ChatMessages>` | バナー表示・入力 UI 非活性化 |
| Realtime 切断 | `<ChatMessages>` | 自動再接続（Supabase JS SDK デフォルト動作）。再接続後に履歴を再取得 |

### エラーメッセージの原則

- ユーザー向けメッセージには技術的詳細（スタックトレース・DB エラーコード）を含めない
- サーバー側エラーは `console.error` で記録するが、クライアントには汎用メッセージを返す
- メールアドレス列挙攻撃を防ぐため、パスワードリセットは登録済み・未登録を区別しない同一メッセージを返す

---

## 7. テスト方針

### スコープ

100 ユーザー規模・本番環境のみ・ステージング環境なしという制約から、E2E テストより軽量な単体テストを優先する。

### テスト対象と優先度

| 対象 | 種別 | 優先度 | 内容 |
|---|---|---|---|
| `lib/validations/auth.ts` | Unit（Vitest） | 高 | 年齢計算・パスワード強度・必須チェックのバリデーション境界値 |
| `lib/validations/profile.ts` | Unit（Vitest） | 高 | 性別別の必須フィールド検証 |
| `lib/utils/age.ts` | Unit（Vitest） | 高 | 誕生日当日・前日の年齢算出（境界値） |
| `lib/utils/ikemen-types.ts` | Unit（Vitest） | 中 | display_order 最小値選択ロジック |
| 認証フロー全体 | E2E（Playwright） | 中 | 登録 → メール確認 → オンボーディング → 一覧 |
| いいね → マッチング | E2E（Playwright） | 中 | 双方向いいね後にチャットが開けることの確認 |
| チャット制限 | E2E（Playwright） | 低 | 未マッチのチャット URL 直アクセスでリダイレクト |

### 単体テストの命名規則

```
describe('registerUser validation') {
  it('17歳は登録を拒否する')
  it('18歳の誕生日当日は登録を許可する')
  it('英字のみパスワードはエラー')
  it('8文字英数混在パスワードは通過する')
}
```

### E2E テストの対象外

- Supabase Auth のメール送信フロー（Supabase の責務）
- Realtime の WebSocket 接続（インフラ依存）
- Storage のファイルアップロード実体（モックで代替）

### CI / CD

Vercel の Preview Deployment は使用しない（本番環境のみ）。GitHub Actions で `npm run build` と `npm run lint` を PR ごとに実行し、ビルドエラーとリント違反を検出する。

---

## 8. 未決事項との設計上の対応

| # | 未決事項 | 現時点の設計上の扱い |
|---|---|---|
| 1 | ページネーション方式 | `getOppositeUsers` の戻り値を配列にしており、後から `cursor` パラメータや `page` パラメータを追加しやすい設計にしておく |
| 2 | プロフィール編集 | `completeOnboarding` とは別に `updateProfile` Server Action のスロットを `lib/actions/profile.ts` に予約しておく |
| 3 | チャット履歴上限 | `getMessages` に `limit?: number` オプションを付けておき、デフォルトは全件取得とする |
| 4 | カスタムドメイン | Vercel の設定のみで対応可能。アプリコードに影響なし |
| 5 | OGP | `app/layout.tsx` の `metadata` オブジェクトに後から追加するだけ |
