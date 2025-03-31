import { test, expect } from './shared/setup'

test.describe('高度な検索機能', () => {
  test('複雑な検索条件でのファイル検索ができること', async ({ page }) => {
    // Create files with specific names for testing
    await page.locator('[aria-label="New"]').click()
    await page.waitForTimeout(1000)
    await page.keyboard.insertText('Test Document A')
    await page.waitForTimeout(1000)

    await page.locator('[aria-label="New"]').click()
    await page.waitForTimeout(1000)
    await page.keyboard.insertText('Test Document B')
    await page.waitForTimeout(1000)

    await page.locator('[aria-label="New"]').click()
    await page.waitForTimeout(1000)
    await page.keyboard.insertText('Another Document')
    await page.waitForTimeout(1000)

    // Test search with specific term
    await page.locator('[aria-label="Search File"]').click()
    await page.locator('input').focus()
    await page.keyboard.insertText('Test Document')
    await page.waitForTimeout(1000)

    // Verify search results - should find two documents
    await expect(page.locator('.fs-c').getByText('Test Document A')).toBeVisible()
    await expect(page.locator('.fs-c').getByText('Test Document B')).toBeVisible()

    // Clear search and try another term
    await page.locator('input').clear()
    await page.keyboard.press('Escape')
    await page.locator('[aria-label="Search File"]').click()
    await page.locator('input').focus()
    await page.keyboard.insertText('Another')
    await page.waitForTimeout(1000)

    // Verify search results - should find one document
    await expect(page.locator('.fs-c').getByText('Another Document')).toBeVisible()

    // Navigate to a document from search results
    await page.locator('.fs-c').getByText('Another Document').click()
    await page.waitForTimeout(1000)
    expect(await page.locator('.tf').inputValue()).toBe('Another Document')
  })

  test('全文検索で正確に検索できること', async ({ page }) => {
    // Create a file with specific content for testing
    await page.locator('[aria-label="New"]').click()
    await page.waitForTimeout(1000)
    await page.keyboard.insertText('Search Content Test')
    await page.locator('.cm-scroller').click()
    await page.keyboard.insertText('This document contains a unique search phrase.\n\n')
    await page.keyboard.insertText('Here is some normal content.\n\n')
    await page.keyboard.insertText('Another paragraph with the unique search phrase again.\n\n')
    await page.keyboard.insertText('Final paragraph without the phrase.')
    await page.waitForTimeout(1000)

    // Perform full text search
    await page.locator('[aria-label="Full Text Search"]').click()
    await page.locator('input').focus()
    await page.keyboard.insertText('unique search phrase')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1000)

    // Check results
    const resultCount = await page.locator('.fts-line').count()
    expect(resultCount).toBeGreaterThanOrEqual(2)

    // Click on a result to navigate
    await page.locator('.fts-line').first().click()
    await page.waitForTimeout(1000)

    // Verify navigation
    expect(await page.locator('.tf').inputValue()).toBe('Search Content Test')
  })
})
