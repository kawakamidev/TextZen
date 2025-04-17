import { existsSync } from 'node:fs'
import { mainWindow } from '..'
import { handleFileCreate } from './handle-file-create'
import { store } from '../lib/store'
import { join } from 'node:path'

export const handleFileNavigate = async (_: Electron.IpcMainInvokeEvent, title: string): void => {
  const dirPath = store.get('general.path') as string
  if (!existsSync(join(dirPath, `${title}.md`))) {
    await handleFileCreate(null, title, '')
  }
  mainWindow?.webContents.send('replace', title)
}
