import { HashRouter, Route, Routes } from 'react-router'
import Setup from './components/Setup'
import Page from './components/Page'
import { EditorContext } from './contexts/editorContext'
import { useRef, useState } from 'react'
import { IntlProvider } from 'react-intl'
import { locale } from './lib/locale'
import { FocusContext, FocusTarget } from './contexts/FocusContext'
import { FileListContext } from './contexts/FIleListContext'

export default function App(): JSX.Element {
  const titleEditor = useRef(null)
  const bodyEditor = useRef(null)
  const [isEditorVisible, setIsEditorVisible] = useState(true)
  const [focus, setFocus] = useState<FocusTarget>('fileList')
  const [currentListItem, setCurrentListItem] = useState<string | null>(null)
  const [current, setCurrent] = useState<string | null>(null)

  const toggleFocus = (value): void => {
    if (value === focus) {
      setFocus('editor')
    } else {
      setFocus(value)
    }
  }

  return (
    <IntlProvider
      messages={locale[window.textZenInternal.config.view.locale!]}
      locale={window.textZenInternal.config.view.locale!}
    >
      <EditorContext.Provider
        value={{
          titleEditor,
          bodyEditor,
          isVisible: isEditorVisible,
          setIsVisible: setIsEditorVisible,
          current,
          setCurrent
        }}
      >
        <FocusContext.Provider
          value={{
            focus,
            setFocus,
            toggleFocus
          }}
        >
          <FileListContext.Provider
            value={{ current: currentListItem, setCurrent: setCurrentListItem }}
          >
            <HashRouter>
              <Routes>
                <Route path="/" element={<Page />} />
                <Route path="/files/:id" element={<Page />} />
                <Route path="/setup" element={<Setup />} />
              </Routes>
            </HashRouter>
          </FileListContext.Provider>
        </FocusContext.Provider>
      </EditorContext.Provider>
    </IntlProvider>
  )
}
