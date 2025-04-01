import { expect } from '@playwright/test'
import { test } from './shared/setup'
import { promises as fs } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test('ファイル変更検出テスト', async ({ page, testId }) => {
  const testNotesPath = join(__dirname, 'notes', testId)
  const testFile = join(testNotesPath, 'external-file.md')

  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)

  await page.getByRole('link', { name: 'external-file', exact: true }).click()
  await page.waitForTimeout(1000)

  await fs.writeFile(
    testFile,
    '# First External Change\n\nThis is the first external change.\n\n- Updated item 1\n- Updated item 2',
    'utf-8'
  )

  await expect(page.getByText('First External Change', { exact: true })).toBeVisible()
  await expect(page.getByText('This is the first external change.', { exact: true })).toBeVisible()

  await fs.writeFile(
    testFile,
    '# Second External Change\n\nThis is the second external change.\n\n1. Numbered item 1\n2. Numbered item 2',
    'utf-8'
  )

  await expect(page.getByText('Second External Change', { exact: true })).toBeVisible()
  await expect(page.getByText('This is the second external change.', { exact: true })).toBeVisible()
  await expect(page.getByText('Numbered item 1', { exact: true })).toBeVisible()
  await expect(page.getByText('Numbered item 2', { exact: true })).toBeVisible()

  await page.locator('[aria-label="New"]').click()
  await page.waitForTimeout(1000)
  await page.keyboard.insertText('Stability Test')
  await expect(page.getByRole('link', { name: 'Stability Test', exact: true })).toBeVisible()
})
