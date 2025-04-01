import { app, BrowserWindow, ipcMain, net, protocol } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './lib/create-window'
import { handleDirOpen } from './listeners/handle-dir-open'
import { handleBodyGet } from './listeners/handle-body-get'
import { handleFileWrite } from './listeners/handle-file-write'
import { handleFileCreate } from './listeners/handle-file-create'
import { handleFileDelete } from './listeners/handle-file-delete'
import { store } from './lib/store'
import { normalize } from 'path'
import { handleFullTextSearch } from './listeners/handle-full-text-search'
import { initializeConfig } from './lib/initialize-config'
import { createContextMenu } from './lib/create-context-menu'
import { createIntl, createIntlCache } from '@formatjs/intl'
import { locale } from './lib/locale'
import { handleFilesGet } from './listeners/handle-files-get'
import { handleFileNavigate } from './listeners/handle-file-navigate'
import { handleJsGet } from './listeners/handle-js-get'
import { handleCssGet } from './listeners/handle-css-get'
import { handleFileCopy } from './listeners/handle-file-copy'
import { updateElectronApp } from 'update-electron-app'
import log from 'electron-log/main.js'
import { setupShortcutHandlers } from './listeners/handle-shortcuts'

let mainWindow: BrowserWindow

app.whenReady().then(async () => {
  if (process.env.DISABLE_UPDATE !== 'true') {
    updateElectronApp({
      logger: log
    })
  }

  if (!store.get('view.locale')) {
    if (app.getLocale() === 'ja') {
      store.set('view.locale', 'ja')
    } else {
      store.set('view.locale', 'en')
    }
  }

  const cache = createIntlCache()
  const intl = createIntl(
    {
      locale: store.get('view.locale') as string,
      messages: locale[store.get('view.locale') as string]
    },
    cache
  )

  protocol.handle('zen-file', (request: Request): Promise<GlobalResponse> => {
    const url = request.url.replace('zen-file://', 'file:///')

    return net.fetch(normalize(url))
  })

  electronApp.setAppUserModelId('com.electron')

  mainWindow = await createWindow(intl)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(intl)
    }
  })
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleCustomURL(url)
  })

  initializeConfig()

  ipcMain.on('show-context-menu', (event, id, title) => {
    const menu = createContextMenu(intl, event, id, title)
    menu.popup({ window: mainWindow! })
  })

  ipcMain.handle('dialog:openDir', handleDirOpen)
  ipcMain.handle('getFiles', () => handleFilesGet())
  ipcMain.handle('getBody', handleBodyGet)
  ipcMain.handle('writeFile', handleFileWrite)
  ipcMain.handle('createFile', handleFileCreate)
  ipcMain.handle('deleteFile', handleFileDelete)
  ipcMain.handle('getConfig', (_, key) => store.get(key))
  ipcMain.handle('setConfig', (_, key, value) => store.set(key, value))
  ipcMain.handle('navigateFile', handleFileNavigate)
  ipcMain.handle('getJs', handleJsGet)
  ipcMain.handle('getCss', handleCssGet)
  ipcMain.handle('copy-file', handleFileCopy)
  ipcMain.handle('searchFullText', handleFullTextSearch)
  
  // ショートカットキー関連のハンドラを設定
  setupShortcutHandlers()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

export const handleCustomURL = (url: string): void => {
  const parsedUrl = new URL(url)

  if (parsedUrl.host === 'open') {
    openFile(parsedUrl.searchParams.get('title'), parsedUrl.searchParams.get('body'))
  }
}

const openFile = (title, body): void => {
  mainWindow.webContents.send('open-file', title, body)
}

export { mainWindow }
