import { test as base, _electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import { copyFileSync, existsSync, rmSync, mkdirSync, readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import * as eph from 'electron-playwright-helpers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Define custom test fixture
type TestFixtures = {
  electronApp: ElectronApplication
  page: Page
  testId: string
}

/**
 * Custom test fixture that launches TextZen and sets up the testing environment
 */
export const test = base.extend<TestFixtures>({
  // Generate a unique test ID for each test
  // eslint-disable-next-line no-empty-pattern
  testId: async ({}, use) => {
    const testId = `test-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(testId)
  },

  electronApp: async ({ testId }, use) => {
    // Create unique paths for each test
    const testUserDataPath = join(__dirname, '..', 'test-user-data', testId)
    const testNotesPath = join(__dirname, '..', 'notes', testId)

    // Ensure directories exist
    if (!existsSync(testUserDataPath)) {
      mkdirSync(testUserDataPath, { recursive: true })
    }

    if (!existsSync(testNotesPath)) {
      mkdirSync(testNotesPath, { recursive: true })

      // Copy example files to the test-specific notes directory from source directory
      const sourceNotesPath = join(__dirname, '..', 'fixtures')
      const destinationPath = testNotesPath

      // Copy all files from source to destination
      if (existsSync(sourceNotesPath)) {
        const files = readdirSync(sourceNotesPath)

        for (const file of files) {
          const srcPath = join(sourceNotesPath, file)
          const destPath = join(destinationPath, file)
          // Skip .DS_Store files
          if (srcPath.endsWith('.DS_Store')) continue

          // Create directory if it's a directory
          const isDirectory = statSync(srcPath).isDirectory()
          if (isDirectory) {
            mkdirSync(destPath, { recursive: true })
            const subFiles = readdirSync(srcPath)
            for (const subFile of subFiles) {
              const subSrcPath = join(srcPath, subFile)
              const subDestPath = join(destPath, subFile)
              if (!subSrcPath.endsWith('.DS_Store')) {
                copyFileSync(subSrcPath, subDestPath)
              }
            }
          } else {
            copyFileSync(srcPath, destPath)
          }
        }
      }
    }

    // Launch the app
    const mainPath = join(__dirname, '..', '..', 'out', 'main')
    const electronApp = await _electron.launch({
      args: [mainPath, `--user-data-dir=${testUserDataPath}`],
      env: {
        DISABLE_UPDATE: 'true',
        NODE_ENV: 'test'
      }
    })

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(electronApp)
    await electronApp.close()

    // Clean up after test
    if (existsSync(testUserDataPath)) {
      rmSync(testUserDataPath, { recursive: true })
    }
    if (existsSync(testNotesPath)) {
      rmSync(testNotesPath, { recursive: true })
    }
  },

  page: async ({ electronApp, testId }, use) => {
    const testNotesPath = join(__dirname, '..', 'notes', testId)

    const page = await electronApp.firstWindow()
    await page.waitForLoadState('domcontentloaded')

    try {
      await eph.stubDialog(electronApp, 'showOpenDialog', { filePaths: [testNotesPath] })
      await page.getByText('Open Folder').click({ timeout: 5000 })
      await page.waitForTimeout(2000)
      await page.reload()
      await page.waitForLoadState('domcontentloaded')
    } catch (error) {
      console.error('Setup error:', error)
      // Try an alternative approach if the first one fails
      if (page) {
        await page.reload()
        await page.waitForLoadState('domcontentloaded')
        await eph.stubDialog(electronApp, 'showOpenDialog', { filePaths: [testNotesPath] })
        if (await page.getByText('Open Folder').isVisible()) {
          await page.getByText('Open Folder').click({ timeout: 5000 })
        }
      }
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page)
  }
})

export { expect } from '@playwright/test'
