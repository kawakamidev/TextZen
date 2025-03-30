import { Menu, shell } from 'electron'
import { handleDirOpen } from './listeners/handle-dir-open'
import { handleSearchFile } from './listeners/handle-search'
import { mainWindow } from '.'
import { store } from './lib/store'
import { intl } from './lib/intl'

const template = [
  {
    label: intl.formatMessage({ id: 'app' }),
    submenu: [
      { role: 'about', label: intl.formatMessage({ id: 'about' }) },
      { type: 'separator' },
      {
        label: intl.formatMessage({ id: 'setting' }),
        click: (): void => {
          shell.openPath(store.path)
        }
      },
      { type: 'separator' },
      { role: 'services', label: intl.formatMessage({ id: 'services' }) },
      { type: 'separator' },
      { role: 'hide', label: intl.formatMessage({ id: 'hide' }) },
      { role: 'hideOthers', label: intl.formatMessage({ id: 'hideOthers' }) },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit', label: intl.formatMessage({ id: 'quit' }) }
    ]
  },
  {
    label: intl.formatMessage({ id: 'file' }),
    submenu: [
      { click: handleDirOpen, label: intl.formatMessage({ id: 'openDir' }), accelerator: 'Cmd+O' },
      {
        click: (): void => {
          mainWindow?.webContents.send('new')
        },
        label: intl.formatMessage({ id: 'new' }),
        accelerator: 'Cmd+N'
      },
      { type: 'separator' },
      {
        click: handleSearchFile,
        label: intl.formatMessage({ id: 'search' }),
        accelerator: 'Cmd+P'
      },
      {
        id: 'toggle-search-full-text',
        click: (): void => mainWindow?.webContents.send('toggle-search-full-text'),
        label: intl.formatMessage({ id: 'searchFullText' }),
        accelerator: 'Cmd+Shift+F'
      },
      {
        id: 'back-link',
        click: (): void => mainWindow?.webContents.send('back-link'),
        label: intl.formatMessage({ id: 'backLink' }),
        accelerator: 'Cmd+Shift+G'
      },
      { type: 'separator' },
      { role: 'close', label: intl.formatMessage({ id: 'close' }) }
    ]
  },
  {
    label: intl.formatMessage({ id: 'edit' }),
    submenu: [
      { role: 'cut', label: intl.formatMessage({ id: 'cut' }) },
      { role: 'copy', label: intl.formatMessage({ id: 'copy' }) },
      { role: 'paste', label: intl.formatMessage({ id: 'paste' }) },
      { role: 'pasteAndMatchStyle', label: intl.formatMessage({ id: 'pasteAndMatchStyle' }) },
      { role: 'delete', label: intl.formatMessage({ id: 'delete' }) },
      { role: 'selectAll', label: intl.formatMessage({ id: 'selectAll' }) },
      { type: 'separator' },
      {
        label: intl.formatMessage({ id: 'speak' }),
        submenu: [
          { role: 'startSpeaking', label: intl.formatMessage({ id: 'startSpeaking' }) },
          { role: 'stopSpeaking', label: intl.formatMessage({ id: 'stopSpeaking' }) }
        ]
      }
    ]
  },
  {
    label: intl.formatMessage({ id: 'view' }),
    submenu: [
      {
        click: (): void => {
          store.set('view.sidebar.visible', !store.get('view.sidebar.visible'))
          mainWindow?.webContents.send('toggle-sidebar', store.get('view.sidebar.visible'))
        },
        label: intl.formatMessage({ id: 'sidebar' }),
        accelerator: 'Cmd+B',
        checked: await store.get('view.sidebar.visible')
      },
      { type: 'separator' },
      { role: 'zoomIn', label: intl.formatMessage({ id: 'zoomIn' }) },
      { role: 'zoomOut', label: intl.formatMessage({ id: 'zoomOut' }) },
      { role: 'resetZoom', label: intl.formatMessage({ id: 'resetZoom' }) },
      { type: 'separator' },
      { role: 'toggleDevTools', label: intl.formatMessage({ id: 'toggleDevTools' }) },
      { type: 'separator' },
      { role: 'togglefullscreen', label: intl.formatMessage({ id: 'togglefullscreen' }) }
    ]
  },
  {
    label: intl.formatMessage({ id: 'window' }),
    submenu: [
      { role: 'minimize', label: intl.formatMessage({ id: 'minimize' }) },
      { role: 'zoom', label: intl.formatMessage({ id: 'zoom' }) },
      { type: 'separator' },
      { role: 'front', label: intl.formatMessage({ id: 'front' }) }
    ]
  },
  {
    label: intl.formatMessage({ id: 'help' }),
    submenu: [
      {
        label: intl.formatMessage({ id: 'github' }),
        click: (): void => {
          shell.openExternal('https://github.com/moekiorg/text-zen')
        }
      }
    ]
  }
] as Array<Electron.MenuItemConstructorOptions | Electron.MenuItem>

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

export { menu }
