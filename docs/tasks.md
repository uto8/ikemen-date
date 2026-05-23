# イケメンデート 実装タスク一覧

最終更新: 2026-05-24（design.md との整合性修正・Realtime バッジフェーズ追加）

---

## MVP（最初のリリース）

### フェーズ 1: セットアップ

---

#### S-1: Supabase プロジェクト作成・環境変数設定
- [x] Supabase ダッシュボードでプロジェクトを作成する
- [x] `.env.local` に `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` を設定する
- [x] `.gitignore` に `.env.local` が含まれていることを確認する

**完了条件**: `npm run dev` を起動したとき、環境変数が読み込まれてコンパイルエラーが出ない

---

#### S-2: Supabase SDK インストール・クライアント作成
- [x] `npm install @supabase/ssr @supabase/supabase-js` を実行する
- [x] `lib/supabase/server.ts` に `createServerSupabaseClient()` を実装する（Cookie ベース・SSR 用）
- [x] `lib/supabase/client.ts` に `getSupabaseBrowserClient()` を実装する（シングルトン・ブラウザ用）

**完了条件**: `lib/supabase/server.ts` と `lib/supabase/client.ts` が型エラーなしでコンパイルされる

---

#### S-3: Supabase 型生成
- [x] `package.json` に `"db:types": "supabase gen types typescript --project-id <ID> > lib/supabase/types.ts"` スクリプトを追加する
- [x] `npm run db:types` を実行して `lib/supabase/types.ts` を生成する

**完了条件**: `lib/supabase/types.ts` が生成されており、`Database` 型がエクスポートされている

---

### フェーズ 2: データベース基盤

---

#### D-1: プロフィール関連テーブル作成
- [x] `supabase/migrations/001_profiles.sql` を作成する
- [x] `profiles` テーブルを DDL 通りに作成する（`likes_last_read_at`・`bio` CHECK 制約・`profiles_male_fields_required` CHECK 制約・インデックス含む）
- [x] `ikemen_types` テーブルを作成する
- [x] `profile_ikemen_types` 中間テーブルを作成する
- [x] `handle_new_user()` 関数を実装する（`NEW.raw_user_meta_data` から `gender`・`birth_date` を取り出して `profiles` に INSERT）
- [x] `on_auth_user_created` トリガーを `auth.users` に設定する
- [x] `check_male_ikemen_types()` 関数と `enforce_male_ikemen_types` トリガーを実装する（`is_onboarding_complete = true` への UPDATE 時に `profile_ikemen_types` が 1 件以上存在することを検証）
- [x] マイグレーションを Supabase に適用する

**完了条件**: Supabase ダッシュボードの Table Editor で 3 テーブルが確認できる。`profiles` の CHECK 制約が機能することを SQL Editor で確認できる。`auth.users` に INSERT すると `profiles` レコードが自動生成される

---

#### D-2: いいね・マッチング・メッセージテーブル作成
- [x] `supabase/migrations/002_social.sql` を作成する
- [x] `likes` テーブルを作成する（UNIQUE・CHECK 制約含む）
- [x] `matches` テーブルを作成する（NULLABLE FK・UNIQUE・CHECK 含む）
- [x] `messages` テーブルを作成する（`is_read boolean NOT NULL DEFAULT false`・`content` CHECK 制約（1〜500 文字）・`(match_id, created_at ASC)` インデックス・`(match_id, is_read)` インデックス含む）
- [x] マイグレーションを適用する

**完了条件**: 4 テーブルが確認できる。`likes.sender_id = receiver_id` の INSERT が CHECK 制約で弾かれることを確認できる。`messages.content` が 500 文字超で CHECK 制約違反になる

---

#### D-3: マッチング生成トリガー作成
- [x] `supabase/migrations/003_match_trigger.sql` を作成する
- [x] `create_match_if_mutual()` 関数を実装する（`SECURITY DEFINER`・`LEAST/GREATEST` による順序統一）
- [x] `on_like_inserted` トリガーを `likes` テーブルに設定する
- [x] SQL Editor で A→B、B→A の順にいいねを INSERT してマッチングが自動生成されることを確認する

**完了条件**: 双方向 `likes` INSERT 後に `matches` レコードが 1 件生成される。同一ペアへの重複マッチングが ON CONFLICT で無視される

---

#### D-4: RLS ポリシー設定（profiles・ikemen_types 系）
- [x] `supabase/migrations/004_rls.sql` を作成する
- [x] 全テーブルの RLS を有効化する
- [x] `profiles`: SELECT はログインユーザー全員可・UPDATE は `id = auth.uid()` のみ可・INSERT は禁止（`handle_new_user` トリガーが SECURITY DEFINER で実行）・DELETE は禁止（`auth.users` 削除による CASCADE で自動実行）
- [x] `ikemen_types`: ログインユーザーは SELECT のみ可
- [x] `profile_ikemen_types`: ログインユーザーは全件 SELECT 可・自分の `profile_id` のみ INSERT / DELETE 可

**完了条件**: SQL Editor で別ユーザーの JWT を使って他人の `profiles` を UPDATE しようとすると 0 件更新になる

---

#### D-5: RLS ポリシー設定（likes・matches・messages）
- [x] `likes`: 自分が `sender_id` または `receiver_id` のレコードのみ SELECT 可・自分が `sender_id` のみ INSERT 可
- [x] `matches`: 自分が `user1_id` または `user2_id` のレコードのみ SELECT 可・INSERT / UPDATE / DELETE 禁止
- [x] `messages`: 自分が含まれる `match_id` のメッセージのみ SELECT 可・自分が `sender_id` のみ INSERT 可・`is_read = true` への UPDATE は `sender_id != auth.uid()` かつ自分が含まれる `match_id` のみ可（既読処理用）

**完了条件**: マッチングしていない相手の `messages` を SELECT しようとすると 0 件返る。自分が送ったメッセージの `is_read` を UPDATE しようとすると 0 件更新になる

---

#### D-6: ikemen_types シードデータ投入
- [x] `supabase/seed.sql` に 12 件の `ikemen_types` レコードを INSERT 文で記述する
- [x] Supabase SQL Editor でシードを実行する

**完了条件**: `SELECT * FROM ikemen_types ORDER BY display_order` で 12 件が正しい順序で返る

---

### フェーズ 3: 共有ライブラリ

---

#### L-1: ユーティリティ関数
- [x] `lib/utils/age.ts`: `calcAge(birthDate: Date, baseDate?: Date): number` を実装する（誕生日当日から新しい年齢を返す）
- [x] `lib/utils/prefectures.ts`: 47 都道府県の配列定数を定義する
- [x] `lib/utils/ikemen-types.ts`: 12 種のイケメンタイプ定数と「最小 display_order を選ぶ」ヘルパー関数を実装する

**完了条件**: `calcAge` が誕生日前日・当日・翌日の境界値で正しい年齢を返す（手動確認）

---

#### L-2: Zod バリデーションスキーマ（認証）
- [x] `lib/validations/auth.ts` に `registerSchema` を定義する
  - `email`: メール形式
  - `password`: 英字・数字を各 1 文字以上含む 8 文字以上
  - `gender`: `'male' | 'female'`
  - `birthDate`: 登録日時点で 18 歳以上
- [x] `lib/validations/auth.ts` に `passwordSchema`（リセット用・同一ルール）を定義する

**完了条件**: Zod の `safeParse` で 17 歳・英字のみパスワード・性別未選択がそれぞれエラーになる

---

#### L-3: Zod バリデーションスキーマ（プロフィール）
- [x] `lib/validations/profile.ts` に `femaleOnboardingSchema` を定義する（nickname・prefecture 必須、avatar 任意）
- [x] `lib/validations/profile.ts` に `maleOnboardingSchema` を定義する（全フィールド必須・ikemen_type_ids 1 件以上）

**完了条件**: 男性スキーマで `ikemen_type_ids: []` が `min(1)` エラーになる

---

#### L-4: Auth コールバックルート
- [x] `app/auth/callback/route.ts` を作成する
- [x] Supabase の `code` パラメータを `exchangeCodeForSession` でセッションに交換する
- [x] 交換成功後に `/onboarding` へリダイレクトする
- [x] 有効期限切れの場合は `/login?error=expired` へリダイレクトする

**完了条件**: Supabase から届いた確認メールのリンクをクリックしたとき `/onboarding` に遷移する

---

### フェーズ 4: 認証

---

#### A-1: 新規登録フォーム UI
- [x] `app/(auth)/register/page.tsx` を作成する
- [x] `components/auth/RegisterForm.tsx` を実装する（email・password・gender ラジオ・birthDate 入力）
- [x] バリデーションエラーをフォーム下部にインラインで表示する
- [x] 「登録する」ボタンのローディング状態（`useTransition`）を実装する

**完了条件**: 各フィールドに不正値を入力して送信したとき、対応するエラーメッセージが表示される

---

#### A-2: Server Action: registerUser
- [x] `lib/actions/auth.ts` に `registerUser(formData: FormData)` を実装する
- [x] Zod で全フィールドをサーバーサイドバリデーションする
- [x] `supabaseAdmin.auth.admin.createUser({ user_metadata: { gender, birth_date } })` でアカウントを作成する（`profiles` への INSERT は `handle_new_user` トリガーが自動実行するため直接 INSERT しない）
- [x] 成功時: `/verify-email?email=<email>` にリダイレクトする
- [x] 重複メール: `{ error: "このメールアドレスはすでに使用されています" }` を返す

**完了条件**: 有効な入力でアカウントが作成され、Supabase Auth に新ユーザーが表示される。17 歳の birthDate でアカウントが作成されない

---

#### A-3: 確認メール送信済み画面
- [ ] `app/(auth)/verify-email/page.tsx` を作成する
- [ ] 「確認メールを再送信する」ボタンと 60 秒カウントダウンタイマーを実装する（Client Component）
- [ ] `resendConfirmationEmail` Server Action を実装する（`supabase.auth.resend`）
- [ ] 有効期限切れエラー（`/login?error=expired`）の場合はエラーバナーを表示する

**完了条件**: ボタンを押すと再送信される。60 秒以内の 2 回目の押下でボタンが非活性になり残り秒数が表示される

---

#### A-4: ログインフォーム UI + Server Action
- [ ] `app/(auth)/login/page.tsx` を作成する
- [ ] `components/auth/LoginForm.tsx` を実装する
- [ ] `lib/actions/auth.ts` に `loginUser(formData: FormData)` を実装する
  - `supabase.auth.signInWithPassword` でセッション生成
  - メール未確認: `/verify-email` にリダイレクト
  - プロフィール未完了（`is_onboarding_complete = false`）: `/onboarding` にリダイレクト
  - 完了済み: `/users` にリダイレクト
- [ ] 認証エラー: `{ error: "メールアドレスまたはパスワードが正しくありません" }` を返す

**完了条件**: 正しい認証情報でログインして `/users` または `/onboarding` に遷移する。誤認証でエラーメッセージが表示される

---

### フェーズ 5: オンボーディング

---

#### O-1: オンボーディング画面の骨格 + ルート保護
- [ ] `app/(app)/layout.tsx` を作成する
- [ ] セッション未取得の場合は `/login` にリダイレクトする
- [ ] `is_onboarding_complete = true` かつ `/onboarding` へアクセスした場合は `/users` にリダイレクトする
- [ ] `app/(app)/onboarding/page.tsx` を作成し、セッションの `gender` で `FemaleOnboardingForm` / `MaleOnboardingForm` を出し分ける

**完了条件**: 未ログインで `/users` にアクセスすると `/login` にリダイレクトされる

---

#### O-2: 女性オンボーディングフォーム
- [ ] `components/profile/FemaleOnboardingForm.tsx` を実装する
- [ ] nickname（テキスト）・prefecture（セレクト）・avatar（ファイル選択・任意）の入力 UI を作成する
- [ ] バリデーションエラーをインラインで表示する

**完了条件**: 必須項目を空で送信したとき「必須項目です」が表示される。プレビュー画像が選択直後に表示される

---

#### O-3: 男性オンボーディングフォーム
- [ ] `components/profile/MaleOnboardingForm.tsx` を実装する
- [ ] 女性フォームの項目に加えて occupation・height・bio・イケメンタイプ（12 種チェックボックス）を追加する
- [ ] イケメンタイプを 0 件で送信したとき「1 つ以上選択してください」を表示する

**完了条件**: 全必須項目を入力・イケメンタイプを 1 件以上選択して送信できる

---

#### O-4: Server Action: completeOnboarding
- [ ] `lib/actions/profile.ts` に `completeOnboarding(formData: FormData)` を実装する
- [ ] 性別に応じた Zod スキーマでバリデーションする
- [ ] 画像が含まれる場合: Storage `avatars/{userId}.{ext}` にアップロードし、ファイルパスを `avatar_url` に設定する
- [ ] `profiles` を UPDATE する（性別に応じたフィールド）
- [ ] 男性の場合: `profile_ikemen_types` を一括 INSERT する
- [ ] `is_onboarding_complete = true` に更新して `/users` にリダイレクトする

**完了条件**: 男性で画像・全必須項目・イケメンタイプを入力して送信すると `profiles` と `profile_ikemen_types` が更新される。Storage に画像が保存される

---

### フェーズ 6: ユーザー一覧（ギャラリー）

---

#### G-1: ユーザー一覧クエリ + 画面
- [ ] `lib/queries/users.ts` に `getOppositeUsers(currentUserId, currentGender)` を実装する
  - `gender != currentGender` でフィルタリング
  - `created_at DESC`（新着順）でソート
  - 男性の場合は `profile_ikemen_types` を JOIN して `display_order` 最小のタイプ名を付与する
  - `birth_date` から年齢を算出して返す
- [ ] `app/(app)/users/page.tsx` を作成する（Server Component）
- [ ] 2 カラムカードグリッドでユーザーを表示する

**完了条件**: ログイン中のユーザーと異性のユーザーのみが表示される。自分自身は一覧に含まれない

---

#### G-2: UserCard コンポーネント
- [ ] `components/user-card/UserCard.tsx` を実装する
- [ ] プロフィール画像（または女性のデフォルトアバター）・ニックネーム・年齢・居住地を表示する
- [ ] 男性カードにはイケメンタイプバッジを 1 件表示する
- [ ] カード全体を `<Link href="/users/[id]">` でラップする

**完了条件**: 画像未設定の女性ユーザーにデフォルトアバターが表示される。男性カードにバッジが 1 件表示される

---

### フェーズ 7: ユーザー詳細・いいね

---

#### U-1: ユーザー詳細画面
- [ ] `lib/queries/users.ts` に `getUserById(id)` を実装する（全プロフィールフィールド取得・ikemen_types 全件 JOIN）
- [ ] `app/(app)/users/[id]/page.tsx` を作成する（Server Component）
- [ ] 性別に応じて表示項目を切り替える（男性: 職業・身長・自己紹介・全イケメンタイプ / 女性: 基本情報のみ）
- [ ] 自分自身のページではいいねボタンを表示しない

**完了条件**: 男性詳細で全 `profile_ikemen_types` が表示される。`/users/[自分のID]` でいいねボタンが非表示になる

---

#### U-2: いいね状態クエリ + LikeButton コンポーネント
- [ ] `lib/queries/likes.ts` に `getLikeStatus(currentUserId, targetUserId): Promise<LikeStatus>` を実装する
- [ ] `components/like-button/LikeButton.tsx` を実装する（Client Component）
  - `initialStatus: 'none' | 'sent' | 'received'` を受け取る
  - `sent` の場合はボタンを非活性・「いいね済み」表示にする
  - 押下時に `sendLike` Server Action を `useTransition` で呼び出す
  - 成功後にローカル state を `sent` に更新する

**完了条件**: 送信済みの相手の詳細ページを開くと「いいね済み」の非活性ボタンが表示される

---

#### U-3: Server Action: sendLike
- [ ] `lib/actions/like.ts` に `sendLike(receiverId: string)` を実装する
- [ ] セッションから `senderId` を取得する
- [ ] `likes` テーブルに INSERT する（重複の場合は Supabase の一意制約エラーを `{ error }` に変換する）
- [ ] `revalidatePath('/users/[id]')` で詳細ページを再検証する

**完了条件**: いいねボタンを押すと `likes` レコードが作成される。双方向いいね後に `matches` レコードが自動生成される（トリガーによる）

---

### フェーズ 8: もらったいいね一覧

---

#### LK-1: もらったいいね一覧
- [ ] `lib/queries/likes.ts` に `getReceivedLikes(currentUserId)` を実装する（送ってきたユーザーの基本情報を JOIN・`likes.created_at DESC` でソート）
- [ ] `lib/actions/like.ts` に `updateLikesLastRead()` Server Action を実装する（`profiles.likes_last_read_at = now()` を UPDATE）
- [ ] `app/(app)/likes/page.tsx` を作成する（Server Component）
- [ ] ページを開いた直後に `updateLikesLastRead()` を呼び出す
- [ ] リスト形式（1 カラム）でカードを表示する
- [ ] 0 件のとき「まだいいねをもらっていません」を表示する
- [ ] 各カードをタップすると `/users/[id]` に遷移する

**完了条件**: 他ユーザーからいいねを受信した後、自分のいいね一覧ページに相手が表示される。ページを開くと `profiles.likes_last_read_at` が更新される

---

### フェーズ 9: マッチング一覧

---

#### M-1: マッチング一覧
- [ ] `lib/queries/matches.ts` に `getMyMatches(currentUserId)` を実装する
  - `user1_id IS NOT NULL AND user2_id IS NOT NULL` で絞り込む
  - `COALESCE(MAX(msg.created_at), m.created_at) DESC` でソート（最終メッセージ降順。メッセージ未送受信はマッチング成立日時を基準に並べる）
  - `messages.is_read = false AND sender_id != 自分 AND sender_id IS NOT NULL` の件数を `unreadCount` として集計して `MatchWithPartner` 型で返す
- [ ] `app/(app)/matches/page.tsx` を作成する（Server Component）
- [ ] リスト形式（1 カラム）でカードを表示する
- [ ] 各カードに `unreadCount > 0` のとき未読件数バッジを表示する（99 件超は「99+」）
- [ ] 0 件のとき「まだマッチングしていません」を表示する
- [ ] 各カードをタップすると `/chat/[match_id]` に遷移する

**完了条件**: マッチング成立後、両ユーザーのマッチング一覧に相手が表示される。退会済みユーザー（user_id が NULL）は一覧に表示されない。未読メッセージがあるカードにバッジが表示される

---

### フェーズ 10: チャット

---

#### C-1: チャット初期表示（Server Component）
- [ ] `lib/queries/messages.ts` に `getMessages(matchId, currentUserId)` を実装する
- [ ] `lib/queries/matches.ts` に `getMatchParticipants(matchId, currentUserId)` を実装する（自分が含まれるか確認・パートナーの退会状態を返す）
- [ ] `lib/actions/chat.ts` に `markMessagesAsRead(matchId)` Server Action を実装する（`sender_id != 自分` かつ `sender_id IS NOT NULL` かつ `is_read = false` のメッセージを一括 `is_read = true` に UPDATE）
- [ ] `app/(app)/chat/[match_id]/page.tsx` を作成する（Server Component）
- [ ] 自分が含まれないマッチング ID の場合は `/matches` にリダイレクトする
- [ ] ページ表示時に `markMessagesAsRead(matchId)` を呼び出す
- [ ] `initialMessages` と `isPartnerActive` を Client Component に渡す

**完了条件**: マッチングしていない相手の chat URL に直接アクセスすると `/matches` にリダイレクトされる。チャットページを開くと相手からの未読メッセージが `is_read = true` になる

---

#### C-2: ChatMessages コンポーネント（Realtime）
- [ ] `components/chat/ChatMessages.tsx` を実装する（Client Component）
- [ ] マウント時に `supabase.channel()` で `messages` テーブルをサブスクライブする（`match_id = matchId` フィルタ）
- [ ] 新着メッセージをローカル state に追加する
- [ ] 自分のメッセージを右寄せ・相手を左寄せで表示する
- [ ] `sender_id = null`（退会済み）は「退会済みユーザー」として表示する
- [ ] `isPartnerActive = false` のときは退会バナーを表示する
- [ ] アンマウント時に `supabase.removeChannel()` でサブスクライブ解除する

**完了条件**: チャット画面を開いたまま相手がメッセージを送ると、リロードなしで画面左側にメッセージが表示される

---

#### C-3: ChatInput コンポーネント + sendMessage Action
- [ ] `components/chat/ChatInput.tsx` を実装する（Client Component）
- [ ] 入力欄が空・スペースのみのとき送信ボタンを非活性にする
- [ ] 500 文字を超える入力を受け付けない（`maxLength={500}`）
- [ ] 入力欄下部に「N / 500 文字」を表示する（450 文字超で警告色に変える）
- [ ] `lib/actions/chat.ts` に `sendMessage(matchId, content)` を実装する（自分がマッチング参加者か確認してから INSERT）

**完了条件**: 空送信でメッセージが送られない。501 文字目が入力できない。送信後にメッセージが画面右側に即座に表示される

---

### フェーズ 11: 退会

---

#### W-1: 退会 Server Action
- [ ] `lib/actions/user.ts` に `withdrawUser()` を実装する
  1. セッションから `userId` を取得する
  2. Storage から `avatars/{userId}.*` を削除する
  3. `supabaseAdmin.auth.admin.deleteUser(userId)` を実行する（CASCADE で `profiles` → `likes` → `profile_ikemen_types` が削除される）
  4. セッションをクリアして `/` にリダイレクトする

**完了条件**: 退会後に `profiles` レコードが削除される。退会ユーザーが関与していた `matches` の `user_id` が NULL になる。`messages` の `sender_id` が NULL になる

---

#### W-2: 退会画面 UI
- [ ] `app/(app)/settings/page.tsx` を作成する
- [ ] 「退会する」ボタンと確認ダイアログ（`window.confirm` または モーダル）を実装する
- [ ] 退会後チャットで「相手が退会しました」バナーが Realtime で受信できるようチャンネルイベントを設定する

**完了条件**: 確認ダイアログで「キャンセル」を押すと退会しない。「退会する」を押すと退会処理が走ってトップページに遷移する

---

### フェーズ 12: 通知バッジ（Realtime）

---

#### B-1: いいねバッジ（Realtime）
- [ ] `app/(app)/layout.tsx` で初期の未読いいね数を取得する（`SELECT COUNT(*) FROM likes WHERE receiver_id = 自分 AND created_at > likes_last_read_at`）
- [ ] `likes` テーブルの `receiver_id = 自分` フィルタで INSERT イベントをサブスクライブし、バッジカウントを +1 する（Client Component または Context）
- [ ] いいね一覧ページ（S12）を開いたときにカウントをゼロにリセットする
- [ ] いいね一覧ページ表示中はバッジを非表示にする
- [ ] 99 件超は「99+」と表示する

**完了条件**: 別タブからいいねを送ると BottomNav のバッジカウントがリアルタイムで増加する。いいね一覧を開くとバッジが非表示になる

---

#### B-2: マッチング（メッセージ）バッジ（Realtime）
- [ ] `app/(app)/layout.tsx` で自分が関与する全マッチングの初期未読メッセージ数を取得する（`messages.is_read = false AND sender_id != 自分 AND sender_id IS NOT NULL`）
- [ ] 自分が関与する各マッチングの `messages` INSERT イベントをサブスクライブする（`match_id` フィルタ別チャンネル）
- [ ] `sender_id != 自分` かつ `sender_id IS NOT NULL` のメッセージのみバッジカウントを +1 する
- [ ] チャット画面を開いたときにそのマッチング分のカウントを減らす（`markMessagesAsRead` 後にローカル state を更新）
- [ ] マッチング一覧ページ（S13）表示中はバッジを非表示にする（クリアはしない）
- [ ] 99 件超は「99+」と表示する

**完了条件**: 別タブからメッセージを送るとバッジカウントが増加する。チャット画面を開くとそのマッチング分のバッジが減少し、他のマッチングの未読は継続して表示される

---

### フェーズ 13: ナビゲーション・仕上げ

---

#### N-1: ボトムナビゲーション（バッジ統合）
- [ ] `components/navigation/BottomNav.tsx` を実装する（タブ: ユーザー一覧 / もらったいいね / マッチング / 設定）
- [ ] `app/(app)/layout.tsx` に組み込む
- [ ] 現在のパスに対応するタブをアクティブ表示する
- [ ] いいねタブに B-1 の未読いいね数バッジを表示する（いいね一覧表示中は非表示）
- [ ] マッチングタブに B-2 の未読メッセージ数バッジを表示する（マッチング一覧表示中は非表示。クリアはチャット画面を開いたときのみ）

**完了条件**: 各タブをタップすると対応ページに遷移する。現在のページのタブがハイライトされる。バッジが正しく表示・非表示される

---

#### N-2: パスワードリセットフロー
- [ ] `app/(auth)/forgot-password/page.tsx` + `forgotPassword` Server Action を実装する
- [ ] `app/(auth)/reset-password/page.tsx` + `resetPassword` Server Action を実装する
- [ ] ログイン画面に「パスワードをお忘れの方はこちら」リンクを追加する
- [ ] 未登録メールへの送信でも成功メッセージを表示する（列挙攻撃対策）

**完了条件**: 登録済みメールに対してリセットメールが届き、リンクから新パスワードを設定してログインできる

---

#### N-3: エラーページ・デフォルトアバター
- [ ] `app/not-found.tsx` を作成する（404 ページ）
- [ ] `app/error.tsx` を作成する（予期しないエラー）
- [ ] デフォルトアバター画像を `public/default-avatar.png` に配置する

**完了条件**: 存在しない URL にアクセスすると 404 ページが表示される

---

#### N-4: レスポンシブ最終確認・デプロイ
- [ ] Safari（iOS）・Chrome（Android）・Chrome（PC）で主要画面を確認する
- [ ] 375px 幅（iPhone SE）でレイアウト崩れがないか確認する
- [ ] `npm run build` がエラーなしで完了する
- [ ] Vercel にデプロイし、本番 URL で動作確認する

**完了条件**: Vercel 本番 URL で新規登録 → オンボーディング → 一覧 → いいね → マッチング → チャットの一連フローが動作する

---

## 後回しタスク（MVP 外）

---

### POST-1: プロフィール編集
> 要件未確定（未決事項 #2）

- [ ] `lib/actions/profile.ts` に `updateProfile(formData: FormData)` を実装する
- [ ] `app/(app)/settings/profile/page.tsx` を作成する
- [ ] 画像の差し替え時は旧ファイルを Storage から削除する

**完了条件**: プロフィール編集後に一覧・詳細に変更が反映される

---

### POST-2: ユーザー一覧のページネーション
> 要件未確定（未決事項 #1）

- [ ] 無限スクロール（`IntersectionObserver`）またはページ番号方式を選定する
- [ ] `getOppositeUsers` に `cursor` または `page` パラメータを追加する

**完了条件**: 表示件数が増えても画面が重くならない

---

### POST-3: 単体テスト（Vitest）

- [ ] `npm install -D vitest @vitest/ui` を実行する
- [ ] `lib/utils/age.ts` の境界値テストを作成する（誕生日前日・当日・翌日）
- [ ] `lib/validations/auth.ts` のテストを作成する（17 歳・18 歳・パスワードパターン）
- [ ] `lib/validations/profile.ts` のテストを作成する（男女別の必須フィールド）

**完了条件**: `npx vitest` がすべて PASS する

---

### POST-4: E2E テスト（Playwright）

- [ ] `npm install -D @playwright/test` を実行する
- [ ] 認証フロー（登録 → メール確認 → オンボーディング → 一覧）のテストを作成する
- [ ] いいね → マッチング → チャット開通のテストを作成する
- [ ] 未マッチのチャット URL への直接アクセスでリダイレクトされるテストを作成する

**完了条件**: `npx playwright test` がすべて PASS する

---

### POST-5: OGP・メタ情報
> 要件未確定（未決事項 #5）

- [ ] `app/layout.tsx` の `metadata` に `title` / `description` / `openGraph` を設定する
- [ ] OGP 画像を作成して `public/` に配置する

**完了条件**: SNS にシェアしたときにタイトル・説明・サムネが表示される

---

## タスクサマリー

| フェーズ | タスク数 | 目安工数 |
|---|---|---|
| セットアップ（S） | 3 | 2〜3 時間 |
| DB 基盤（D） | 6 | 6〜8 時間 |
| 共有ライブラリ（L） | 4 | 3〜4 時間 |
| 認証（A） | 4 | 5〜6 時間 |
| オンボーディング（O） | 4 | 4〜5 時間 |
| ユーザー一覧（G） | 2 | 2〜3 時間 |
| ユーザー詳細・いいね（U） | 3 | 3〜4 時間 |
| もらったいいね（LK） | 1 | 1〜2 時間 |
| マッチング一覧（M） | 1 | 1〜2 時間 |
| チャット（C） | 3 | 4〜5 時間 |
| 退会（W） | 2 | 2〜3 時間 |
| 通知バッジ Realtime（B） | 2 | 2〜3 時間 |
| ナビゲーション・仕上げ（N） | 4 | 4〜5 時間 |
| **MVP 合計** | **39** | **39〜53 時間** |
| 後回し（POST） | 5 | — |
