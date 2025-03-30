import { execa } from 'execa'
import { rgPath as rg } from '@vscode/ripgrep'
import { basename, join } from 'path'

const rgPath = ['development', 'test'].includes(process.env.NODE_ENV as string)
  ? rg
  : join(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
      '@vscode',
      'ripgrep',
      'bin',
      'rg'
    )

type Line = {
  num: number
  text: string
}

export type SearchResult = {
  title: string
  lines: Array<Line>
}

type FileData = { filepath: string; title: string; lines: Array<Line> }

export const search = async (
  searchTerm: string,
  directory: string
): Promise<Array<SearchResult>> => {
  try {
    const command = `${rgPath} "${searchTerm}" --type md --vimgrep ${directory}/*.md`

    const { stdout } = await execa(command, { shell: true })

    const lines = stdout.split('\n')
    const results: Record<string, FileData> = {}

    lines.forEach((line) => {
      if (line.includes('--')) {
        return
      }

      const parts = line.split(':')
      if (parts.length < 4) {
        return
      }

      const [filepath, lineNum, , ...matchParts] = parts
      const matchText = matchParts.join(':').trim()

      if (!results[filepath]) {
        results[filepath] = {
          filepath,
          title: basename(filepath).replace('.md', ''),
          lines: []
        }
      }

      const text = matchText
        .trim()
        .replaceAll(new RegExp(searchTerm, 'g'), `<span class="highlight">${searchTerm}</span>`)

      if (!results[filepath].lines.find((line) => line.text === text)) {
        results[filepath].lines.push({
          num: Number(lineNum),
          text
        })
      }
    })

    return Object.values(results).map((file: FileData) => ({
      title: file.title,
      lines: file.lines
    }))
  } catch {
    return []
  }
}
