import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorContext } from '@renderer/contexts/editorContext'
import { highlights } from '@renderer/lib/highlights'
import { hyperLink } from '@renderer/lib/hyper-link-plugin'
import { markdownImagePlugin } from '@renderer/lib/markdown-image-plugin'
import { mermaidPlugin } from '@renderer/lib/mermaid-plugin'
import { tablePreviewPlugin } from '@renderer/lib/table-plugin'
import { mathFormulaPlugin } from '@renderer/lib/math-plugin'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { KeyboardEventHandler, useCallback, useContext, useEffect, useMemo } from 'react'
import * as thememirror from 'thememirror'
import { historyField } from '@codemirror/commands'
import { File as FileType } from './Page'

const stateFields = { history: historyField }

interface Props {
  value: string
  onChange: (value: string) => void
  onKeyDownCapture: KeyboardEventHandler<HTMLDivElement>
  file: FileType
}

window.EditContext = false

export default function BodyField({ value, onChange, onKeyDownCapture, file }: Props): JSX.Element {
  const { bodyEditor, isVisible } = useContext(EditorContext)
  const serializedState = localStorage.getItem(`editor-state/${file.id}`)

  const insertImage = useCallback(
    (name, pos): void => {
      const state = bodyEditor?.current?.state
      if (!state) {
        return
      }
      bodyEditor.current.view?.dispatch({
        changes: { from: pos, insert: `![](${name})` },
        selection: { anchor: pos + 2 }
      })
      bodyEditor.current.view?.focus()
    },
    [bodyEditor]
  )

  const handleFileDrop = (e): void => {
    e.preventDefault()

    const items = e.dataTransfer!.items!
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry()
      if (item && item.isFile) {
        new Promise<File>((resolve, reject) => {
          ;(item as FileSystemFileEntry).file(resolve, reject)
        }).then((file) => {
          window.api.copyFile(file).then(() => {
            const pos = bodyEditor?.current?.view?.posAtCoords({
              x: e.pageX,
              y: e.pageY
            })
            insertImage(item.name, pos)
          })
        })
      }
    }
  }

  const theme = useMemo(() => {
    if (
      window.matchMedia('(prefers-color-scheme: dark)').matches &&
      window.textZenInternal.config.view.theme === 'default'
    ) {
      return thememirror.dracula
    }
    if (
      window.matchMedia('(prefers-color-scheme: light)').matches &&
      window.textZenInternal.config.view.theme === 'default'
    ) {
      return thememirror.tomorrow
    }
    return thememirror[window.textZenInternal.config.view.theme!]
  }, [])

  useEffect(() => {
    window.textZen.codemirror.view = bodyEditor?.current?.view
    window.textZen.codemirror.state = bodyEditor?.current?.state
    window.textZen.codemirror.editor = bodyEditor?.current?.editor
  }, [bodyEditor])

  if (!isVisible) {
    return <></>
  }

  return (
    <CodeMirror
      value={value}
      extensions={[
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        hyperLink,
        EditorView.lineWrapping,
        markdownImagePlugin,
        ...highlights,
        EditorView.domEventHandlers({
          drop: handleFileDrop
        }),
        theme,
        mermaidPlugin,
        tablePreviewPlugin,
        mathFormulaPlugin
      ]}
      onChange={(value, viewUpdate) => {
        const state = viewUpdate.state.toJSON(stateFields)
        localStorage.setItem(`editor-state/${file.id}`, JSON.stringify(state))
        onChange(value)
      }}
      ref={bodyEditor}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false
      }}
      initialState={
        serializedState
          ? {
              json: JSON.parse(serializedState || ''),
              fields: stateFields
            }
          : undefined
      }
      onKeyDownCapture={onKeyDownCapture}
    />
  )
}
