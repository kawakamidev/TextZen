import { ipcMain } from 'electron'
import { getAllShortcuts, getShortcut, setShortcut } from '../lib/shortcuts'

export const setupShortcutHandlers = (): void => {
  // 特定のショートカットキーを取得
  ipcMain.handle('getShortcut', async (_, key: string) => {
    return getShortcut(key)
  })

  // すべてのショートカットキーを取得
  ipcMain.handle('getAllShortcuts', async () => {
    return getAllShortcuts()
  })

  // ショートカットキーを設定
  ipcMain.handle('setShortcut', async (_, key: string, value: string) => {
    setShortcut(key, value)
    return true
  })
}
