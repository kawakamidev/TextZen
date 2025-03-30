import { useIntl } from 'react-intl'
import { useContext, useEffect, useState } from 'react'
import { FocusContext } from '@renderer/contexts/FocusContext'
import { MaterialSymbol } from 'react-material-symbols'
import 'react-material-symbols/rounded'
import { useLocation } from 'react-router'

export default function Header({
  onCreate,
  title,
  isSidebarVisible
}: {
  title: string
  onCreate?: () => void
  isSidebarVisible: boolean
}): JSX.Element {
  const intl = useIntl()
  const { toggleFocus } = useContext(FocusContext)
  const [folder, setFolder] = useState('')
  const location = useLocation()

  useEffect(() => {
    window.api.getConfig('general.path').then((path) => {
      setFolder(path.split('/').pop()!)
    })
  })

  return (
    <header>
      {location.pathname !== '/setup' && (
        <>
          <div className={`header-title ${isSidebarVisible ? '' : 'header-title--r'}`}>
            <h2 className="folder">{folder}</h2>
            <h3 className="file">{title}</h3>
          </div>
          <div className="header-btns">
            <button
              type="button"
              className="i-button"
              onClick={onCreate}
              aria-label={intl.formatMessage({ id: 'add' })}
            >
              <MaterialSymbol weight={300} icon="add" size={22} />
            </button>

            <button
              type="button"
              className="i-button"
              onClick={() => toggleFocus('fileSearch')}
              aria-label={intl.formatMessage({ id: 'searchFile' })}
            >
              <MaterialSymbol weight={300} icon="manage_search" size={22} />
            </button>

            <button
              type="button"
              className="i-button"
              onClick={() => toggleFocus('fullTextSearch')}
              aria-label={intl.formatMessage({ id: 'searchFullText' })}
            >
              <MaterialSymbol weight={300} icon="search" size={22} />
            </button>
          </div>
        </>
      )}
    </header>
  )
}
