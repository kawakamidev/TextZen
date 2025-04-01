import { join } from 'path'
import { store } from '../lib/store'
import { promises, readdirSync, statSync } from 'fs'
import { watchFile } from '../lib/file-watcher'

export const handleBodyGet = async (
  _: Electron.IpcMainInvokeEvent,
  id: string
): Promise<string> => {
  const dirPath = store.get('general.path') as string
  const files = readdirSync(dirPath)
    .map((f) => {
      const stats = statSync(dirPath + '/' + f)
      return {
        id: `${stats.dev}-${stats.ino}`,
        filename: f,
        mtime: stats.mtime.getTime()
      }
    })
    .filter(Boolean) as Array<{ id: string; filename: string; mtime: number }>

  const fileInfo = files.find((f) => f.id === id)

  if (!fileInfo) {
    return ''
  }

  const filename = fileInfo.filename
  const filePath = join(dirPath, filename)

  await watchFile(filePath, id)

  const fileContent = await promises.readFile(filePath, 'utf-8')
  return fileContent
}
