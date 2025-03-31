import { store } from './store'

const initialize = (name: string, value): void => {
  if (store.get(name) === undefined) {
    store.set(name, value)
  }
}

export const initializeConfig = (): void => {
  initialize('view.sidebar.visible', true)
  initialize('view.sidebar.width', 200)
  initialize('view.theme', 'default')
  initialize('edit.linkAutoUpdate', true)
  
  // デフォルトのショートカットキー設定
  initialize('shortcuts', {
    // ファイル操作
    openDirectory: 'Cmd+O',
    newFile: 'Cmd+N',
    searchFile: 'Cmd+P',
    searchFullText: 'Cmd+Shift+F',
    backLinks: 'Cmd+Shift+B',
    
    // 表示
    toggleSidebar: 'Cmd+B',
    
    // フォーカス
    focusFileList: 'Cmd+0',
    focusEditor: 'Cmd+1'
  })
}
