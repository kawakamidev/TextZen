import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { File as FileType } from './file'
import { SearchResult } from '../main/lib/search'

const api = {
  openFile: (): Promise<void> => ipcRenderer.invoke('dialog:openDir'),
  getFiles: (): Promise<Array<FileType>> => ipcRenderer.invoke('getFiles'),
  getBody: (id: string): Promise<string> => ipcRenderer.invoke('getBody', id),
  writeFile: (title: string, body: string, id: string): Promise<boolean> =>
    ipcRenderer.invoke('writeFile', title, body, id),
  createFile: (title: string, body: string): Promise<FileType> =>
    ipcRenderer.invoke('createFile', title, body),
  deleteFile: (title): Promise<boolean> => ipcRenderer.invoke('deleteFile', title),
  getConfig: (key): Promise<string> => ipcRenderer.invoke('getConfig', key),
  setConfig: (key, value): Promise<string> => ipcRenderer.invoke('setConfig', key, value),
  fetch: (title): Promise<void> => ipcRenderer.invoke('fetch', title),
  getJs: (): Promise<Array<string>> => ipcRenderer.invoke('getJs'),
  getCss: (): Promise<Array<string>> => ipcRenderer.invoke('getCss'),
  copyFile: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (): Promise<void> => {
        const buffer = Buffer.from(reader.result as ArrayBuffer)
        const fileName = file.name
        const result = await ipcRenderer.invoke('copy-file', fileName, buffer)
        resolve(result)
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  },
  searchFullText: (query: string): Promise<Array<SearchResult>> =>
    ipcRenderer.invoke('searchFullText', query)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
