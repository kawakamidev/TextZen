import { mainWindow } from '..'

export const handleSearchFile = async (): Promise<void> => {
  mainWindow?.webContents.send('search-file')
}
