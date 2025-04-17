import { expect } from '@playwright/test'
import { createNewNote, navigateToNote, searchForFile, searchFullText } from './utils/test-helpers'
import { test } from './shared/setup'

test('統合テストシナリオ', async ({ page }) => {
  // Create multiple notes
  await createNewNote(
    page,
    'Main Document',
    '# Main Document Content\n\nThis is the primary document.'
  )
  await createNewNote(
    page,
    'Secondary Document',
    '## Secondary Content\n\nThis document has secondary information.'
  )
  await createNewNote(
    page,
    'Reference Material',
    'This contains important reference material.\n\n- Item 1\n- Item 2'
  )

  // Navigate between documents
  await navigateToNote(page, 'Main Document')
  await expect(page.getByText('Main Document Content')).toBeVisible()

  await navigateToNote(page, 'Secondary Document')
  await expect(page.getByText('Secondary Content')).toBeVisible()

  // Test file search
  await searchForFile(page, 'Secondary')
  await expect(page.getByText('Secondary Document').first()).toBeVisible()

  // Navigate using search results
  await page.getByText('Secondary Document').first().click()
  expect(await page.locator('.tf').inputValue()).toBe('Secondary Document')

  // Test full text search
  await searchFullText(page, 'important reference')
  await expect(page.locator('.fts-line')).toBeVisible()

  // Click on search result to navigate
  await page.locator('.fts-line').first().click()
  expect(await page.locator('.tf').inputValue()).toBe('Reference Material')

  // Edit content and verify changes persist
  await page.locator('.cm-scroller').click()
  await page.keyboard.press('End')
  await page.keyboard.insertText('\n\n### New Section\n\nAdded new content')
  await page.waitForTimeout(1000)

  // Navigate away and back to verify persistence
  await navigateToNote(page, 'Main Document')
  await navigateToNote(page, 'Reference Material')

  // Verify content was saved
  await expect(page.getByText('New Section')).toBeVisible()
  await expect(page.getByText('Added new content')).toBeVisible()
})

test('マークダウン拡張機能テスト', async ({ page }) => {
  // Create a note with various markdown extensions
  await createNewNote(
    page,
    'Markdown Features',
    `# Markdown Extensions Test

## Code Blocks
\`\`\`javascript
function testFunction() {
  return "Hello world";
}
\`\`\`

## Tables
| Column 1 | Column 2 | Column 3 |
| -------- | -------- | -------- |
| Value 1  | Value 2  | Value 3  |
| Text A   | Text B   | Text C   |

## Task Lists
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Blockquotes
> This is a blockquote
> It can span multiple lines

## Horizontal Rule
---

## Links
[External Link](https://example.com)
`
  )

  // Verify table rendering
  await expect(page.locator('table')).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Value 2' })).toBeVisible()

  // Verify external link
  await expect(page.locator('a[href="https://example.com"]')).toBeVisible()
})
