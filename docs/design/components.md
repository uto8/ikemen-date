# イケメンデート — コンポーネント定義

モックアップ全23画面から抽出した共通UIコンポーネントの一覧。

---

## 目次

1. [Button](#1-button)
2. [TextInput](#2-textinput)
3. [PasswordInput](#3-passwordinput)
4. [Textarea](#4-textarea)
5. [NumberInput](#5-numberinput)
6. [Header](#6-header)
7. [ProgressBar](#7-progressbar)
8. [BottomNav](#8-bottomnav)
9. [Avatar](#9-avatar)
10. [Badge](#10-badge)
11. [UserCard](#11-usercard)
12. [UserListItem](#12-userlistitem)
13. [IkemenTypeCard](#13-ikementypecard)
14. [PrefectureGrid](#14-prefecturegrid)
15. [LikeButton](#15-likebutton)
16. [ChatBubble](#16-chatbubble)
17. [ChatDateDivider](#17-chatdatedivider)
18. [ChatInput](#18-chatinput)
19. [Modal](#19-modal)
20. [ErrorBanner](#20-errorbanner)
21. [FieldError](#21-fielderror)
22. [EmptyState](#22-emptystate)
23. [OnlineIndicator](#23-onlineindicator)
24. [ResendButton](#24-resendbutton)

---

## 1. Button

プライマリ・テキスト・アイコンの3バリエーション。

### バリエーション

| バリエーション | 見た目 | 用途 |
|---|---|---|
| `primary` | `bg-primary-500` 角丸フル・白文字 | メインCTA（「次へ」「登録する」「ログイン」） |
| `secondary` | `border border-primary-500` 透明背景・primary文字 | サブCTA（「メール再送信」） |
| `danger` | `bg-error-500` 白文字 | 破壊的操作（「退会する」） |
| `ghost` | 背景なし・下線付きテキスト | テキストリンク（「スキップする」「パスワードを忘れた方はこちら」） |

### 状態

| 状態 | 見た目 |
|---|---|
| `default` | 定義色 |
| `hover` | 1段階暗いトーン（`primary-600`、`error-600`） |
| `disabled` | `bg-gray-200 text-gray-400 cursor-not-allowed` |
| `loading` | ボタン内にスピナー、テキスト非表示、disabled扱い |

### 使用箇所

S01〜S15 のほぼ全画面

### プロパティ

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `variant` | `primary \| secondary \| danger \| ghost` | `primary` | バリエーション |
| `size` | `md \| sm` | `md` | `md`=全幅ピル・`sm`=インライン |
| `disabled` | `boolean` | `false` | — |
| `loading` | `boolean` | `false` | — |
| `onClick` / `href` | `function \| string` | — | — |
| `children` | `ReactNode` | — | ボタンラベル |

---

## 2. TextInput

テキスト・メール・日付系の単行入力。

### バリエーション

| バリエーション | `type` | 使用箇所 |
|---|---|---|
| text | `text` | ニックネーム・職業 |
| email | `email` | 新規登録・ログイン・パスワードリセット |
| date | `date` | 生年月日（S02） |

### 状態

| 状態 | 見た目 |
|---|---|
| `default` | `border-gray-200` |
| `focus` | `ring-2 ring-primary-500 border-transparent` |
| `error` | `border-error-500`（FieldError と併用） |
| `disabled` | `bg-gray-100 text-gray-400` |

### 使用箇所

S02、S04、S05、S08-F2、S09-M2、S09-M4

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `label` | `string` | ラベルテキスト |
| `required` | `boolean` | 必須マーク（赤 `*`） |
| `placeholder` | `string` | — |
| `maxLength` | `number` | — |
| `showCounter` | `boolean` | 「N / XX文字」を表示する |
| `error` | `string` | エラーメッセージ（FieldError に渡す） |
| `value / onChange` | — | — |

---

## 3. PasswordInput

パスワード入力 + 表示トグルアイコン付き。

### バリエーション

なし（常に `type="password"` ベース）

### 状態

TextInput に加えて:

| 状態 | 見た目 |
|---|---|
| `visible` | `type="text"` に切り替え・アイコンが eye-off |
| `error` | 入力枠が `border-error-500`、アイコンが赤 |

### 使用箇所

S02、S04、S07

### プロパティ

TextInput のプロパティに加えて:

| プロパティ | 型 | 説明 |
|---|---|---|
| `showToggle` | `boolean` | 表示トグルアイコンの有無（デフォルト `true`） |

---

## 4. Textarea

複数行テキスト入力。

### バリエーション

| バリエーション | 用途 |
|---|---|
| `bio` | 自己紹介文（S09-M6）。固定高さ・`resize-none` |

### 状態

TextInput と同じ（default / focus / error）

### 使用箇所

S09-M6

### プロパティ

TextInput のプロパティに加えて:

| プロパティ | 型 | 説明 |
|---|---|---|
| `rows` | `number` | 初期表示行数 |
| `maxLength` | `number` | 文字数上限 |
| `showCounter` | `boolean` | 「N / XX文字」カウンター |

---

## 5. NumberInput

数値専用入力（単位ラベル付き）。

### バリエーション

なし（身長入力のみで使用）

### 状態

TextInput と同じ

### 使用箇所

S09-M5（身長・cm 単位）

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `label` | `string` | — |
| `unit` | `string` | 右端に表示する単位（例: `cm`） |
| `min / max` | `number` | 入力範囲 |
| `placeholder` | `string` | — |
| `error` | `string` | — |

---

## 6. Header

画面上部の固定ヘッダー。

### バリエーション

| バリエーション | 構成 | 使用箇所 |
|---|---|---|
| `logo-only` | ロゴのみ中央 | S01、S09-M1 |
| `back` | 戻るアイコン（左）＋ロゴ（中央） | S02〜S09全ステップ、S11、S14 |
| `back-with-action` | 戻るアイコン（左）＋ロゴ（中央）＋ 右アクション | （将来拡張用） |

### 状態

状態変化なし

### 使用箇所

全画面（BottomNav のある画面は BottomNav との組み合わせ）

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `showBack` | `boolean` | 戻るボタンの表示 |
| `backHref` | `string` | 戻り先URL |
| `rightSlot` | `ReactNode` | 右端スロット（任意） |

---

## 7. ProgressBar

オンボーディングのステップ進捗バー。

### バリエーション

| バリエーション | ステップ数 | 使用箇所 |
|---|---|---|
| `female` | 3ステップ | S08 オンボーディング |
| `male` | 7ステップ | S09 オンボーディング |

### 状態

- 完了・現在ステップ: `bg-primary-500`
- 未完了ステップ: `bg-gray-200`

### 使用箇所

S08-F1〜F3、S09-M1〜M7

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `current` | `number` | 現在ステップ番号（1始まり） |
| `total` | `number` | 総ステップ数 |
| `label` | `string` | 現在ステップ名（例: 「プロフィール画像」） |

---

## 8. BottomNav

ログイン済み画面の固定ボトムナビゲーション。

### バリエーション

なし（常に4タブ固定）

| タブ | アイコン | リンク先 | バッジ対象 |
|---|---|---|---|
| 一覧 | grid-2x2 | S10 | なし |
| いいね | heart | S12 | 未読いいね数 |
| マッチング | chat-bubble | S13 | 未読マッチ数 |
| マイページ | user-circle | S15 | なし |

### 状態

| 状態 | 見た目 |
|---|---|
| `active` | `text-primary-500 font-semibold` |
| `inactive` | `text-gray-400` |

### バッジ仕様

- アイコン右上に赤丸（`bg-red-500`）+ 白数字で表示
- 表示条件: 未読件数が 1 以上
- 上限: 99 件超は `99+` と表示
- **非表示条件**: そのタブが `active`（= 現在その画面を開いている）のとき
  - いいねタブバッジ → S12（いいね一覧）を開いている間は非表示
  - マッチングタブバッジ → S13（マッチング一覧）を開いている間は非表示
- **既読タイミング**: S12/S13 を開いた瞬間にカウントをゼロにする
- **リアルタイム更新**: Supabase Realtime で即時反映

### 使用箇所

S10〜S15

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `activeTab` | `gallery \| likes \| matches \| mypage` | 現在のアクティブタブ |
| `unreadLikes` | `number` | 未読いいね数（0 でバッジ非表示） |
| `unreadMatches` | `number` | 未読マッチ数（0 でバッジ非表示） |

---

## 9. Avatar

円形プロフィール画像。

### バリエーション

| サイズ | クラス例 | 使用箇所 |
|---|---|---|
| `sm` | `w-10 h-10` | チャット画面の相手アイコン（S14） |
| `md` | `w-16 h-16` | いいね・マッチ一覧（S12・S13） |
| `lg` | `w-36 h-36` | オンボーディング選択後プレビュー（S08・S09） |
| `xl` | `w-full aspect-square` | ユーザー詳細（S11） |

### 状態

| 状態 | 見た目 |
|---|---|
| `default` | 画像表示 |
| `empty` | グレー背景 + user アイコン（退会済みユーザー） |
| `with-online` | OnlineIndicator を重ねて表示（S13） |

### 使用箇所

S08-F1、S09-M1、S10、S11、S12、S13、S14、S15

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `src` | `string \| null` | 画像URL。null で空プレースホルダー |
| `alt` | `string` | — |
| `size` | `sm \| md \| lg \| xl` | — |
| `showOnline` | `boolean` | OnlineIndicator の表示 |

---

## 10. Badge

イケメンタイプ名を示す小タグ。

### バリエーション

なし（常に同一スタイル）

### 状態

状態変化なし

### 使用箇所

S10（カードオーバーレイ）、S11（詳細ページ タグ一覧）

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `label` | `string` | タイプ名（例: 「爽やかスポーツ」） |

---

## 11. UserCard

ギャラリー一覧の2カラムカード。

### バリエーション

なし

### 状態

| 状態 | 見た目 |
|---|---|
| `default` | shadow-sm |
| `hover` | shadow-md |

### 使用箇所

S10

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `userId` | `string` | 詳細ページへのリンク生成に使用 |
| `avatarUrl` | `string` | — |
| `nickname` | `string` | — |
| `age` | `number` | — |
| `prefecture` | `string` | — |
| `ikemenType` | `string` | バッジに表示するメインタイプ |

---

## 12. UserListItem

いいね・マッチ一覧の横並び行。

### バリエーション

| バリエーション | 違い | 使用箇所 |
|---|---|---|
| `likes` | 右端にハートアイコン | S12 |
| `matches` | OnlineIndicator あり・右端にチャットアイコン | S13 |

### 状態

| 状態 | 見た目 |
|---|---|
| `default` | — |
| `hover` | shadow-md |

### 使用箇所

S12、S13

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `avatarUrl` | `string` | — |
| `nickname` | `string` | — |
| `age` | `number` | — |
| `prefecture` | `string` | — |
| `timestamp` | `string` | 「12分前」「昨日」などフォーマット済み文字列 |
| `variant` | `likes \| matches` | — |
| `isOnline` | `boolean` | matches バリエーションのみ |
| `href` | `string` | タップ先リンク |

---

## 13. IkemenTypeCard

イケメンタイプ選択グリッドの1カード（チェックボックス付き）。

### バリエーション

なし

### 状態

| 状態 | 見た目 |
|---|---|
| `unchecked` | `border-gray-200 bg-white` / チェックアイコン: `text-gray-300` |
| `checked` | `border-primary-500 bg-primary-50` / チェックアイコン: `text-primary-500 filled` |
| `hover` | `border-primary-500` |

### 使用箇所

S09-M7

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `typeId` | `string` | DB上のタイプID |
| `label` | `string` | タイプ名 |
| `imageSrc` | `string` | キャラクター画像URL |
| `checked` | `boolean` | — |
| `onChange` | `function` | — |

---

## 14. PrefectureGrid

都道府県を3カラムグリッドで選択するUI。

### バリエーション

なし（固定の都道府県リスト）

### 状態

各ボタン:

| 状態 | 見た目 |
|---|---|
| `unselected` | `border-gray-200 bg-white text-gray-700` |
| `selected` | `border-primary-500 bg-primary-50 text-primary-500 font-semibold` |
| `hover` | `border-primary-100` |

### 使用箇所

S08-F3、S09-M3

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `value` | `string \| null` | 選択済み都道府県名 |
| `onChange` | `function` | — |

---

## 15. LikeButton

いいね送信ボタン（3状態）。

### バリエーション

なし

### 状態

| 状態 | 見た目 | 説明 |
|---|---|---|
| `idle` | `border-primary-500 text-primary-500` ハートアウトライン | 未いいね |
| `liked` | `bg-primary-500 text-white` ハート塗りつぶし | いいね済み |
| `matched` | `bg-primary-500 text-white` + 「マッチ成立！」バナー | マッチング成立直後 |

### 使用箇所

S11

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `status` | `idle \| liked \| matched` | — |
| `onClick` | `function` | — |
| `loading` | `boolean` | 送信中スピナー表示 |

---

## 16. ChatBubble

チャット画面のメッセージ吹き出し。

### バリエーション

| バリエーション | 見た目 | 説明 |
|---|---|---|
| `self` | `bg-primary-500 text-white` 右寄せ・`rounded-br-sm` | 自分のメッセージ |
| `other` | `bg-white text-gray-900` 左寄せ・`rounded-bl-sm` + Avatar | 相手のメッセージ |

### 状態

| 状態 | 見た目 |
|---|---|
| `default` | — |
| `withdrawn` | `opacity-60` グレー表示（退会済みユーザー） |

### 使用箇所

S14

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `variant` | `self \| other` | — |
| `text` | `string` | メッセージ本文 |
| `timestamp` | `string` | 送信時刻（フォーマット済み） |
| `avatarUrl` | `string \| null` | `other` バリエーションのみ使用 |
| `isWithdrawn` | `boolean` | 退会ユーザーのスタイル |

---

## 17. ChatDateDivider

チャット内の日付区切り線。

### バリエーション

なし

### 状態

状態変化なし

### 使用箇所

S14

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `label` | `string` | 「2026年5月23日」「今日」など |

---

## 18. ChatInput

チャット入力エリア（テキストエリア + 送信ボタン）。

### バリエーション

| バリエーション | 説明 |
|---|---|
| `active` | 通常入力可能状態 |
| `disabled` | 退会済み相手のとき入力不可・警告バナー表示 |

### 状態

| 状態 | 見た目 |
|---|---|
| `empty` | 送信ボタン: `bg-gray-200`（非活性） |
| `filled` | 送信ボタン: `bg-primary-500`（活性） |
| `focus` | テキストエリア: `ring-primary-500` |

### 使用箇所

S14

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `disabled` | `boolean` | 退会済み相手のとき true |
| `maxLength` | `number` | 文字数上限（500） |
| `onSend` | `function` | 送信ハンドラ |

---

## 19. Modal

オーバーレイ表示のダイアログ。

### バリエーション

| バリエーション | 説明 | 使用箇所 |
|---|---|---|
| `match` | マッチング成立のお祝い表示。primaryカラー。「チャットへ」ボタン | S11 |
| `confirm` | 確認ダイアログ。キャンセル + 実行の2ボタン | S15（ログアウト・退会） |

### 状態

| 状態 | 説明 |
|---|---|
| `open` | 表示 |
| `closed` | 非表示 |

### 使用箇所

S11、S15

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `variant` | `match \| confirm` | — |
| `open` | `boolean` | — |
| `title` | `string` | — |
| `description` | `string` | — |
| `confirmLabel` | `string` | 実行ボタンラベル |
| `confirmVariant` | `primary \| danger` | 実行ボタンの色 |
| `onConfirm` | `function` | — |
| `onCancel` | `function` | — |

---

## 20. ErrorBanner

ページ上部に表示するエラー通知バナー。

### バリエーション

なし

### 状態

| 状態 | 説明 |
|---|---|
| `visible` | エラー発生時 |
| `hidden` | エラーなし |

### 使用箇所

S04（ログイン失敗）、S07（パスワード不一致）

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `message` | `string` | エラーメッセージ |
| `visible` | `boolean` | — |

---

## 21. FieldError

フォームフィールド直下のインラインエラーテキスト。

### バリエーション

なし

### 状態

エラー文字列の有無で表示切替

### 使用箇所

S02、S04、S07、S08-F2、S08-F3、S09-M7 など

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `message` | `string \| undefined` | undefined で非表示 |

---

## 22. EmptyState

リストにデータがないときのフィラー表示。

### バリエーション

| バリエーション | アイコン | 使用箇所 |
|---|---|---|
| `likes` | アウトラインハート | S12 |
| `matches` | アウトラインチャット | S13 |

### 状態

状態変化なし

### 使用箇所

S12、S13

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `icon` | `heart \| chat` | 表示アイコン種類 |
| `title` | `string` | メインメッセージ |
| `description` | `string` | サブメッセージ |

---

## 23. OnlineIndicator

アバターに重ねるオンライン状態ドット。

### バリエーション

なし（オンライン表示のみ。オフライン時は非表示）

### 状態

状態変化なし（表示 or 非表示）

### 使用箇所

S13（マッチ一覧のアバター右下）

### プロパティ

なし（表示するかどうかは Avatar の `showOnline` プロパティで制御）

---

## 24. ResendButton

メール再送信ボタン（クールダウン付き）。

### バリエーション

なし

### 状態

| 状態 | 見た目 |
|---|---|
| `active` | `border-primary-500 text-primary-500`・クリック可 |
| `cooldown` | `border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed`・残秒数テキスト表示 |

### 使用箇所

S03

### プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `cooldownSeconds` | `number` | 残クールダウン秒数。0 で active |
| `onResend` | `function` | クリックハンドラ |
