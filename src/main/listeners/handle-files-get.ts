import { readdirSync, statSync } from 'fs'
import { store } from '../lib/store'
import { basename, extname, join } from 'path'
import { mainWindow } from '..'
import chokidar from 'chokidar'
import { FSWatcher } from 'vite'

export interface File {
  id: string
  title: string
}

if (globalThis.lastWriteTime === undefined) {
  globalThis.lastWriteTime = 0
}
if (globalThis.currentWatchedFile === undefined) {
  globalThis.currentWatchedFile = null
}

const cleanupExistingWatcher = (): void => {
  if (globalThis.chokidarWatcher) {
    globalThis.chokidarWatcher.close()
    globalThis.chokidarWatcher = null
  }
}

const setupDirectoryWatcher = (watcher: FSWatcher): void => {
  watcher.on('add', async (path) => {
    if (globalThis.lastWriteTime && Date.now() - globalThis.lastWriteTime < 50) {
      return
    }
    const filename = basename(path)
    if (filename && filename.endsWith('.md')) {
      mainWindow?.webContents.send('file-event:add')
    }
  })

  watcher.on('unlink', async (path) => {
    if (globalThis.lastWriteTime && Date.now() - globalThis.lastWriteTime < 50) {
      return
    }
    const filename = basename(path)
    const file = globalThis.files.find((item) => item.filename === filename)
    const newStats = statSync(path)
    const newId = `${newStats.dev}-${newStats.ino}`
    mainWindow?.webContents.send('file-event:change', file?.id, newId)
  })
}

export const handleFilesGet = async (): Promise<Array<File>> => {
  cleanupExistingWatcher()

  const dirPath = store.get('general.path') as string

  globalThis.chokidarWatcher = chokidar.watch(dirPath, {
    persistent: true,
    ignoreInitial: true,

    awaitWriteFinish: {
      pollInterval: 100
    },

    ignored: (path) => {
      if (!path.endsWith('.md')) return true

      const filename = basename(path)
      if (filename.startsWith('.')) return true

      if (path.includes('node_modules')) return true
      return false
    }
  })

  setupDirectoryWatcher(globalThis.chokidarWatcher)

  try {
    const allFiles = readdirSync(dirPath)
    const mdFilesOnly = allFiles.filter((f) => extname(f) === '.md')

    let files = mdFilesOnly.map((f) => {
      try {
        const stats = statSync(join(dirPath, f))
        return {
          id: `${stats.dev}-${stats.ino}`,
          filename: f,
          mtime: stats.mtime.getTime()
        }
      } catch (err) {
        console.warn(`Error accessing file ${f}:`, err)
        return null
      }
    })

    files = files.sort((a, b) => b!.mtime - a!.mtime)
    globalThis.files = files

    return files.map((f) => {
      return { id: f!.id, title: f!.filename.replace('.md', ''), mtime: f!.mtime }
    })
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}
