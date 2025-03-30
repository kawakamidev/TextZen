import { is } from '@electron-toolkit/utils'
import { BrowserWindow, Menu, shell } from 'electron'
import { join } from 'path'
import { createMenu } from './create-menu'

export const createWindow = async (intl): Promise<BrowserWindow> => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    transparent: true,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: {
      x: 16,
      y: 16
    },
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false
    }
  })

  mainWindow.setBackgroundMaterial('acrylic')
  mainWindow.setVibrancy('under-window')

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const menu = await createMenu(intl)
  Menu.setApplicationMenu(menu)

  return mainWindow
}
