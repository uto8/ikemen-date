# デザイン修正タスク — イケメンデート

> mockups/ フォルダの HTML を正とし、現実装との差分を解消するためのタスク一覧。
> 作成日: 2026-05-24

---

## 判明している主要差分

| 項目 | 現実装 | mockup | 対応タスク |
|---|---|---|---|
| フォント | Geist | Noto Sans JP + Inter | DS-01 |
| メインカラー | `pink-500` | `primary-500 (#00c1d4)` | DS-02 |
| ページ背景色 | `#ffffff` | `gray-50 (#f5f8fa)` | DS-03 |
| 本文テキスト色 | `#171717` | `gray-900 (#1a1a2e)` | DS-03 |
| ダークモード | あり | なし | DS-03 |
| 入力フォーカスリング | `ring-pink-400` | `ring-primary-500` | DS-04 |
| ボタン形状 | `rounded-full`（一部 `rounded-lg`） | `rounded-full` 統一 | DS-04 |
| ボトムナビアクティブ色 | `text-pink-500` | `text-primary-500` | DS-05 |
| UserCard 画像比率 | `aspect-square` | `aspect-[3/4]` | DS-08 |
| UserCard バッジ色 | `bg-pink-500` | `bg-primary-500` | DS-08 |
| ユーザー詳細 アバター | 中央 w-40 | 全幅 aspect-[3/4] | DS-09 |
| いいねタイプタグ | `bg-pink-100 text-pink-600` | `bg-primary-50 text-primary-500` | DS-09 |
| マッチング未読バッジ | `bg-pink-500` | `bg-primary-500` | DS-11 |
| マイページ | 設定リストのみ | プロフィールカード付き | DS-13 |
| トップページ | `/login` へリダイレクト | S01 ランディング | DS-14（後回し） |

---

## MVP — 最初のリリースに含めるタスク

### Phase 1 — セットアップ（全画面の基盤。最初に完了させる）

- [x] **DS-01** カラートークンを globals.css に定義する
  - `@theme` ブロックに `primary-*`・`gray-*`・`success/warning/error/info-*` を全追加
  - `--background: #f5f8fa`・`--foreground: #1a1a2e` に変更
  - 参照: `docs/design/design-system.md` § カラーパレット、`mockups/S10-gallery.html`（inline Tailwind config）
  - **DoD**: `bg-primary-500` が水色 `#00c1d4` でレンダリングされる

- [x] **DS-02** フォントを Noto Sans JP + Inter に変更する
  - `app/layout.tsx` の `Geist` 読み込みを削除し `next/font/google` で `Noto_Sans_JP`・`Inter` を読み込む
  - `globals.css` の `--font-sans` を新フォント変数に更新
  - 参照: `docs/design/design-system.md` § タイポグラフィ、`mockups/S01-top.html`
  - **DoD**: ページテキストが日本語 Noto Sans JP・英数字 Inter で表示される

- [x] **DS-03** ダークモードを削除しページ背景色・本文色を統一する
  - `globals.css` から `@media (prefers-color-scheme: dark)` ブロックを削除
  - `body` の背景色を `bg-gray-50 (#f5f8fa)`・テキスト色を `gray-900 (#1a1a2e)` に固定
  - `app/layout.tsx` の `<html>` から `dark:` クラスが混入していないか確認
  - **DoD**: ダークモード設定に関係なく白背景・ネイビーテキストで表示される

---

### Phase 2 — 基盤コンポーネント（DS-01〜03 完了後）

- [x] **DS-04** フォーム部品（入力・ボタン）の共通スタイルを修正する
  - 対象ファイル: `components/auth/LoginForm.tsx`, `RegisterForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`, `VerifyEmailForm.tsx`
  - `focus:ring-pink-*` → `focus:ring-primary-500`
  - `border-gray-300` → `border-gray-200`
  - ボタン: `bg-pink-*` → `bg-primary-500 hover:bg-primary-600`、`rounded-full` 統一
  - セカンダリボタン: `border-2 border-primary-500 text-primary-500 hover:bg-primary-50`
  - disabled: `bg-gray-100 text-gray-400 cursor-not-allowed`
  - 参照: `mockups/S02-register.html`, `S04-login.html`
  - **DoD**: 全認証フォームのボタン・入力フィールドが水色テーマで表示される

- [x] **DS-05** ボトムナビのカラーを修正する
  - `components/navigation/BottomNav.tsx`
  - アクティブ色 `text-pink-500` → `text-primary-500`
  - セーフエリア対応: `pb-safe` または `pb-4` を追加（モバイル下部余白）
  - `app/(app)/layout.tsx` の `pb-16` を調整
  - 参照: `mockups/S10-gallery.html`（fixed bottom nav のスタイル）
  - **DoD**: ボトムナビのアクティブタブが水色で表示される

---

### Phase 3 — 認証画面（DS-04 完了後）

- [x] **DS-06** ログイン・新規登録ページのレイアウトを修正する
  - `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
  - ページ全体に `bg-gray-50` を適用（現在は `bg-white` 系）
  - カード化: フォームを `bg-white rounded-2xl shadow-sm p-6` で囲む
  - ロゴ/サービス名の見出しスタイルを mockup に合わせる（text-3xl font-bold text-gray-900）
  - エラーバナー: `bg-error-50 text-error-500 rounded-md`
  - 参照: `mockups/S02-register.html`, `S04-login.html`
  - **DoD**: ログイン・登録画面がカード型フォームでモックアップ通りに表示される

- [x] **DS-07** パスワードリセット系画面のレイアウトを修正する
  - `app/(auth)/forgot-password/page.tsx`, `app/(auth)/reset-password/page.tsx`
  - DS-06 と同様のカード型レイアウトを適用
  - 「戻る」リンクのスタイル調整（`text-sm text-gray-500 hover:text-gray-700`）
  - 参照: `mockups/S05-pw-reset-input.html`, `S07-pw-reset-new.html`
  - **DoD**: パスワードリセット画面がモックアップのレイアウトと一致する

- [x] **DS-08** メール確認待ち画面のレイアウトを修正する
  - `app/(auth)/verify-email/page.tsx`（または `VerifyEmailForm.tsx`）
  - アイコン（封筒 SVG）+ テキスト + 再送信ボタンを中央寄せ縦並び
  - 再送信ボタンのクールダウン表示（残り秒数）を mockup に合わせる
  - 参照: `mockups/S03-email-confirm.html`
  - **DoD**: メール確認画面がアイコン付きの中央寄せレイアウトで表示される

---

### Phase 4 — オンボーディング（DS-04 完了後）

- [x] **DS-09** 女性オンボーディングのデザインを修正する（3 Step）
  - `components/profile/FemaleOnboardingForm.tsx`
  - プログレスバー: `h-1 flex gap-1.5`・完了分 `bg-primary-500`・未完了 `bg-gray-200`
  - アバターアップロードボタン: 円形・破線ボーダー・プラスアイコン（mockup S08）
  - 都道府県選択: 3 カラムグリッド・選択時 `bg-primary-500 text-white rounded-lg`
  - 参照: `mockups/S08-onboarding-female.html`, `S08-onboarding-female-step2.html`, `S08-onboarding-female-step3.html`
  - **DoD**: 3 Step すべてがモックアップのレイアウト・カラーで表示される

- [x] **DS-10** 男性オンボーディングのデザインを修正する（7 Step）
  - `components/profile/MaleOnboardingForm.tsx`
  - プログレスバー: `h-1 flex gap-1`・7 分割・DS-09 と同様
  - イケメンタイプ選択: 2 カラムグリッド・カード型（画像 + テキスト + チェックマーク）
  - 選択状態: `border-2 border-primary-500 bg-primary-50`、チェックアイコン `text-primary-500`
  - 参照: `mockups/S09-onboarding-male.html`〜`S09-onboarding-male-step7.html`
  - **DoD**: 7 Step すべてがモックアップのレイアウト・カラーで表示される

---

### Phase 5 — メインアプリ画面（DS-01〜05 完了後）

- [x] **DS-11** ユーザー一覧のカード・グリッドデザインを修正する
  - `components/user-card/UserCard.tsx`・`UserGrid.tsx`
  - 画像比率: `aspect-square` → `aspect-[3/4]`
  - バッジ色: `bg-pink-500` → `bg-primary-500`（イケメンタイプバッジ）
  - カード名前・年齢テキストサイズを mockup に合わせる（name: `text-sm font-semibold`, sub: `text-xs text-gray-500`）
  - グリッド: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3`
  - 参照: `mockups/S10-gallery.html`
  - **DoD**: ユーザー一覧が 3:4 比率カード・水色バッジで表示される

- [x] **DS-12** いいね一覧のリストデザインを修正する
  - `app/(app)/likes/page.tsx`
  - ハートアイコンを追加（各カード右側・`text-primary-500`）
  - カードスタイル確認: `rounded-2xl bg-white shadow-sm p-4`（現在 p-3 → p-4 に）
  - アバターサイズ: 現在 `h-14 w-14` → mockup の `h-16 w-16` に合わせる
  - 参照: `mockups/S12-likes-received.html`
  - **DoD**: いいね一覧のカードレイアウトがモックアップと一致する

- [x] **DS-13** マッチング一覧のリストデザインを修正する
  - `app/(app)/matches/page.tsx`
  - 未読バッジ色: `bg-pink-500` → `bg-primary-500`
  - 最終メッセージのプレビューテキスト追加（現在未実装・mockup にあり）
  - 参照: `mockups/S13-matches.html`
  - **DoD**: マッチング一覧の未読バッジが水色で表示される

- [x] **DS-14** ユーザー詳細ページのレイアウトを修正する
  - `app/(app)/users/[id]/page.tsx`
  - アバター: `mx-auto w-40` → 全幅 `w-full aspect-[3/4]` 画像（上部に配置）
  - いいねボタン: ページ下部に固定エリア（`fixed bottom-16 inset-x-0 px-4 pb-4`）
  - イケメンタイプタグ色: `bg-pink-100 text-pink-600` → `bg-primary-50 text-primary-500`
  - 詳細情報エリアに白カード化（`bg-white rounded-2xl shadow-sm p-4`）
  - 参照: `mockups/S11-user-detail.html`
  - **DoD**: ユーザー詳細が全幅プロフィール画像 + 固定いいねボタンのレイアウトで表示される

- [x] **DS-15** チャット画面のメッセージバブルを修正する
  - `components/chat/ChatMessages.tsx`・`ChatInput.tsx`
  - 自分のバブル: `bg-primary-500 text-white rounded-2xl rounded-br-sm`
  - 相手のバブル: `bg-white text-gray-900 rounded-2xl rounded-bl-sm shadow-xs`
  - 日付区切り: 中央横線スタイル（`border-t border-gray-200` + テキスト重ね）
  - 入力エリア: `border-t border-gray-200 bg-white`・送信ボタン `bg-primary-500`
  - 参照: `mockups/S14-chat.html`
  - **DoD**: チャット画面のメッセージが水色テーマのバブルで表示される

- [x] **DS-16** マイページのデザインを修正する
  - `app/(app)/settings/page.tsx`
  - プロフィールカード追加: アバター(大)・ニックネーム・年齢・都道府県を上部に表示
  - 設定リストのアイテムスタイル調整（chevron アイコン追加・mockup に合わせる）
  - 参照: `mockups/S15-mypage.html`
  - **DoD**: マイページ上部にプロフィールカードが表示される

---

## 後回しタスク（MVP 後）

- [ ] **DS-17** トップページをランディングページとして実装する
  - 現在 `/login` へリダイレクトのみ
  - ヒーローセクション（キャッチコピー + CTA ボタン 2 つ）
  - 特徴紹介セクション（3 カラム）
  - ログイン済みユーザーは `/users` へリダイレクト
  - 参照: `mockups/S01-top.html`
  - **DoD**: 未ログイン時にランディングページが表示され、ログイン・新規登録に遷移できる

- [ ] **DS-18** 認証コールバックエラー画面のデザインを修正する
  - `mockups/S16-auth-callback.html` に合わせてエラー表示を修正
  - 参照: `mockups/S16-auth-callback.html`
  - **DoD**: エラー時にわかりやすいエラーメッセージが表示される

- [ ] **DS-19** lg ブレークポイント以上のレスポンシブ対応を強化する
  - ギャラリーグリッド `lg:grid-cols-4` 適用確認
  - チャット画面でサイドバー表示（マッチング一覧 + チャット 2 ペイン）
  - 参照: mockups 各画面のデスクトップ表示
  - **DoD**: PC ブラウザで各画面が適切なレイアウトで表示される

- [ ] **DS-20** ページ遷移・インタラクションのアニメーションを追加する
  - ボタンの `transition` クラス統一
  - カードのホバーエフェクト（`hover:shadow-md`・`hover:scale-[1.01]`）
  - **DoD**: 主要 UI 操作に適切なトランジションが付く

- [ ] **DS-21** アクセシビリティ強化
  - フォーム全フィールドの `aria-label`・`aria-describedby` 確認
  - エラーメッセージを `role="alert"` で読み上げ対応
  - カラーコントラスト比 WCAG AA 準拠確認
  - **DoD**: スクリーンリーダーで主要操作が完結できる

---

## 作業順サマリ

```
DS-01 → DS-02 → DS-03
               ↓
         DS-04 → DS-05
               ↓
  DS-06 / DS-07 / DS-08 / DS-09 / DS-10 （並列可）
               ↓
  DS-11 / DS-12 / DS-13 / DS-14 / DS-15 / DS-16 （並列可）
               ↓
         MVP リリース
               ↓
  DS-17 〜 DS-21 （後回し）
```
