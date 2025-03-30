import { readdirSync, statSync } from 'fs'
import { store } from '../lib/store'
import { basename, extname, join } from 'path'
import { mainWindow } from '..'
import chokidar from 'chokidar'

export interface File {
  id: string
  title: string
}

globalThis.lastWriteTime = 0

export const handleFilesGet = async (): Promise<Array<File>> => {
  globalThis.chokidarWatcher = chokidar.watch(store.get('general.path') as string, {
    persistent: true, // アクティブでないときも検知
    ignoreInitial: true // 初期検出を無視
  })

  if (!globalThis) {
    globalThis.chokidarWatcher.on('change', async (path) => {
      if (globalThis.lastWriteTime && Date.now() - globalThis.lastWriteTime < 100) {
        return
      }
      const filename = basename(path)
      if (filename && filename.match('.md')) {
        try {
          const file = globalThis.files.find((title) => title.filename === filename)
          const newStats = statSync(join(dirPath, filename))
          const newId = `${newStats.dev}-${newStats.ino}`
          mainWindow?.webContents.send('file-event:change', file?.id, newId)
        } catch (e) {
          console.warn(e)
        }
      }
    })

    globalThis.chokidarWatcher.on('add', async () => {
      if (globalThis.lastWriteTime && Date.now() - globalThis.lastWriteTime < 100) {
        return
      }
      mainWindow?.webContents.send('file-event:add')
    })
  }

  const dirPath = store.get('general.path') as string
  let files = readdirSync(dirPath).map((f) => {
    const stats = statSync(dirPath + '/' + f)
    return {
      id: `${stats.dev}-${stats.ino}`,
      filename: f,
      mtime: stats.mtime.getTime()
    }
  })
  files = files.sort((a, b) => b.mtime - a.mtime)
  const markdownFiles = files.filter((f) => extname(f.filename) === '.md')
  globalThis.files = files

  return markdownFiles.map((f) => {
    return { id: f.id, title: f.filename.replace('.md', ''), mtime: f.mtime }
  })
}
