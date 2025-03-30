import { join } from 'path'
import { replaceInFileSync } from 'replace-in-file'

export const replaceLinks = ({ dirPath, oldTitle, newTitle }): void => {
  replaceInFileSync({
    files: join(dirPath, '*.md'),
    from: new RegExp(`\\[\\[${oldTitle}\\]\\]`, 'g'),
    to: `[[${newTitle}]]`
  })
}
