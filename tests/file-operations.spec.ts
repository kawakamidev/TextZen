import { expect } from '@playwright/test'
import { test } from './shared/setup'

test('ファイル作成と削除のテスト', async ({ page }) => {
  // Create a new file
  await page.locator('[aria-label="New"]').click()
  await page.waitForTimeout(1000)

  // Set title to identify for deletion
  await page.keyboard.insertText('Delete Test')
  await expect(page.getByRole('link', { name: 'Delete Test', exact: true })).toBeVisible()

  // Add some content
  await page.locator('.cm-scroller').click()
  await page.keyboard.insertText('This file will be deleted.')
  await page.waitForTimeout(1000)

  // Verify file exists in sidebar
  await expect(page.getByRole('link', { name: 'Delete Test', exact: true })).toBeVisible()

  // Need to implement delete functionality testing
  // For now, just check that the file was created
  await expect(page.getByText('This file will be deleted.')).toBeVisible()
})

test('ファイル間の移動テスト', async ({ page }) => {
  // Create first file
  await page.locator('[aria-label="New"]').click()
  await page.waitForTimeout(1000)
  await page.keyboard.insertText('First File')
  await page.locator('.cm-scroller').click()
  await page.keyboard.insertText('Content in first file')
  await page.waitForTimeout(1000)

  // Create second file
  await page.locator('[aria-label="New"]').click()
  await page.waitForTimeout(1000)
  await page.keyboard.insertText('Second File')
  await page.locator('.cm-scroller').click()
  await page.keyboard.insertText('Content in second file')
  await page.waitForTimeout(1000)

  // Navigate to first file
  await page.getByRole('link', { name: 'First File', exact: true }).click()
  await page.waitForTimeout(1000)

  // Check content
  await expect(page.getByText('Content in first file')).toBeVisible()

  // Navigate to second file
  await page.getByRole('link', { name: 'Second File', exact: true }).click()
  await page.waitForTimeout(1000)

  // Check content
  await expect(page.getByText('Content in second file')).toBeVisible()
})
