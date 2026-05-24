
## 2026-05-24 N-4: レスポンシブ最終確認・デプロイ

- 375px（iPhone SE）でログイン・新規登録・パスワードリセット・404・メール確認ページをスクリーンショット確認 → レイアウト崩れなし
- `npm run build` エラーなし（前セッションで確認済み）
- Vercel CLI でプロジェクトをリンク（`uto8s-projects/ikemen-date`）
- 環境変数 3 件（NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY）を本番に設定
- `vercel --prod --yes` で本番デプロイ完了
- 本番 URL: https://ikemen-date.vercel.app
- MVP 全タスク完了

## 2026-05-24 DS-01 カラートークン定義

- `app/globals.css` の `:root` を `--background: #f5f8fa`・`--foreground: #1a1a2e` に更新
- `@theme` ブロックを追加し、デザインシステム全カラートークンを Tailwind v4 形式で定義
  - `primary-50/100/400/500/600/700`
  - `gray-0/50/100/200/400/500/700/900`
  - `success/warning/error/info` 各 50/500
- ダークモードブロック・フォントは DS-03/DS-02 スコープのため今回は保留
- ビルド成功・スクリーンショットで背景色変更を確認

## 2026-05-24 DS-02/DS-03 フォント変更・ダークモード削除

**DS-02:**
- `app/layout.tsx`: Geist/Geist_Mono を削除 → Noto_Sans_JP(400/700) + Inter(display:swap) に変更
- `app/globals.css`: `--font-sans: var(--font-noto-sans-jp), var(--font-inter), sans-serif` に更新
- `body` の font-family を `var(--font-sans)` に統一

**DS-03:**
- `app/globals.css` の `@media (prefers-color-scheme: dark)` ブロックを削除
- `app/layout.tsx` に `dark:` クラスがないことを確認済み

ビルド成功・スクリーンショットでフォント変更と背景色固定を確認

## 2026-05-24 DS-09/DS-10 オンボーディングウィザード化

**共通変更:**
- `AuthHeader.tsx` に `onBack?: () => void` を追加（ウィザード内の戻るボタンに対応）

**DS-09（女性・3 Step）:**
- `FemaleOnboardingForm.tsx` を全面書き換え（クライアント側ステップ管理）
- Step1: 破線円カメラボタン（`border-2 border-dashed border-primary-500`）・スキップ可
- Step2: ニックネーム入力＋リアルタイム文字数カウント（`{len} / 20文字`）
- Step3: 都道府県 3 カラムグリッド・選択時 `border-primary-500 bg-primary-50 text-primary-500`
- 最終 submit は FormData を手組みして `completeOnboarding` を直接呼ぶ（Server Action 変更不要）

**DS-10（男性・7 Step）:**
- `MaleOnboardingForm.tsx` を全面書き換え
- Step1: カメラボタン（アバター必須・未選択でエラー表示）
- Step5: 身長入力（`pr-12` ＋ 絶対配置の "cm" ラベル）
- Step7: イケメンタイプ 2 カラムカードグリッド（タイプ別カラー背景＋チェックアイコン）
  - 実際の型別画像なし → `bg-rose-100` 等のタイプ別カラーで代替
- per-step バリデーション（各ステップで前進時に対象フィールドのみチェック）

**その他:**
- `onboarding/page.tsx` のラッパー `<main>` と h1 を削除（フォームが自前でレンダリング）
- ビルド成功・モックアップ HTML で 3 画面確認済み

## 2026-05-24 DS-06/07/08 認証画面レイアウト修正

**DS-06（ログイン・新規登録）:**
- `components/auth/AuthHeader.tsx` を新規作成（ロゴ + 省略可能な戻るボタン）
- `app/(auth)/login/page.tsx`: `min-h-screen items-center justify-center` → トップ揃えレイアウト、サブタイトル追加、新規登録クロスリンク追加
- `app/(auth)/register/page.tsx`: 同様にヘッダー・サブタイトル・ログインクロスリンク追加

**DS-07（パスワードリセット系）:**
- `app/(auth)/forgot-password/page.tsx`: `<AuthHeader backHref="/login" />` 追加、見出し・サブタイトル修正
- `app/(auth)/reset-password/page.tsx`: `<AuthHeader />` 追加、見出し・サブタイトル修正

**DS-08（メール確認待ち）:**
- `app/(auth)/verify-email/page.tsx`: 全幅センターレイアウトに変更
- `components/auth/VerifyEmailForm.tsx`: アイコン w-16/h-8 → w-20/h-10、h1テキスト変更、メールアドレスを primary-500 で強調、ボタンをアウトラインスタイルに変更、「← ログイン画面に戻る」リンク追加、カウントダウン文言修正

ビルド成功・4画面スクリーンショット確認済み

## 2026-05-24 DS-04/DS-05 フォーム・ボトムナビカラー統一

**DS-04（5ファイル）:**
- `components/auth/{Login,Register,ForgotPassword,ResetPassword,VerifyEmail}Form.tsx`
- input: border-gray-200・px-4 py-3 text-base・focus:ring-primary-500 に統一
- button: bg-primary-500 hover:bg-primary-600 rounded-full py-4、disabled を bg-gray-100+gray-400 に変更
- accent-pink-500 → accent-primary-500（ラジオボタン）
- エラーバナー bg-error-50 text-error-500、成功バナー bg-success-50 text-success-500 に統一
- VerifyEmailForm アイコン bg-primary-50 text-primary-500 に変更

**DS-05（2ファイル）:**
- `BottomNav.tsx`: text-pink-500 → text-primary-500、border-gray-100 → border-gray-200
- `app/(app)/layout.tsx`: pb-16 → pb-20（セーフエリア余白確保）

ビルド成功・スクリーンショットで水色ボタン・テールテーマを確認

## 2026-05-24 DS-11〜DS-16 メインアプリ画面デザイン修正（Phase 5）

**DS-11（UserCard / UserGrid）:**
- `UserCard.tsx`: 画像比率 `aspect-square` → `aspect-[3/4]`、バッジ `bg-pink-500` → `bg-primary-500`
- `UserGrid.tsx`: `grid-cols-2` → `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

**DS-12（likes/page.tsx）:**
- カード padding `p-3` → `p-4`、アバター `h-14 w-14` → `h-16 w-16`
- ハートアイコン（`text-primary-500`）を右端に追加

**DS-13（matches/page.tsx + lib/queries/matches.ts）:**
- `lib/queries/matches.ts`: `messages` に `content` フィールドを追加、`MatchWithPartner` に `lastMessage: string | null` を追加
- バッジ色 `bg-pink-500` → `bg-primary-500`
- 最終メッセージプレビューを追加（未メッセージ時は「まだメッセージがありません」）

**DS-14（users/[id]/page.tsx）:**
- アバターを全幅 `w-full aspect-[3/4]` に変更（padding なし）
- いいねボタンを `fixed bottom-16 inset-x-0 px-4 pb-4` に変更
- イケメンタグ `bg-pink-100 text-pink-600` → `bg-primary-50 text-primary-500`
- 男性詳細エリアを `bg-white rounded-2xl shadow-sm p-4` の白カードで囲む

**DS-15（ChatMessages.tsx / ChatInput.tsx）:**
- 自分のバブル `bg-pink-500` → `bg-primary-500 rounded-2xl rounded-br-sm`
- 相手のバブル `bg-white` → `bg-white rounded-2xl rounded-bl-sm shadow-xs`
- 日付区切りを追加（横線 + 中央テキスト、日付ごとにグループ化）
- ChatInput: `border-gray-100` → `border-gray-200`、`ring-pink-300` → `ring-primary-500`、送信ボタン `bg-pink-500` → `bg-primary-500`

**DS-16（settings/page.tsx）:**
- Server Component を async 化し Supabase でプロフィールを取得
- ページ上部にプロフィールカード（アバター・ニックネーム・年齢・都道府県）を追加
- シェブロンを SVG アイコンに変更（`›` テキストを削除）
- ページタイトルを「設定」→「マイページ」に変更

ビルド成功・スクリーンショットで dev サーバー正常稼働を確認

## 2026-05-24 DS-17〜DS-21 後回しタスク実装

**DS-17（ランディングページ）:**
- `app/page.tsx` を全面書き換え
- ログイン済みユーザーは `/users` へリダイレクト
- Header（スティッキー・ログインリンク）
- Hero セクション（キャッチコピー・「無料で始める」CTA）
- Features（3ステップカードグリッド）
- CTA bottom（bg-primary-50・「無料で始める」）
- Footer
- スクリーンショット確認済み

**DS-18（認証コールバックエラー画面）:**
- `app/(auth)/auth-callback-error/page.tsx` を新規作成（エラーアイコン＋メッセージ＋ログイン画面へボタン）
- `app/auth/callback/route.ts`: エラー時のリダイレクト先を `/login?error=expired` → `/auth-callback-error` に変更
- スクリーンショット確認済み

**DS-19（レスポンシブ強化）:**
- `components/chat/MatchesSidebar.tsx` を新規作成（lg: 以上でチャット左サイドバー表示）
- `app/(app)/chat/[match_id]/page.tsx`: `getMyMatches` を追加フェッチし `MatchesSidebar` を組み込み
- ギャラリーグリッド `lg:grid-cols-4` は DS-11 で対応済み

**DS-20（アニメーション）:**
- `UserCard.tsx`: `hover:shadow-md transition-shadow` 追加
- `likes/page.tsx`, `matches/page.tsx`: カードリンクに `hover:shadow-md transition-shadow` 追加
- ボタンは既存の `transition-colors` を確認済み

**DS-21（アクセシビリティ）:**
- 全認証フォーム（Login / Register / ForgotPassword / ResetPassword / VerifyEmail）のエラー `<p>` に `role="alert"` を追加
- `RegisterForm.tsx`: email・password・birthDate フィールドに `aria-invalid`・`aria-describedby` を追加
- `ChatInput.tsx`: エラーメッセージに `role="alert"` 追加

ビルド成功・ランディング・エラーページをスクリーンショット確認済み
