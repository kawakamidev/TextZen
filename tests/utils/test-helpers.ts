import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { existsSync, rmSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Cleans up the test directory before tests
 */
export function cleanupTestDirectory(testId: string): void {
  const testUserDataPath = join(__dirname, '..', 'test-user-data', testId)
  const testNotesPath = join(__dirname, '..', 'notes', testId)

  if (existsSync(testUserDataPath)) {
    rmSync(testUserDataPath, { recursive: true })
  }
  if (existsSync(testNotesPath)) {
    rmSync(testNotesPath, { recursive: true })
  }

  // Create the directories if they don't exist
  if (!existsSync(testUserDataPath)) {
    mkdirSync(testUserDataPath, { recursive: true })
  }
  if (!existsSync(testNotesPath)) {
    mkdirSync(testNotesPath, { recursive: true })
  }
}

/**
 * Creates a new note with the given title and content
 */
export async function createNewNote(page: Page, title: string, content: string): Promise<void> {
  await page.locator('[aria-label="New"]').click()
  await page.waitForTimeout(500)

  // Set title
  await page.keyboard.insertText(title)
  await page.waitForTimeout(300)
  await expect(page.getByRole('link', { name: title, exact: true })).toBeVisible()

  // Add content
  await page.locator('.cm-scroller').click()
  await page.keyboard.insertText(content)
  await page.waitForTimeout(500)
}

/**
 * Navigates to a note by title
 */
export async function navigateToNote(page: Page, title: string): Promise<void> {
  await page.getByRole('link', { name: title, exact: true }).click()
  await page.waitForTimeout(500)

  // Get the title field value and verify it
  const titleValue = await page.locator('.tf').inputValue()
  expect(titleValue).toBe(title)
}

/**
 * Opens the file search dialog and performs a search
 */
export async function searchForFile(page: Page, searchTerm: string): Promise<void> {
  await page.locator('[aria-label="Search File"]').click()
  await page.waitForTimeout(300)
  await page.locator('input').focus()
  await page.keyboard.insertText(searchTerm)
  await page.waitForTimeout(500)
}

/**
 * Opens the full text search dialog and performs a search
 */
export async function searchFullText(page: Page, searchTerm: string): Promise<void> {
  await page.locator('[aria-label="Full Text Search"]').click()
  await page.waitForTimeout(300)
  await page.locator('input').focus()
  await page.keyboard.insertText(searchTerm)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(1000)
}

/**
 * Creates an internal link to another note
 */
export async function createInternalLink(page: Page, targetNoteTitle: string): Promise<void> {
  await page.keyboard.type('[[')
  await page.waitForTimeout(1000)

  // Wait for the autocomplete to appear
  await expect(page.locator('.cm-tooltip-autocomplete')).toBeVisible()

  // Find the target note in the autocomplete and click it
  await page.locator('.cm-tooltip').getByText(targetNoteTitle).first().click()
  await page.waitForTimeout(500)

  // Verify the link was created
  await expect(page.locator('a.cm-internal-link-icon').first()).toBeVisible()
}
