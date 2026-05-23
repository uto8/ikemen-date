# イケメンデート データモデル

最終更新: 2026-05-24（4.7 ソート順変更を反映）

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
        timestamptz likes_last_read_at
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
        boolean is_read
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
| bio | text | NULLABLE, CHECK (bio IS NULL OR char_length(bio) BETWEEN 1 AND 300) | 男性のみ使用。女性レコードは NULL |
| is_onboarding_complete | boolean | NOT NULL DEFAULT false | オンボーディング完了後に true に設定。一度 true になったら false には戻さない |
| likes_last_read_at | timestamptz | NULLABLE DEFAULT NULL | いいね一覧（S12）を最後に開いた日時。NULL = 一度も開いていない。バッジ未読数の算出基準として使用 |
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

**男性必須トリガー**

`is_onboarding_complete = true` への更新時点で `profile_ikemen_types` に1件以上存在することを DB レベルで保証する。オンボーディング途中（型を順に挿入する段階）では発火しないため、バッチ挿入の途中でエラーにはならない。

```sql
CREATE OR REPLACE FUNCTION check_male_ikemen_types()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_onboarding_complete = true AND NEW.gender = 'male' THEN
    IF NOT EXISTS (
      SELECT 1 FROM profile_ikemen_types WHERE profile_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Male profile must have at least one ikemen type selected';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_male_ikemen_types
  BEFORE UPDATE OF is_onboarding_complete ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_male_ikemen_types();
```

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

> **注意（UNIQUE と NULL の挙動）**: PostgreSQL の UNIQUE 制約は NULL を互いに異なる値として扱う。そのため、両者が退会して `(NULL, NULL)` になったレコードが複数あっても制約違反にはならない。ただし挿入時（どちらの user_id も NOT NULL の状態）は確実に重複を防止できるため、実運用上の問題はない。

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

**マッチング一覧ソートクエリ（要件 4.7）**

要件 4.7 では「最終メッセージの送受信が新しい順、メッセージ未送受信はマッチング成立日時で比較」を定義している。`matches.created_at` では足りないため `messages` との LEFT JOIN 集計が必要になる。

```sql
SELECT m.*,
       COALESCE(MAX(msg.created_at), m.created_at) AS sort_at
FROM   matches m
LEFT JOIN messages msg ON msg.match_id = m.id
WHERE  (m.user1_id = :my_profile_id OR m.user2_id = :my_profile_id)
  AND  m.user1_id IS NOT NULL
  AND  m.user2_id IS NOT NULL
GROUP  BY m.id
ORDER  BY sort_at DESC;
```

`COALESCE(MAX(msg.created_at), m.created_at)` によりメッセージ0件のマッチングはマッチング成立日時を基準に並べる。既存の `messages(match_id, created_at ASC)` インデックスは逆スキャンで MAX 取得にも使用できるが、100ユーザー規模を超える場合は `(match_id, created_at DESC)` の追加を検討する。

---

### `public.messages`

チャットメッセージのレコード。退会時に sender_id が NULL になっても**レコードは削除しない**。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| id | uuid | PK DEFAULT gen_random_uuid() | |
| match_id | uuid | NOT NULL, FK → matches.id ON DELETE CASCADE | 所属するマッチング |
| sender_id | uuid | **NULLABLE**, FK → profiles.id **ON DELETE SET NULL** | 退会時に NULL 化される。NULL の場合は「退会済みユーザー」として表示する |
| content | text | NOT NULL, CHECK (char_length(content) BETWEEN 1 AND 500) | 本文 |
| is_read | boolean | NOT NULL DEFAULT false | 受信者が既読かどうか。チャット画面（S14）を開いた瞬間に、そのマッチングで `sender_id != 自分` かつ `sender_id IS NOT NULL` の未読レコードをまとめて `true` に更新する |
| created_at | timestamptz | NOT NULL DEFAULT now() | 送信日時 |

**インデックス**
- `(match_id, created_at ASC)` — チャット履歴の時系列取得で使用
- `(match_id, is_read)` — マッチングカード単位の未読件数集計で使用

---

### 通知バッジの未読カウント

BottomNav に表示する未読バッジ数の管理方式はタブごとに異なる。

| タブ | 管理方式 | 根拠 |
|---|---|---|
| いいね | `profiles.likes_last_read_at` カーソル | いいね受信は行の挿入のみ。既読状態をタイムスタンプで一括管理できる |
| マッチング | `messages.is_read` の集計 | チャットは相手ごとに個別に既読化するため、行レベル管理が必要 |

**バッジ数クエリ**

```sql
-- いいね未読数（receiver = 自分）
SELECT COUNT(*)
FROM   likes
JOIN   profiles ON profiles.id = :my_profile_id
WHERE  likes.receiver_id = :my_profile_id
  AND  (
    profiles.likes_last_read_at IS NULL
    OR likes.created_at > profiles.likes_last_read_at
  );

-- マッチングタブ未読数（全マッチングの未読メッセージ合計）
SELECT COUNT(*)
FROM   messages m
JOIN   matches mt ON mt.id = m.match_id
WHERE  m.is_read = false
  AND  m.sender_id IS NOT NULL           -- 退会済みユーザーのメッセージを除外
  AND  m.sender_id != :my_profile_id    -- 自分が送ったメッセージを除外
  AND  mt.user1_id IS NOT NULL           -- 退会済みが関与するマッチングを除外
  AND  mt.user2_id IS NOT NULL
  AND  (mt.user1_id = :my_profile_id OR mt.user2_id = :my_profile_id);

-- マッチングカード単位の未読数（S13 カードバッジ用）
SELECT m.match_id, COUNT(*) AS unread_count
FROM   messages m
JOIN   matches mt ON mt.id = m.match_id
WHERE  m.is_read = false
  AND  m.sender_id IS NOT NULL
  AND  m.sender_id != :my_profile_id
  AND  mt.user1_id IS NOT NULL
  AND  mt.user2_id IS NOT NULL
  AND  (mt.user1_id = :my_profile_id OR mt.user2_id = :my_profile_id)
GROUP  BY m.match_id;
```

**クリア操作（Server Action）**

| 操作 | 実行内容 |
|---|---|
| S12（いいね一覧）を開く | `UPDATE profiles SET likes_last_read_at = now() WHERE id = :my_profile_id` |
| S14（チャット画面）を開く | `UPDATE messages SET is_read = true WHERE match_id = :match_id AND sender_id != :my_profile_id AND sender_id IS NOT NULL AND is_read = false` |

**Realtime サブスクリプション**

| イベント | テーブル | フィルタ | 挙動 |
|---|---|---|---|
| いいね受信 | `likes` INSERT | `receiver_id=eq.:my_profile_id` | ローカルのいいねバッジカウントを +1 |
| メッセージ受信 | `messages` INSERT | 自分が関与する各マッチングの `match_id=eq.{match_id}` でチャンネルをサブスクライブ | `sender_id` が自分でなく `sender_id IS NOT NULL` の場合のみマッチングバッジカウントを +1。チャット画面を開いている間はそのマッチングの INSERT で即時 `is_read = true` を UPDATE しバッジを増やさない |

> **実装メモ（messages の Realtime）**: 自分が関与するマッチング数だけチャンネルを張る。`channel('messages-{match_id}').on('INSERT', { filter: 'match_id=eq.{match_id}' }, ...)` の形式で、マッチング一覧取得後にサブスクライブを開始する。matches への Realtime サブスクリプション（旧2チャンネル方式）は不要になった。

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
| U-5 | バッジ未読カウントの管理方式 | いいねタブ: `profiles.likes_last_read_at` カーソル方式。マッチングタブ: `messages.is_read` 集計方式。タブごとに最適な方式を採用 |
| U-6 | bio・content の文字数制限 | アプリレイヤーのみでなく DB レベルの CHECK 制約でも担保する（bio: 1〜300、content: 1〜500） |
| U-7 | ikemen_type 1件以上の担保 | `is_onboarding_complete = true` への更新時に発火するトリガーで DB レベルでも保証する |
| U-8 | messages の Realtime サブスクリプション方式 | 自分が関与するマッチングごとに `match_id` フィルタでチャンネルをサブスクライブ。matches INSERT の監視は不要（バッジがメッセージ未読数に変わったため） |
| M-1 | 退会とチャット履歴の矛盾 | Approach A 採用。メッセージ保持・sender_id を NULL 化 |
| M-2 | マッチングタブバッジの仕様変更 | マッチング成立数→チャット未読メッセージ数に変更。`messages.is_read` カラム追加。`profiles.matches_last_read_at` カラム削除 |
