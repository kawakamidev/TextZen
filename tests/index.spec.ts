import { test, _electron, expect } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import { existsSync, readdirSync, rmSync } from 'fs'
import * as eph from 'electron-playwright-helpers'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let electronApp: ElectronApplication
let page: Page

test.beforeAll(async () => {
  const testUserDataPath = join(__dirname, 'test-user-data')
  const testNotesPath = join(__dirname, 'notes')

  if (existsSync(testUserDataPath)) {
    rmSync(testUserDataPath, { recursive: true })
  }

  if (existsSync(testNotesPath)) {
    const entries = readdirSync(testNotesPath)
    for (const entry of entries) {
      if (!['example2.md', 'example.md', '.text-zen', 'lena.png', 'mermaid.md'].includes(entry)) {
        rmSync(join(testNotesPath, entry), { recursive: true })
      }
    }
  }
  const mainPath = join(__dirname, '..', 'out', 'main')
  electronApp = await _electron.launch({
    args: [mainPath, `--user-data-dir=${testUserDataPath}`]
  })
  page = await electronApp.firstWindow()
  await eph.stubDialog(electronApp, 'showOpenDialog', { filePaths: [testNotesPath] })
  await page.getByText('フォルダを開く').click()
  await page.reload()
})

test.afterAll(async () => {
  await electronApp.close()
})

test('シナリオ', async () => {
  await page.locator('[aria-label="新規作成"]').click()
  await expect(page.getByRole('link', { name: 'Untitled', exact: true })).toBeVisible()
  await page.waitForTimeout(1000)
  await page.keyboard.insertText('New Title')
  await expect(page.getByRole('link', { name: 'New Title', exact: true })).toBeVisible()
  await page.locator('.cm-scroller').click()
  await page.keyboard.down('[')
  await page.keyboard.down('[')
  await page.waitForTimeout(1000)
  expect(page.locator('.cm-tooltip-autocomplete').first()).toBeVisible()
  await page.waitForTimeout(1000)
  await page.locator('#example').first().click()
  await expect(page.locator('a.cm-hyper-link-icon').first()).toBeVisible()
  await expect(page.locator('img[src="https://picsum.photos/200/300"]')).toBeVisible()
  await expect(page.locator('img[src$="lena.png"]')).toBeVisible()
  await page.getByText('example2').click()
  await page.waitForTimeout(1000)
  page.locator('a.cm-internal-link-icon').first().click()
  await expect(page.getByText('This is a test.')).toBeVisible()
  await expect(page.getByText('inserted')).toBeVisible()

  // TODO: Context menu
})

test('リンクを書き換えること', async () => {
  await page.locator('[aria-label="新規作成"]').click()
  await page.waitForTimeout(1000)
  await page.keyboard.insertText('参照先')
  await page.waitForTimeout(1000)

  await page.locator('[aria-label="新規作成"]').click()
  await page.waitForTimeout(1000)
  await page.keyboard.insertText('参照元')
  await page.locator('.cm-scroller').click()
  await page.keyboard.insertText('[[参照先]]')
  await page.waitForTimeout(1000)

  await page.getByRole('link', { name: '参照先', exact: true }).click()
  await page.locator('.tf').click()
  await page.keyboard.insertText('編集済み')
  await page.waitForTimeout(1000)

  await page.getByRole('link', { name: '参照元', exact: true }).click()
  await expect(page.getByText('[[参照先編集済み]]')).toBeVisible()
})

test('全文検索ができること', async () => {
  await page.locator('[aria-label="全文検索"]').click()
  await page.locator('input').focus()
  await page.keyboard.insertText('Example Image')
  await page.keyboard.press('Enter')
  await expect(page.locator('.fts-line')).toBeVisible()
})

test('ファイル検索ができること', async () => {
  await page.locator('[aria-label="ファイル検索"]').click()
  await page.locator('input').focus()
  await page.keyboard.insertText('Example')
  await expect(page.locator('.fs-i').first()).toBeVisible()
})

test('Mermaidを表示できること', async () => {
  await page.getByText('Mermaid').click()
  await expect(page.locator('svg')).toBeVisible()
})
