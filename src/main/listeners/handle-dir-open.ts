import { dialog } from 'electron'
import { store } from '../lib/store'
import { mainWindow } from '..'

export const handleDirOpen = async (): Promise<void> => {
  const selection = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  const dirPath = selection.filePaths[0]
  store.set('general.path', dirPath)
  mainWindow?.webContents.send('open-directory')
}
