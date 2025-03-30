import { promises } from 'fs'
import { store } from '../lib/store'
import { join } from 'node:path'
import { readdirSync, statSync } from 'node:fs'

export const handleFileDelete = async (
  _: Electron.IpcMainInvokeEvent,
  id: string
): Promise<boolean> => {
  const dirPath = store.get('general.path') as string
  const files = readdirSync(dirPath).map((f) => {
    const stats = statSync(dirPath + '/' + f)
    return {
      id: `${stats.dev}-${stats.ino}`,
      filename: f,
      mtime: stats.mtime.getTime()
    }
  })
  const file = files.find((f) => f.id === id)
  const filePath = join(dirPath, file!.filename)

  try {
    await promises.unlink(filePath)
    return true
  } catch (error) {
    console.error(`Failed to delete file: ${error}`)
    return false
  }
}
