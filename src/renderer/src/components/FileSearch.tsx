import { NavLink } from 'react-router'
import { File } from './Page'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { EditorContext } from '@renderer/contexts/editorContext'
import { useIntl } from 'react-intl'
import scrollIntoView from 'scroll-into-view-if-needed'
import { FocusContext } from '@renderer/contexts/FocusContext'
import Fuse from 'fuse.js'

interface Props {
  files: Array<File>
}

export default function FileSearch({ files }: Props): JSX.Element {
  const searchField = useRef<HTMLInputElement>(null)
  const { focus, setFocus } = useContext(FocusContext)
  const { bodyEditor, setIsVisible: setIsEditorVisible } = useContext(EditorContext)
  const intl = useIntl()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<File>>(files)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    const handleClick = (e): void => {
      if (
        !(e.target as HTMLElement).closest('.fs') &&
        focus === 'fileSearch' &&
        !(e.target as HTMLElement).closest(
          `[aria-label="${intl.formatMessage({ id: 'searchFile' })}"]`
        )
      ) {
        setFocus('editor')
      }
    }
    window.addEventListener('click', handleClick)

    return (): void => {
      window.removeEventListener('click', handleClick)
    }
  }, [focus, intl, setFocus])

  const updateSelection = useCallback(
    (e): void => {
      if (focus !== 'fileSearch') {
        return
      }
      if (
        (e.key === 'ArrowDown' || (e.ctrlKey && e.key == 'n')) &&
        selectedIndex < results.length - 1
      ) {
        setSelectedIndex(selectedIndex + 1)
        const el = document.querySelector<HTMLElement>(`[data-index="${selectedIndex + 1}"]`)!
        scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
        e.preventDefault()
      }
      if ((e.key === 'ArrowUp' || (e.ctrlKey && e.key == 'p')) && selectedIndex > -1) {
        setSelectedIndex(selectedIndex - 1)
        const el = document.querySelector<HTMLElement>(`[data-index="${selectedIndex + 1}"]`)!
        scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
        e.preventDefault()
      }
      if ((e.key === 'ArrowUp' || (e.ctrlKey && e.key == 'p')) && selectedIndex === 0) {
        setSelectedIndex(selectedIndex - 1)
        searchField.current?.focus()
        e.preventDefault()
      }
      if (e.key === 'Enter' && !e.isComposing) {
        e.preventDefault()
        document.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`)?.click()
        setFocus('editor')
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setFocus('editor')
      }
    },
    [focus, selectedIndex, results.length, setFocus]
  )

  useEffect(() => {
    window.addEventListener('keydown', updateSelection)

    return (): void => {
      window.removeEventListener('keydown', updateSelection)
    }
  }, [bodyEditor, setFocus, setIsEditorVisible, updateSelection])

  const handleQueryChange = (e): void => {
    const q = e.target.value
    setQuery(q)
    if (q === '') {
      setResults(files)
      return
    }
    const fuse = new Fuse(files, { keys: ['title'], includeMatches: true })
    const res = fuse.search(q)
    setResults(res.map((res) => res.item))
  }

  if (focus !== 'fileSearch') {
    return <></>
  }

  return (
    <div className="fs-c">
      <div className="fs-f-w">
        <input
          value={query || ''}
          type="text"
          ref={searchField}
          placeholder={intl.formatMessage({ id: 'searchFilePlaceHolder' })}
          autoFocus
          onChange={handleQueryChange}
          className="fs-f"
        />
      </div>
      {results.length > 0 && (
        <div className="fs-l">
          {results.slice(0, 100).map((result, index) => (
            <div className="fs-i-w" key={result.title}>
              <NavLink
                to={`/files/${result.title}`}
                state={{ title: result.title, force: true }}
                replace
                data-index={index}
                id={result.title}
                className={`fs-i ${index === selectedIndex ? 'fs-i--active' : ''}`}
              >
                {result.title}
              </NavLink>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
