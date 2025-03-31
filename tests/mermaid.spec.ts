import { test, expect } from './shared/setup'

test.describe('Mermaid図表の表示', () => {
  test('Mermaid図表が正しく表示されること', async ({ page }) => {
    await page.getByText('Mermaid').click()
    await expect(page.locator('svg')).toBeVisible()
  })
})
