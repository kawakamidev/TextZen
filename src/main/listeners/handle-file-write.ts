import { join } from 'path'
import { store } from '../lib/store'
import { promises, readdirSync, statSync } from 'fs'
import { replaceLinks } from '../lib/replace-links'
import { cleanupWatchers, updateSaveTimestamp } from '../lib/file-watcher'

export const handleFileWrite = async (
  _: Electron.IpcMainInvokeEvent,
  filename: string,
  body: string,
  id: string
): Promise<boolean> => {
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

  const targetFile = files.find((f) => f.id === id)
  if (!targetFile) {
    return false
  }

  const newFilePath = join(dirPath, `${filename}.md`)
  const oldFilePath = join(dirPath, targetFile.filename)

  if (files.find((f) => f.id !== id && f.filename === `${filename}.md`)) {
    return false
  }

  updateSaveTimestamp()

  if (newFilePath !== oldFilePath) {
    await promises.rename(oldFilePath, newFilePath)
    if (store.get('edit.linkAutoUpdate')) {
      replaceLinks({
        dirPath,
        oldTitle: targetFile.filename.replace('.md', ''),
        newTitle: filename
      })
    }
  }

  cleanupWatchers()

  await promises.writeFile(newFilePath, body, 'utf-8')

  updateSaveTimestamp()

  return true
}
