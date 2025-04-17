import { test, expect } from './shared/setup'
import { createNewNote, navigateToNote } from './utils/test-helpers'

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
})
