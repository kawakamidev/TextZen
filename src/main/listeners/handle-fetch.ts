import { mainWindow } from '..'

export const handleFetch = (_: Electron.IpcMainInvokeEvent, title: string): void => {
  mainWindow?.webContents.send('replace', title)
}
