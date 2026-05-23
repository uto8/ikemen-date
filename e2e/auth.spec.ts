import { test, expect } from '@playwright/test'

// 認証フロー: 登録 → メール確認 → オンボーディング → 一覧
// メール確認はテスト環境で自動化できないため、各画面のUIと遷移を検証する

test.describe('ルートリダイレクト', () => {
  test('/ にアクセスすると /login にリダイレクトされる', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })
})

test.describe('ログイン画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('ログインフォームが表示される', async ({ page }) => {
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    await expect(page.getByRole('button', { name: 'ログインする' })).toBeVisible()
  })

  test('「パスワードをお忘れの方はこちら」リンクが表示される', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'パスワードをお忘れの方はこちら' })).toBeVisible()
  })

  test('リンクをクリックすると /forgot-password に遷移する', async ({ page }) => {
    await page.getByRole('link', { name: 'パスワードをお忘れの方はこちら' }).click()
    await expect(page).toHaveURL('/forgot-password')
  })
})

test.describe('新規登録画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('登録フォームの全フィールドが表示される', async ({ page }) => {
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    await expect(page.getByLabel('女性')).toBeVisible()
    await expect(page.getByLabel('男性')).toBeVisible()
    await expect(page.getByLabel('生年月日')).toBeVisible()
    await expect(page.getByRole('button', { name: '登録する' })).toBeVisible()
  })

  test('空送信でバリデーションエラーが表示される', async ({ page }) => {
    await page.getByRole('button', { name: '登録する' }).click()
    // クライアントサイドバリデーション: エラーメッセージが1件以上表示される
    await expect(page.locator('p.text-red-500').first()).toBeVisible()
  })

  test('無効なメールアドレスでエラーが表示される', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('not-an-email')
    await page.getByLabel('パスワード').fill('Password1')
    await page.getByLabel('女性').check()
    await page.getByRole('button', { name: '登録する' }).click()
    await expect(page.locator('p.text-red-500').first()).toBeVisible()
  })

  test('8文字未満パスワードでエラーが表示される', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('Pass1')
    await page.getByLabel('女性').check()
    await page.getByRole('button', { name: '登録する' }).click()
    await expect(page.locator('p.text-red-500').first()).toBeVisible()
  })
})

test.describe('パスワードリセット画面', () => {
  test('フォームが表示される', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByRole('heading', { name: 'パスワードをお忘れの方' })).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByRole('button', { name: 'リセットメールを送信' })).toBeVisible()
  })

  test('「ログイン画面に戻る」リンクが /login に遷移する', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByRole('link', { name: 'ログイン画面に戻る' }).click()
    await expect(page).toHaveURL('/login')
  })
})

test.describe('メール確認画面', () => {
  test('メール確認ページが表示される', async ({ page }) => {
    await page.goto('/verify-email')
    await expect(page.getByRole('heading', { name: 'メールを確認してください' })).toBeVisible()
    await expect(page.getByRole('button', { name: '確認メールを再送信する' })).toBeVisible()
  })
})
