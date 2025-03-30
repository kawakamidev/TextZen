import { useCallback, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import Sidebar from './Sidebar'
import Header from './Header'
import Editor from './Editor'
import { FormattedMessage } from 'react-intl'
import { FullTextSearch } from './FullTextSearch'
import { EditorContext } from '@renderer/contexts/editorContext'
import { FocusContext } from '@renderer/contexts/FocusContext'
import FileSearch from './FileSearch'

export interface File {
  id: string
  title: string
  mtime: number
}

export default function Page(): JSX.Element {
  const location = useLocation()
  const [files, setFiles] = useState<Array<File>>([])
  const [allFiles, setAllFiles] = useState<Array<File>>([])
  const navigate = useNavigate()
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const { titleEditor, bodyEditor, current, setCurrent } = useContext(EditorContext)
  const { focus, setFocus, toggleFocus } = useContext(FocusContext)

  useEffect(() => {
    if (location.state?.line) {
      setTimeout(() => {
        const linePos = bodyEditor?.current?.view?.state.doc.line(location.state.line)
        if (linePos) {
          bodyEditor?.current?.view?.focus()
          bodyEditor?.current?.view?.dispatch({
            selection: { anchor: linePos.from, head: linePos.from },
            scrollIntoView: true
          })
        }
      }, 50)
    }
  }, [bodyEditor, location])

  useEffect(() => {
    window.electron.ipcRenderer.on('toggle-search-full-text', () => {
      toggleFocus('fullTextSearch')
      document.querySelector('article')!.scrollTo(0, 0)
    })
  }, [focus, setFocus, toggleFocus])

  useEffect(() => {
    window.api.getConfig('view.sidebar.visible').then((value) => {
      setIsSidebarVisible(Boolean(value))
    })
    window.electron.ipcRenderer.on('toggle-sidebar', async () => {
      const value = await window.api.getConfig('view.sidebar.visible')
      setIsSidebarVisible(Boolean(value))
    })
  }, [])

  const handleCreate = useCallback(
    async (t: string | null = null, body: string | null = null): Promise<void> => {
      let title: string | null = t
      let counter = 0
      if (!t) {
        do {
          title = counter === 0 ? 'Untitled' : `Untitled${counter}`
          counter++
        } while (files.map((f) => f.title).includes(title))
      }
      const result = await window.api.createFile(title, body)
      setFiles([result, ...files])
      setAllFiles([result, ...files])
      await navigate(`/files/${result.title}`, {
        replace: true,
        state: { title: result.title }
      })
      setTimeout(() => titleEditor?.current?.select(), 50)
      setFocus('editor')
    },
    [files, navigate, setFocus, titleEditor]
  )

  useEffect(() => {
    const file = location.state
      ? allFiles.find((f) => {
          return f.title === location.state.title
        }) || null
      : null
    if (allFiles.length > 0 && !file && location.pathname.match('notes') && !isDeleted) {
      handleCreate(location.state.title)
      return
    }
    setCurrent(file?.id || null)
    setCurrentFile(file)
    if (file?.id !== current) {
      setCurrentTitle(file?.title || null)
    }
  }, [location.state, allFiles, handleCreate, location.pathname, isDeleted, current, setCurrent])

  useEffect(() => {
    setIsDeleted(false)
  }, [location])

  const init = useCallback(async (): Promise<void> => {
    window.api
      .getFiles()
      .then(async (fs) => {
        setFiles(fs)
        setAllFiles(fs)
        window.textZen.files = fs
      })
      .catch(() => {
        navigate('/setup', { replace: true })
      })
  }, [navigate])

  useEffect(() => {
    window.electron.ipcRenderer.on('file-event:add', async () => {
      init()
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('file-event:add')
    }
  }, [init])

  useEffect(() => {
    window.electron.ipcRenderer.on('delete-file', async (_, id) => {
      const result = await window.api.deleteFile(id)
      if (result) {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))
        setAllFiles((prevFiles) => prevFiles.filter((file) => file.id !== id))
        if (id === current) {
          setCurrentFile(null)
          setCurrent(null)
          setIsDeleted(true)
          return
        }
      }
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('delete-file')
    }
  }, [current, currentFile, navigate, setCurrent])

  useEffect(() => {
    window.electron.ipcRenderer.on('replace', async (_, title) => {
      navigate(`/files/${title}`, {
        replace: true,
        state: { title }
      })
    })
  }, [location.state, navigate])

  useEffect(() => {
    init()

    window.electron.ipcRenderer.on('open-directory', init)

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('open-dir')
    }
  }, [init])

  useEffect(() => {
    window.electron.ipcRenderer.on('search-file', () => {
      toggleFocus('fileSearch')
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('search-file')
    }
  }, [focus, setFocus, toggleFocus])

  useEffect(() => {
    window.electron.ipcRenderer.on('open-file', (_, title, body) => {
      if (files.map((file) => file.title).includes(title)) {
        navigate(`/files/${title}`, { state: { title } })
      } else {
        handleCreate(title, body)
      }
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('open-file')
    }
  }, [files, focus, handleCreate, navigate, setFocus, toggleFocus])

  useEffect(() => {
    window.electron.ipcRenderer.on('new', () => {
      handleCreate()
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('new')
    }
  }, [files, handleCreate])

  useEffect(() => {
    window.electron.ipcRenderer.on('duplicate', (_, title) => {
      handleCreate(`${title}のコピー`)
    })

    return (): void => {
      window.electron.ipcRenderer.removeAllListeners('new')
    }
  }, [files, handleCreate])

  const handleTitleChange = (title): void => {
    if (!currentFile) {
      return
    }
    const f = files.find((f) => f.id === currentFile.id)!
    setFiles([{ ...f, title }, ...files.filter((f) => f.id !== currentFile.id)])
  }

  const handleBodyChange = (): void => {
    if (!currentFile) {
      return
    }
    const f = files.find((f) => f.id === currentFile.id)!
    setFiles([f, ...files.filter((f) => f.id !== currentFile.id)])
  }

  useEffect(() => {
    if (location.state?.force) {
      setFocus('editor')
      setTimeout(() => {
        bodyEditor?.current?.view?.focus()
      }, 100)
    }
  }, [bodyEditor, location, setFocus])

  return (
    <>
      <main>
        <Sidebar files={files} isVisible={isSidebarVisible} />
        <article>
          <Header
            isSidebarVisible={isSidebarVisible}
            title={focus !== 'fullTextSearch' ? currentTitle || '' : ''}
            onCreate={() => handleCreate()}
          />
          <FileSearch files={files}></FileSearch>
          <FullTextSearch currentTitle={currentTitle}></FullTextSearch>
          {focus !== 'fullTextSearch' && (
            <>
              {currentFile ? (
                <Editor
                  currentFile={currentFile}
                  currentTitle={currentTitle || ''}
                  setCurrentTitle={setCurrentTitle}
                  files={allFiles}
                  onTitleChange={handleTitleChange}
                  onBodyChange={handleBodyChange}
                />
              ) : (
                <div className="ep">
                  <div className="container">
                    <button type="button" onClick={() => handleCreate()} className="t-button">
                      <FormattedMessage id="add" />
                    </button>
                    <div className="shortcut">
                      <div className="keyboard">⌘</div>
                      <div className="keyboard">N</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </article>
      </main>
    </>
  )
}
