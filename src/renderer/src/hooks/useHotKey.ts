import { EditorContext } from '@renderer/contexts/editorContext'
import { FileListContext } from '@renderer/contexts/FIleListContext'
import { FocusContext } from '@renderer/contexts/FocusContext'
import { useContext, useEffect } from 'react'

export const useHotKey = (): void => {
  const { setFocus } = useContext(FocusContext)
  const { current, setCurrent } = useContext(FileListContext)
  const { bodyEditor, current: editorCurrent, setIsVisible } = useContext(EditorContext)

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.metaKey && e.key === '0') {
        setFocus('fileList')
        if (!current && editorCurrent) {
          setCurrent(editorCurrent)
          setIsVisible(false)
          setTimeout(() => setIsVisible(true), 1)
        }
      }
      if (e.metaKey && e.key === '1') {
        setFocus('editor')
        bodyEditor?.current?.view?.focus()
      }
    })
  }, [bodyEditor, current, editorCurrent, setCurrent, setFocus, setIsVisible])
}
