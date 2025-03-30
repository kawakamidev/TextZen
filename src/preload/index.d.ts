import { ElectronAPI } from '@electron-toolkit/preload'
import { File as FileType } from '@renderer/components/Page'

interface TextZen {
  editorStyles: Array<TagStyle>
  files: Array<FileType>
  isCompleting: boolean
  path: string
  theme: string
}

interface API {
  openFile: () => Promise<void>
  getFiles: () => Promise<Array<FileType>>
  getBody: (string) => Promise<string>
  writeFile: (string, string, string) => Promise<boolean>
  createFile: (title?, body?) => Promise<FileType>
  deleteFile: (string) => Promise<boolean>
  getConfig: (string) => Promise<string>
  setConfig: (string, string) => Promise<void>
  fetch: (string) => Promise<void>
  getJs: () => Promise<Array<string>>
  getCss: () => Promise<Array<string>>
  copyFile: (File) => Promise<string>
  searchFullText: (string) => Promise<Array<SearchResult>>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    textZen: TextZen
    EditContext: boolean
  }
}
