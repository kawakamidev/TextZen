import { test, expect } from './shared/setup'

test.describe('検索機能', () => {
  test('全文検索ができること', async ({ page }) => {
    await page.locator('[aria-label="Full Text Search"]').click()
    await page.locator('input').focus()
    await page.keyboard.insertText('Example Image')
    await page.keyboard.press('Enter')
    await expect(page.locator('.fts-line')).toBeVisible()
  })

  test('ファイル検索ができること', async ({ page }) => {
    await page.locator('[aria-label="Search File"]').click()
    await page.locator('input').focus()
    await page.keyboard.insertText('Example')
    await expect(page.locator('.fs-i').first()).toBeVisible()
  })
})
