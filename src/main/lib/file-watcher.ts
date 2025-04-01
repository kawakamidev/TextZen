import { promises, statSync, watch } from 'fs'
import chokidar from 'chokidar'
import { mainWindow } from '..'

const FILE_POLL_INTERVAL = 1000
const FILE_CHANGE_THRESHOLD = 500

interface FileWatchState {
  content: string
  mtime: number
  id: string
  path: string
}

let currentWatchState: FileWatchState | null = null

export const checkFileChanges = async (filePath: string, fileId: string): Promise<void> => {
  const stats = statSync(filePath)
  const currentMTime = stats.mtimeMs

  if (!currentWatchState || currentMTime === currentWatchState.mtime) {
    return
  }

  const lastWriteTime = globalThis.lastWriteTime || 0
  const timeSinceLastWrite = Date.now() - lastWriteTime

  if (lastWriteTime && timeSinceLastWrite < FILE_CHANGE_THRESHOLD) {
    return
  }

  currentWatchState.mtime = currentMTime
  const content = await promises.readFile(filePath, 'utf-8')

  if (content === currentWatchState.content) {
    return
  }

  currentWatchState.content = content

  const newId = `${stats.dev}-${stats.ino}`
  mainWindow?.webContents.send('file-event:change', fileId, newId)
}

/**
 * ファイル監視を開始する関数
 * @param filePath 監視対象ファイルパス
 * @param fileId ファイルID
 */
export const watchFile = async (filePath: string, fileId: string): Promise<void> => {
  if ((globalThis.currentWatchedFile as string | null) === filePath) {
    return
  }

  cleanupWatchers()
  ;(globalThis.currentWatchedFile as string | null) = filePath

  const content = await promises.readFile(filePath, 'utf-8')
  const stats = statSync(filePath)

  currentWatchState = {
    content,
    mtime: stats.mtimeMs,
    id: fileId,
    path: filePath
  }

  setupChokidarWatcher(filePath, fileId)

  setupNativeWatcher(filePath, fileId)

  setupPollingWatcher(filePath, fileId)
}

const setupChokidarWatcher = (filePath: string, fileId: string): void => {
  globalThis.currentFileWatcher = chokidar.watch(filePath, {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 100,
    binaryInterval: 300,
    alwaysStat: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 100
    }
  })

  globalThis.currentFileWatcher.on('add', async (path) => {
    checkFileChanges(path, fileId)
  })

  globalThis.currentFileWatcher.on('change', async (path) => {
    checkFileChanges(path, fileId)
  })
}

const setupNativeWatcher = (filePath: string, fileId: string): void => {
  watch(filePath, () => {
    checkFileChanges(filePath, fileId)
  })
}

const setupPollingWatcher = (filePath: string, fileId: string): void => {
  globalThis.filePollingTimer = setInterval(() => {
    checkFileChanges(filePath, fileId)
  }, FILE_POLL_INTERVAL)
}

export const cleanupWatchers = (): void => {
  if (globalThis.currentFileWatcher) {
    globalThis.currentFileWatcher.close()
    globalThis.currentFileWatcher = null
  }

  if (globalThis.filePollingTimer) {
    clearInterval(globalThis.filePollingTimer)
    globalThis.filePollingTimer = null
  }

  globalThis.currentWatchedFile = null

  currentWatchState = null
}

export const updateSaveTimestamp = (): void => {
  const now = Date.now()
  globalThis.lastWriteTime = now
}
