import { test, expect } from './shared/setup'

test.describe('基本的なファイル操作', () => {
  test('新規作成と編集ができること', async ({ page }) => {
    await page.locator('[aria-label="New"]').click()
    await expect(page.getByRole('link', { name: 'Untitled', exact: true })).toBeVisible()
    await page.waitForTimeout(1000)

    await page.keyboard.insertText('New Title')
    await expect(page.getByRole('link', { name: 'New Title', exact: true })).toBeVisible()

    await page.locator('.cm-scroller').click()
    await page.keyboard.down('[')
    await page.keyboard.down('[')
    await page.waitForTimeout(1000)

    await page.locator('#example').first().click()
    await expect(page.locator('a.cm-hyper-link-icon').first()).toBeVisible()
    await expect(page.locator('img[src="https://picsum.photos/200/300"]')).toBeVisible()
    await expect(page.locator('img[src$="lena.png"]')).toBeVisible()
  })
})
