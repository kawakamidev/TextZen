import { expect } from '@playwright/test'
import { test } from './shared/setup'

test('エディタの機能テスト', async ({ page }) => {
  // Create a new note
  await page.locator('[aria-label="New"]').click()
  await page.waitForTimeout(1000)

  // Set title
  await page.keyboard.insertText('Editor Test')
  await expect(page.getByRole('link', { name: 'Editor Test', exact: true })).toBeVisible()

  // Focus on editor
  await page.locator('.cm-scroller').click()

  // Test basic text formatting
  await page.keyboard.insertText('# Heading 1\n\n')
  await page.keyboard.insertText('## Heading 2\n\n')
  await page.keyboard.insertText('**Bold text**\n\n')
  await page.keyboard.insertText('*Italic text*\n\n')

  // Test bullet list
  await page.keyboard.insertText('- Item 1\n')
  await page.keyboard.insertText('- Item 2\n')
  await page.keyboard.insertText('- Item 3\n\n')

  // Test numbered list
  await page.keyboard.insertText('1. First item\n')
  await page.keyboard.insertText('2. Second item\n')
  await page.keyboard.insertText('3. Third item\n\n')

  // Test code block
  await page.keyboard.insertText('```javascript\n')
  await page.keyboard.insertText('console.log("Hello world");\n')
  await page.keyboard.insertText('```\n\n')

  // Test external link
  await page.keyboard.insertText('[External Link](https://example.com)\n\n')

  // Verify content is displayed correctly
  await expect(page.getByText('Heading 1')).toBeVisible()
  await expect(page.getByText('Heading 2')).toBeVisible()
  await expect(page.getByText('Bold text')).toBeVisible()
  await expect(page.getByText('Italic text')).toBeVisible()
  await expect(page.getByText('Item 1')).toBeVisible()
  await expect(page.getByText('First item')).toBeVisible()
  await expect(page.getByText('console.log')).toBeVisible()
  await expect(page.locator('a[href="https://example.com"]')).toBeVisible()
})

test('テーブル機能のテスト', async ({ page }) => {
  // Create a new note
  await page.locator('[aria-label="New"]').click()
  await page.waitForTimeout(1000)

  // Set title
  await page.keyboard.insertText('Table Test')

  // Focus on editor
  await page.locator('.cm-scroller').click()

  // Insert a markdown table
  await page.keyboard.insertText('| Header 1 | Header 2 | Header 3 |\n')
  await page.keyboard.insertText('| --- | --- | --- |\n')
  await page.keyboard.insertText('| Cell 1-1 | Cell 1-2 | Cell 1-3 |\n')
  await page.keyboard.insertText('| Cell 2-1 | Cell 2-2 | Cell 2-3 |\n\n')

  // Check if the table is rendered correctly
  await expect(page.locator('table')).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Cell 1-1' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Cell 2-3' })).toBeVisible()
})

test('画像表示のテスト', async ({ page }) => {
  // Navigate to example with images
  await page.getByText('example', { exact: true }).click()
  await page.waitForTimeout(1000)

  // Check if images are displayed
  await expect(page.locator('img[src="https://picsum.photos/200/300"]')).toBeVisible()
  await expect(page.locator('img[src$="lena.png"]')).toBeVisible()

  // Create a new note with relative image
  await page.locator('[aria-label="New"]').click()
  await page.waitForTimeout(1000)

  // Set title
  await page.keyboard.insertText('Image Test')

  // Insert image reference
  await page.locator('.cm-scroller').click()
  await page.keyboard.insertText('![Lena Image](lena.png)\n\n')

  // Check if image is rendered
  await expect(page.locator('img[src$="lena.png"]')).toBeVisible()
})
