import { Menu, shell, clipboard } from 'electron'
import { join } from 'path'
import { store } from './store'
import { mainWindow } from '..'

export const createContextMenu = (intl, event, id, title): Electron.Menu => {
  return Menu.buildFromTemplate([
    {
      label: intl.formatMessage({ id: 'new' }),
      click: (): void => {
        mainWindow?.webContents.send('new')
      }
    },
    {
      label: intl.formatMessage({ id: 'duplicate' }),
      click: (): void => {
        event.sender.send('duplicate', title)
      }
    },
    {
      type: 'separator'
    },
    {
      label: intl.formatMessage({ id: 'openInDefaultApp' }),
      click: (): void => {
        const dirPath = store.get('general.path') as string
        shell.openPath(join(dirPath, `${title}.md`))
      }
    },
    {
      label: intl.formatMessage({ id: 'revealInFinder' }),
      click: (): void => {
        const dirPath = store.get('general.path') as string
        shell.showItemInFolder(join(dirPath, `${title}.md`))
      }
    },
    {
      type: 'separator'
    },
    {
      label: intl.formatMessage({ id: 'copyPath' }),
      click: (): void => {
        const dirPath = store.get('general.path') as string
        const fullPath = join(dirPath, `${title}.md`)
        clipboard.writeText(fullPath)
      }
    },
    {
      label: intl.formatMessage({ id: 'copyPrompt' }),
      click: (): void => {
        const dirPath = store.get('general.path') as string
        const fullPath = join(dirPath, `${title}.md`)
        const prompts = store.get('prompts') as { copyTemplate: string }
        const template = prompts.copyTemplate
        clipboard.writeText(template.replace('{path}', fullPath))
      }
    },
    {
      type: 'separator'
    },
    {
      label: intl.formatMessage({ id: 'delete' }),
      click: (): void => {
        event.sender.send('delete-file', id)
      }
    }
  ])
}
