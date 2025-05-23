import { readdirSync } from 'fs'
import { store } from '../lib/store'
import { join } from 'path'

export const handleJsGet = async (): Promise<Array<string>> => {
  try {
    const dirPath = store.get('general.path') as string
    return readdirSync(join(dirPath, '.text-zen'))
      .filter((file) => file.endsWith('.js'))
      .map((file) => `zen-file:///${join(dirPath, '.text-zen', file)}`)
  } catch {
    return []
  }
}
