import { test, expect } from './shared/setup'
import { createNewNote, navigateToNote, createInternalLink } from './utils/test-helpers'

test.describe('ファイル操作', () => {
  test('複数ファイルの作成とナビゲーションができること', async ({ page }) => {
    // Create first file
    await createNewNote(page, 'File One', 'Content of the first file')

    // Create second file
    await createNewNote(page, 'File Two', 'Content of the second file')

    // Create third file
    await createNewNote(page, 'File Three', 'Content of the third file')

    // Navigate to the first file
    await navigateToNote(page, 'File One')
    await expect(page.getByText('Content of the first file')).toBeVisible()

    // Navigate to the third file
    await navigateToNote(page, 'File Three')
    await expect(page.getByText('Content of the third file')).toBeVisible()

    // Navigate to the second file
    await navigateToNote(page, 'File Two')
    await expect(page.getByText('Content of the second file')).toBeVisible()
  })

  test('内部リンクによるファイル間参照ができること', async ({ page }) => {
    // Create source file
    await createNewNote(page, 'Source Document', '')

    // Create target file
    await createNewNote(page, 'Target Document', 'This is the target document content')

    // Go back to source file and add link
    await navigateToNote(page, 'Source Document')
    await page.locator('.cm-scroller').click()
    await createInternalLink(page, 'Target Document')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.insertText(' リンクテスト')
    await page.waitForTimeout(500)

    // Check link is created
    await expect(page.locator('a.cm-internal-link-icon')).toBeVisible()

    // Navigate using link
    await page.locator('a.cm-internal-link-icon').click()
    await page.waitForTimeout(500)
    await expect(page.getByText('This is the target document content')).toBeVisible()
    expect(await page.locator('.tf').inputValue()).toBe('Target Document')
  })
})
