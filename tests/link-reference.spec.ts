import { test, expect } from './shared/setup'

test.describe('リンク参照機能', () => {
  test('リンクが自動的に書き換えられること', async ({ page }) => {
    // Create source file
    await page.locator('[aria-label="New"]').click()
    await page.waitForTimeout(1000)
    await page.keyboard.insertText('参照先')
    await page.waitForTimeout(1000)

    // Create target file with a link to the source
    await page.locator('[aria-label="New"]').click()
    await page.waitForTimeout(1000)
    await page.keyboard.insertText('参照元')
    await page.locator('.cm-scroller').click()
    await page.keyboard.insertText('[[参照先]]')
    await page.waitForTimeout(1000)

    // Rename the source file
    await page.getByRole('link', { name: '参照先', exact: true }).first().click()
    await page.locator('.tf').click()
    await page.keyboard.insertText('編集済み')
    await page.waitForTimeout(1000)

    // Verify that the link in the target file has been updated
    await page.getByRole('link', { name: '参照元', exact: true }).click()
    await expect(page.getByText('[[参照先編集済み]]')).toBeVisible()
  })
})
