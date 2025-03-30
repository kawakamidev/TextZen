import { ElectronAPI } from '@electron-toolkit/preload'
import { File as FileType } from '@renderer/components/Page'

interface TextZen {
  api: API
  codemirror: {
    view
    state
    editor
    styles: Array<TagStyle>
  }
}

interface TextZenInternal {
  files: Array<FileType>
  config: {
    general: {
      path?: string
    }
    view: {
      theme?: string
      locale?: string
    }
  }
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
  navigateFile: (string) => Promise<void>
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
    isCompleting: boolean
    textZenInternal: TextZenInternal
  }
}
