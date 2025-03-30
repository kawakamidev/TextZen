import { NavLink } from 'react-router'
import { File } from './Page'
import { MouseEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { EditorContext } from '@renderer/contexts/editorContext'
import interact from 'interactjs'
import scrollIntoView from 'scroll-into-view-if-needed'
import { FocusContext } from '@renderer/contexts/FocusContext'
import { useHotKey } from '@renderer/hooks/useHotKey'
import { FileListContext } from '@renderer/contexts/FIleListContext'

interface Props {
  files: Array<File>
  isVisible: boolean
}

const FileItem = ({
  title,
  isActive,
  isSelected,
  style,
  id,
  nextId,
  previousId,
  onClick
}: {
  title: string
  isActive: boolean
  style: React.CSSProperties | undefined
  isSelected: boolean
  id: string
  nextId: string | null
  previousId: string | null
  onClick: () => void
}): JSX.Element => {
  const handleContextMenu = (
    e: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    id: string
  ): void => {
    e.preventDefault()
    window.electron.ipcRenderer.send('show-context-menu', id, title)
  }

  return (
    <div style={style} className="px-2">
      <NavLink
        key={title}
        to={`/files/${title}`}
        state={{ title }}
        replace
        id={title}
        data-id={id}
        data-next={nextId}
        data-previous={previousId}
        className={`fi ${isActive || isSelected ? 'fi--active' : ''}`}
        onContextMenu={(e) => handleContextMenu(e, id)}
        onClick={onClick}
      >
        {title}
      </NavLink>
    </div>
  )
}

export default function Sidebar({ files, isVisible }: Props): JSX.Element {
  const [listHeight, setListHeight] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const searchField = useRef<HTMLInputElement>(null)
  const { current: currentListItem, setCurrent: setCurrentListItem } = useContext(FileListContext)
  const { focus, setFocus } = useContext(FocusContext)
  const { bodyEditor, setIsVisible: setIsEditorVisible, current } = useContext(EditorContext)
  const [width, setWidth] = useState(300)
  useHotKey()

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'n' && e.metaKey) {
        setFocus('editor')
      }
    })
  })

  useEffect(() => {
    window.api.getConfig('view.sidebar.width').then((value) => {
      setWidth(Number(value))
    })
    window.electron.ipcRenderer.on('toggle-sidebar', async () => {
      const value = await window.api.getConfig('view.sidebar.width')
      setWidth(Number(value))
    })
  }, [])

  const updateSelection = useCallback(
    (e): void => {
      if (focus !== 'fileList') {
        return
      }
      if (e.key === 'ArrowDown' || (e.ctrlKey && e.key == 'n')) {
        const currentEl = document.querySelector<HTMLElement>(`[data-id="${currentListItem}"]`)
        const id = currentEl?.dataset.next
        setCurrentListItem(
          currentEl?.parentElement?.nextElementSibling ? id || null : currentListItem
        )
        const el = document.querySelector<HTMLElement>(`[data-id="${id}"]`)!
        try {
          scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
        } catch (e) {
          console.warn(e)
        }
        e.preventDefault()
        if (bodyEditor?.current?.view?.hasFocus) {
          setIsEditorVisible(false)
          setTimeout(() => setIsEditorVisible(true), 1)
        }
      }
      if (e.key === 'ArrowUp' || (e.ctrlKey && e.key == 'p')) {
        const currentEl = document.querySelector<HTMLElement>(`[data-id="${currentListItem}"]`)
        const id = currentEl?.dataset.previous
        setCurrentListItem(
          currentEl?.parentElement?.previousElementSibling ? id || null : currentListItem
        )
        if (!currentEl?.parentElement?.previousElementSibling) {
          searchField.current?.focus()
        }
        const el = document.querySelector<HTMLElement>(`[data-id="${id}"]`)!
        try {
          scrollIntoView(el, { behavior: 'smooth', scrollMode: 'if-needed' })
        } catch (e) {
          console.warn(e)
        }
        e.preventDefault()
        if (bodyEditor?.current?.view?.hasFocus) {
          setIsEditorVisible(false)
          setTimeout(() => setIsEditorVisible(true), 1)
        }
      }
      if (e.key === ' ') {
        e.preventDefault()
        document.querySelector<HTMLElement>(`[data-id="${currentListItem}"]`)?.click()
      }
    },
    [currentListItem, bodyEditor, focus, setCurrentListItem, setIsEditorVisible]
  )

  useEffect(() => {
    setTimeout(() => {
      setListHeight(
        listRef.current?.getBoundingClientRect().height
          ? listRef.current?.getBoundingClientRect().height - 20
          : 0
      )
    }, 5)

    const handleResize = (): void => {
      setListHeight(listRef.current!.getBoundingClientRect().height - 20)
    }

    window.addEventListener('resize', handleResize)

    window.addEventListener('keydown', updateSelection)

    return (): void => {
      window.removeEventListener('keydown', updateSelection)
      window.removeEventListener('resize', handleResize)
    }
  }, [bodyEditor, setFocus, setIsEditorVisible, updateSelection])

  useEffect(() => {
    interact('aside').resizable({
      edges: { left: false, right: true, bottom: false, top: false },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 100, height: 500 },
          max: { width: 500, height: 500 }
        })
      ],
      listeners: {
        move(event) {
          requestAnimationFrame(() => {
            const target = event.target
            const newWidth = event.rect.width * 1.3
            target.style.width = newWidth + 'px'
            setWidth(newWidth)
            window.api.setConfig('view.sidebar.width', newWidth)
          })
        }
      }
    })
  }, [])

  useEffect(() => {
    listRef.current?.children[0].addEventListener('scroll', (e) => {
      const header = document.querySelector('.s-h')
      if ((e.target as HTMLElement)?.scrollTop > 0) {
        header?.classList?.add('shadow-sm')
      } else {
        header?.classList?.remove('shadow-sm')
      }
    })
  }, [listRef])

  if (!isVisible) {
    return <></>
  }

  return (
    <aside style={{ width: `${width}px` }}>
      <div className="s-h"></div>
      <div ref={listRef} className="fl">
        <FixedSizeList height={listHeight} width="100%" itemCount={files.length} itemSize={24}>
          {({ style, index }) => {
            const file = files[index]
            return FileItem({
              style,
              title: file?.title,
              isActive: file.id === current,
              isSelected: file.id === currentListItem,
              id: file.id,
              previousId: files[index - 1]?.id || null,
              nextId: files[index + 1]?.id || null,
              onClick: () => {
                setCurrentListItem(file.id)
                setFocus('fileList')
              }
            })
          }}
        </FixedSizeList>
      </div>
    </aside>
  )
}
