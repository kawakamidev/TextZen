import { store } from './store'

/**
 * ショートカットキーの設定を取得
 * @param key ショートカットキーのID
 * @returns ショートカットキーの文字列 (例: 'Cmd+O')
 */
export const getShortcut = (key: string): string => {
  const shortcuts = store.get('shortcuts') as Record<string, string>
  return shortcuts?.[key] || ''
}

/**
 * ショートカットキーを設定
 * @param key ショートカットキーのID
 * @param value ショートカットキーの文字列 (例: 'Cmd+O')
 */
export const setShortcut = (key: string, value: string): void => {
  const shortcuts = store.get('shortcuts') as Record<string, string> || {}
  store.set('shortcuts', {
    ...shortcuts,
    [key]: value
  })
}

/**
 * ショートカットキーをElectronのAcceleratorに変換
 * @param shortcut ショートカットキーの文字列 (例: 'Cmd+O')
 * @returns Electronのacceleratorに対応したショートカットキー
 */
export const shortcutToAccelerator = (shortcut: string): string => {
  // macOSユーザーがCmdを入力した場合、ElectronのAccelerator形式に変換
  return shortcut
    .replace('Cmd', 'Command')
    .replace('Option', 'Alt')
    .replace('Ctrl', 'Control')
}

/**
 * キーイベントがショートカットと一致するかチェック
 * @param event KeyboardEvent
 * @param shortcut ショートカットキーの文字列 (例: 'Cmd+O')
 * @returns 一致すればtrue
 */
export const matchesShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
  if (!shortcut) return false
  
  const keys = shortcut.split('+')
  const modifiers = keys.slice(0, -1).map(key => key.toLowerCase())
  const mainKey = keys[keys.length - 1].toLowerCase()
  
  // モディファイアキーのチェック
  const hasCommand = modifiers.includes('cmd') || modifiers.includes('command')
  const hasShift = modifiers.includes('shift')
  const hasAlt = modifiers.includes('alt') || modifiers.includes('option')
  const hasCtrl = modifiers.includes('ctrl') || modifiers.includes('control')
  
  // イベントのモディファイアキーが一致するかチェック
  if (hasCommand !== event.metaKey) return false
  if (hasShift !== event.shiftKey) return false
  if (hasAlt !== event.altKey) return false
  if (hasCtrl !== event.ctrlKey) return false
  
  // メインキーのチェック
  return event.key.toLowerCase() === mainKey
}

/**
 * すべてのショートカットを取得
 * @returns ショートカットキーの設定オブジェクト
 */
export const getAllShortcuts = (): Record<string, string> => {
  return store.get('shortcuts') as Record<string, string> || {}
}
