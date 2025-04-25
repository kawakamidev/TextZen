import BodyField from './BodyField'
import TitleField from './TitleField'
import { useContext, useEffect, useState } from 'react'
import { File } from './Page'
import { useDebouncedCallback } from 'use-debounce'
import { EditorContext } from '@renderer/contexts/editorContext'
import { FocusContext } from '@renderer/contexts/FocusContext'

interface Props {
  currentFile: File
  onTitleChange: (value: string) => void
  files: Array<File>
  setCurrentTitle: (value: string) => void
  currentTitle: string
  onBodyChange: (value: string) => void
}

export default function Editor({
  currentFile,
  onTitleChange,
  files,
  setCurrentTitle,
  currentTitle,
  onBodyChange
}: Props): JSX.Element {
  const [editorVisible, setEditorVisible] = useState(true)
  const [currentBody, setCurrentBody] = useState('')
  const { bodyEditor, titleEditor } = useContext(EditorContext)
  const { setFocus } = useContext(FocusContext)

  const writeFile = useDebouncedCallback(async (t, b, target) => {
    const result = window.api.writeFile(t, b, target)
    if (!result) {
      return
    }
  }, 500)

  useEffect(() => {
    window.electron.ipcRenderer.on('file-event:change', async (_, id, newId) => {
      if (id === currentFile.id) {
        const b = await window.api.getBody(newId)
        setCurrentBody(b)
      }
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('file-event:change')
    }
  }, [currentFile.id])

  const handleUpdate = (value: string): void => {
    if (files.find((f) => f !== currentFile && f.title === currentFile?.title)) {
      return
    }
    writeFile(currentTitle, value, currentFile.id)
    setCurrentBody(value)
    onBodyChange(value)
  }

  const handleTitleKeyDown = (e): void => {
    if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
      return
    }
    if (e.keyCode === 13) {
      e.preventDefault()
      bodyEditor?.current?.view?.focus()
      setCurrentBody(`\n${currentBody}`)
    }
    if (e.key === 'ArrowDown' || (e.ctrlKey && e.key == 'n')) {
      e.preventDefault()
      bodyEditor?.current?.view?.focus()
    }
  }

  const handleTitleChange = (value): void => {
    let title = value
    if (!title) {
      let counter = 0
      do {
        title = counter === 0 ? 'Untitled' : `Untitled${counter}`
        counter++
      } while (files.find((f) => f.title === title))
    }
    setCurrentTitle(value)

    writeFile(`${title}`, currentBody, currentFile.id)

    onTitleChange(value)
  }

  const handleBodyKeyDownCapture = (e: KeyboardEvent): void => {
    if (e.isComposing || e.key === 'Process' || e.keyCode === 229) {
      return
    }
    if (e.key === 'ArrowUp' || (e.ctrlKey && e.key == 'p')) {
      const view = bodyEditor?.current?.view
      if (!view) return

      const line = view.state.doc.lineAt(view.state.selection.main.head)

      if (line.number === 1) {
        e.preventDefault()
        titleEditor?.current?.focus()
        titleEditor?.current?.setSelectionRange(
          titleEditor?.current.value.length,
          titleEditor?.current.value.length
        )
      }
    }
  }

  // エディタの編集履歴をリセットする
  useEffect(() => {
    if (!currentFile) {
      return
    }
    window.api.getBody(currentFile.id).then(setCurrentBody)
    setEditorVisible(false)
    setTimeout(() => setEditorVisible(true), 1)
  }, [currentFile, setCurrentTitle])

  useEffect(() => {
    setCurrentTitle(currentFile.title)
  }, [currentFile.title, setCurrentTitle])

  return (
    <div className="editor" onClick={() => setFocus('editor')}>
      <TitleField
        value={currentTitle || ''}
        onChange={handleTitleChange}
        onKeyDown={handleTitleKeyDown}
      />
      {editorVisible && (
        <BodyField
          value={currentBody}
          onChange={handleUpdate}
          onKeyDownCapture={handleBodyKeyDownCapture as (keyboardEvent) => void}
        />
      )}
    </div>
  )
}
