# イケメンデート データモデル

最終更新: 2026-05-24

---

## ER図

```mermaid
erDiagram
    auth_users ||--|| profiles : "1:1"
    profiles ||--o{ profile_ikemen_types : "has"
    ikemen_types ||--o{ profile_ikemen_types : "categorized_by"
    profiles ||--o{ likes : "sends"
    profiles ||--o{ likes : "receives"
    profiles o|--o{ matches : "user1 (nullable)"
    profiles o|--o{ matches : "user2 (nullable)"
    matches ||--o{ messages : "has"
    profiles o|--o{ messages : "sends (nullable)"

    auth_users {
        uuid id PK
        text email
        timestamptz email_confirmed_at
        timestamptz created_at
    }

    profiles {
        uuid id PK_FK
        text gender
        date birth_date
        varchar_20 nickname
        varchar_10 prefecture
        text avatar_url
        varchar_30 occupation
        smallint height
        text bio
        boolean is_onboarding_complete
        timestamptz created_at
        timestamptz updated_at
    }

    ikemen_types {
        smallint id PK
        varchar_30 name
        smallint display_order
    }

    profile_ikemen_types {
        uuid profile_id PK_FK
        smallint ikemen_type_id PK_FK
    }

    likes {
        uuid id PK
        uuid sender_id FK
        uuid receiver_id FK
        timestamptz created_at
    }

    matches {
        uuid id PK
        uuid user1_id "NULLABLE FK"
        uuid user2_id "NULLABLE FK"
        timestamptz created_at
    }

    messages {
        uuid id PK
        uuid match_id FK
        uuid sender_id "NULLABLE FK"
        text content
        timestamptz created_at
    }
```

---

## テーブル定義

### `auth.users`（Supabase Auth 管理）

Supabase Auth が内部管理するテーブル。アプリ側では直接作成しない。`profiles.id` の参照先。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK | Supabase Auth が自動生成 |
| email | text | UNIQUE NOT NULL | ログイン用メールアドレス |
| email_confirmed_at | timestamptz | NULLABLE | NULL = メール未確認 |
| created_at | timestamptz | NOT NULL | アカウント作成日時 |

---

### `public.profiles`

`auth.users` と 1:1 で対応するプロフィールテーブル。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK, FK → auth.users.id ON DELETE CASCADE | auth.users と同一 UUID |
| gender | text | NOT NULL, CHECK IN ('male','female') | 新規登録時に確定。変更不可 |
| birth_date | date | NOT NULL | 新規登録時に入力済み。18歳未満は Server Action で拒否済み |
| nickname | varchar(20) | NOT NULL | 重複許容（UNIQUE 制約なし） |
| prefecture | varchar(10) | NOT NULL | 47都道府県のいずれか |
| avatar_url | text | NULLABLE | Supabase Storage の**ファイルパス**のみ保存（例: `avatars/{uuid}.jpg`）。表示時は `getPublicUrl()` でURL生成。男性は必須（アプリレイヤーで担保） |
| occupation | varchar(30) | NULLABLE | 男性のみ使用。女性レコードは NULL |
| height | smallint | NULLABLE, CHECK 100〜250 | 男性のみ使用。女性レコードは NULL |
| bio | text | NULLABLE | 男性のみ使用（最大 300 文字はアプリレイヤーで担保）。女性レコードは NULL |
| is_onboarding_complete | boolean | NOT NULL DEFAULT false | オンボーディング完了後に true に設定。一度 true になったら false には戻さない |
| created_at | timestamptz | NOT NULL DEFAULT now() | |
| updated_at | timestamptz | NOT NULL DEFAULT now() | |

**CHECK 制約（男性専用フィールドの必須担保）**

```sql
CONSTRAINT profiles_male_fields_required CHECK (
  gender = 'female'
  OR (
    avatar_url  IS NOT NULL AND
    occupation  IS NOT NULL AND
    height      IS NOT NULL AND
    bio         IS NOT NULL
  )
)
```

**インデックス**
- `gender` — 一覧フィルタリング（異性表示）で使用

**削除ポリシー**
- `auth.users` 削除時に CASCADE DELETE

---

### `public.ikemen_types`

イケメンタイプの固定参照テーブル。初期 seed で 12 件を投入し、以後変更しない。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | smallint | PK | 1〜12 の固定値 |
| name | varchar(30) | NOT NULL UNIQUE | タイプ名称 |
| display_order | smallint | NOT NULL UNIQUE | 一覧表示順（= id と同一） |

**初期データ**

| id | name |
|---|---|
| 1 | 王道アイドル系 |
| 2 | 塩顔クール系 |
| 3 | 犬系彼氏系 |
| 4 | ワイルド色気系 |
| 5 | 中性美容系 |
| 6 | 韓国アイドル系 |
| 7 | 年上お兄さん系 |
| 8 | チャラモテ系 |
| 9 | 爽やかスポーツ系 |
| 10 | 沼系ミステリアス系 |
| 11 | 陽キャムードメーカー系 |
| 12 | かわいい系 |

---

### `public.profile_ikemen_types`

男性プロフィールとイケメンタイプの中間テーブル（多対多）。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| profile_id | uuid | PK, FK → profiles.id ON DELETE CASCADE | 男性ユーザーのプロフィール ID |
| ikemen_type_id | smallint | PK, FK → ikemen_types.id | 選択したタイプ ID |

---

### `public.likes`

いいねの送受信レコード。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK DEFAULT gen_random_uuid() | |
| sender_id | uuid | NOT NULL, FK → profiles.id ON DELETE CASCADE | いいねを送ったユーザー |
| receiver_id | uuid | NOT NULL, FK → profiles.id ON DELETE CASCADE | いいねを受けたユーザー |
| created_at | timestamptz | NOT NULL DEFAULT now() | |

**制約**
- `UNIQUE (sender_id, receiver_id)` — 同一ペアへの重複送信を防止
- `CHECK (sender_id != receiver_id)` — 自分自身へのいいねを防止

---

### `public.matches`

双方向いいねが成立したペアのレコード。退会時に user_id が NULL になっても**レコードは削除しない**。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK DEFAULT gen_random_uuid() | チャット画面 URL に使用（`/chat/[match_id]`） |
| user1_id | uuid | **NULLABLE**, FK → profiles.id **ON DELETE SET NULL** | 退会時に NULL 化される。`user1_id < user2_id` になるよう挿入時にアプリで制御 |
| user2_id | uuid | **NULLABLE**, FK → profiles.id **ON DELETE SET NULL** | 退会時に NULL 化される |
| created_at | timestamptz | NOT NULL DEFAULT now() | マッチング成立日時 |

**制約**
- `UNIQUE (user1_id, user2_id)` — 同一ペアの重複マッチングを防止
- `CHECK (user1_id < user2_id)` — レコードの向き統一（逆順レコードの混在を防止）

**マッチング一覧クエリの条件**
```sql
WHERE user1_id IS NOT NULL AND user2_id IS NOT NULL
```
両方のユーザーが存在するレコードのみ表示する。片方でも NULL の場合は一覧に出さない。

**重複防止の挿入ルール**
```
user1_id = LEAST(A.id, B.id)
user2_id = GREATEST(A.id, B.id)
```

---

### `public.messages`

チャットメッセージのレコード。退会時に sender_id が NULL になっても**レコードは削除しない**。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK DEFAULT gen_random_uuid() | |
| match_id | uuid | NOT NULL, FK → matches.id ON DELETE CASCADE | 所属するマッチング |
| sender_id | uuid | **NULLABLE**, FK → profiles.id **ON DELETE SET NULL** | 退会時に NULL 化される。NULL の場合は「退会済みユーザー」として表示する |
| content | text | NOT NULL | 本文（最大 500 文字はアプリレイヤーで担保） |
| created_at | timestamptz | NOT NULL DEFAULT now() | 送信日時 |

**インデックス**
- `(match_id, created_at ASC)` — チャット履歴の時系列取得で使用

---

## データ削除フロー

### 退会時（profiles 削除）

```
auth.users を削除
  │
  ├─ CASCADE → profiles
  │              ├─ CASCADE → profile_ikemen_types （全削除）
  │              ├─ CASCADE → likes.sender_id     （全削除）
  │              ├─ CASCADE → likes.receiver_id   （全削除）
  │              ├─ SET NULL → matches.user1_id   （レコード保持・NULL化）
  │              ├─ SET NULL → matches.user2_id   （レコード保持・NULL化）
  │              └─ SET NULL → messages.sender_id （レコード保持・NULL化）
  │
  └─ Supabase Storage の avatar_url ファイルを手動削除（要: Server Action 内で明示的に削除）
```

### マッチング削除時（matches 削除）

```
matches を削除
  └─ CASCADE → messages （全削除）
```

matches の削除は退会処理では発生しない。将来マッチング解除機能を追加する場合のみ発生する。

### 孤立レコードについて

退会したユーザーが関与していた matches レコードは user_id が NULL 化されるが削除はされない。両 user_id が NULL になった matches レコード（双方退会）は参照するユーザーがいなくなるため実質的な孤立レコードになる。100 ユーザー規模では影響軽微だが、将来的に定期クリーンアップの検討余地がある。

---

## 決定事項まとめ

| # | 項目 | 決定内容 |
|---|---|---|
| U-1 | avatar_url の保存形式 | ファイルパスのみ保存。URL は `getPublicUrl()` で生成 |
| U-2 | 男性専用フィールドの DB 制約 | CHECK 制約で担保（`gender='female' OR 全フィールド NOT NULL`） |
| U-3 | 退会時の FK 挙動 | matches・messages の FK は ON DELETE SET NULL。レコード保持 |
| U-4 | is_onboarding_complete のリセット | 一度 true にしたら false には戻さない |
| M-1 | 退会とチャット履歴の矛盾 | Approach A 採用。メッセージ保持・sender_id を NULL 化 |
