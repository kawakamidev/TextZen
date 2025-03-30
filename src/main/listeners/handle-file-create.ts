import { join } from 'path'
import { store } from '../lib/store'
import { promises, statSync } from 'fs'
import { File } from './handle-files-get'

export const handleFileCreate = async (_, t: string, body: string): Promise<File> => {
  const dirPath = store.get('general.path') as string

  await promises.writeFile(join(dirPath, `${t}.md`), body || '', 'utf-8')
  const stats = statSync(join(dirPath, `${t}.md`))
  return { id: `${stats.dev}-${stats.ino}`, title: t }
}
