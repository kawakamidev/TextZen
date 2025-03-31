import { test, expect } from './shared/setup'

test.describe('高度なコンテンツ編集', () => {
  test('様々なマークダウン要素が編集できること', async ({ page }) => {
    // Create a new note
    await page.locator('[aria-label="New"]').click()
    await page.waitForTimeout(1000)

    // Set title
    await page.keyboard.insertText('Advanced Markdown Test')
    await expect(
      page.getByRole('link', { name: 'Advanced Markdown Test', exact: true })
    ).toBeVisible()

    // Focus on editor
    await page.locator('.cm-scroller').click()

    // Add headings
    await page.keyboard.insertText('# Heading 1\n\n')
    await page.keyboard.insertText('## Heading 2\n\n')
    await page.keyboard.insertText('### Heading 3\n\n')

    // Add text formatting
    await page.keyboard.insertText('**Bold text**\n\n')
    await page.keyboard.insertText('*Italic text*\n\n')
    await page.keyboard.insertText('~~Strikethrough~~\n\n')

    // Add lists
    await page.keyboard.insertText('- Item 1\n')
    await page.keyboard.insertText('- Item 2\n')
    await page.keyboard.insertText('  - Nested item\n\n')

    await page.keyboard.insertText('1. Numbered item 1\n')
    await page.keyboard.insertText('2. Numbered item 2\n\n')

    // Add code block
    await page.keyboard.insertText('```javascript\n')
    await page.keyboard.insertText('function test() {\n')
    await page.keyboard.insertText('  return "Hello world";\n')
    await page.keyboard.insertText('}\n')
    await page.keyboard.insertText('```\n\n')

    // Add table
    await page.keyboard.insertText('| Header 1 | Header 2 |\n')
    await page.keyboard.insertText('| --- | --- |\n')
    await page.keyboard.insertText('| Cell 1 | Cell 2 |\n')
    await page.keyboard.insertText('| Cell 3 | Cell 4 |\n\n')

    // Add blockquote
    await page.keyboard.insertText('> This is a blockquote\n')
    await page.keyboard.insertText('> It can span multiple lines\n\n')

    // Verify all elements are displayed correctly
    await page.waitForTimeout(1000)

    await expect(page.getByText('Heading 1')).toBeVisible()
    await expect(page.getByText('Heading 2')).toBeVisible()
    await expect(page.getByText('Heading 3')).toBeVisible()
    await expect(page.getByText('Bold text')).toBeVisible()
    await expect(page.getByText('Italic text')).toBeVisible()
    await expect(page.getByText('Strikethrough')).toBeVisible()
    await expect(page.getByText('- Item 1')).toBeVisible()
    await expect(page.getByText('Nested item')).toBeVisible()
    await expect(page.getByText('Numbered item 1')).toBeVisible()
    await expect(page.getByText('function test')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('th').getByText('Header 1')).toBeVisible()
    await expect(page.getByText('| Cell 3')).toBeVisible()
    await expect(page.getByText('This is a blockquote')).toBeVisible()
  })
})
