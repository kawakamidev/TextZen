import { mainWindow } from '..'

export const handleFileNavigate = (_: Electron.IpcMainInvokeEvent, title: string): void => {
  mainWindow?.webContents.send('replace', title)
}
