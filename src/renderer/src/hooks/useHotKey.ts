import { EditorContext } from '@renderer/contexts/editorContext'
import { FileListContext } from '@renderer/contexts/FIleListContext'
import { FocusContext } from '@renderer/contexts/FocusContext'
import { useContext, useEffect, useState } from 'react'

/**
 * キーイベントがショートカットと一致するかチェック
 * @param event KeyboardEvent
 * @param shortcut ショートカットキーの文字列 (例: 'Cmd+0')
 * @returns 一致すればtrue
 */
const matchesShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
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

export const useHotKey = (): void => {
  const { setFocus } = useContext(FocusContext)
  const { current, setCurrent } = useContext(FileListContext)
  const { bodyEditor, current: editorCurrent, setIsVisible } = useContext(EditorContext)
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({})

  // ショートカット設定を読み込む
  useEffect(() => {
    const loadShortcuts = async (): Promise<void> => {
      try {
        const allShortcuts = await window.api.getAllShortcuts()
        setShortcuts(allShortcuts)
      } catch (error) {
        console.error('Failed to load shortcuts:', error)
      }
    }
    
    loadShortcuts()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // ファイルリストにフォーカス
      if (matchesShortcut(e, shortcuts.focusFileList)) {
        setFocus('fileList')
        if (!current && editorCurrent) {
          setCurrent(editorCurrent)
          setIsVisible(false)
          setTimeout(() => setIsVisible(true), 1)
        }
      }
      
      // エディタにフォーカス
      if (matchesShortcut(e, shortcuts.focusEditor)) {
        setFocus('editor')
        bodyEditor?.current?.view?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [bodyEditor, current, editorCurrent, setCurrent, setFocus, setIsVisible, shortcuts])
}
