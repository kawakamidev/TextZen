import { join } from 'path'
import { store } from '../lib/store'
import { promises, readdirSync, statSync } from 'fs'

export const handleBodyGet = async (
  _: Electron.IpcMainInvokeEvent,
  id: string
): Promise<string> => {
  const dirPath = store.get('general.path') as string
  const files = readdirSync(dirPath).map((f) => {
    const stats = statSync(dirPath + '/' + f)
    return {
      id: `${stats.dev}-${stats.ino}`,
      filename: f,
      mtime: stats.mtime.getTime()
    }
  })
  const filename = files.find((f) => f.id === id)!.filename!
  const fileContent = await promises.readFile(join(dirPath, filename), 'utf-8')
  return fileContent
}
