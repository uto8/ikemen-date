import { test, expect } from '@playwright/test'

// 未ログイン時の保護ルートリダイレクト検証
// いいね → マッチング → チャット開通の各エントリポイントが正しく保護されていることを確認する

const PROTECTED_ROUTES = [
  { path: '/users', label: 'ユーザー一覧（いいねの起点）' },
  { path: '/likes', label: 'もらったいいね一覧' },
  { path: '/matches', label: 'マッチング一覧（チャット開通の起点）' },
  { path: '/settings', label: '設定' },
]

test.describe('未ログイン時のリダイレクト', () => {
  for (const { path, label } of PROTECTED_ROUTES) {
    test(`${label} (${path}) は未ログイン時に /login へリダイレクトされる`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL('/login')
    })
  }
})

test.describe('未マッチのチャット URL へのリダイレクト', () => {
  test('存在しない match_id の /chat/[id] は未ログイン時に /login へリダイレクトされる', async ({ page }) => {
    await page.goto('/chat/00000000-0000-0000-0000-000000000000')
    await expect(page).toHaveURL('/login')
  })

  test('ランダムな文字列の /chat/[id] も /login へリダイレクトされる', async ({ page }) => {
    await page.goto('/chat/not-a-real-match')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('404 ページ', () => {
  test('存在しないパスで 404 ページが表示される', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await expect(page.getByText('ページが見つかりません')).toBeVisible()
    await expect(page.getByRole('link', { name: 'トップへ戻る' })).toBeVisible()
  })
})

test.describe('プロフィール編集ページ', () => {
  test('/settings/profile は未ログイン時に /login へリダイレクトされる', async ({ page }) => {
    await page.goto('/settings/profile')
    await expect(page).toHaveURL('/login')
  })
})
