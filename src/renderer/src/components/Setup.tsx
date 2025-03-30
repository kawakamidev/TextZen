import { useEffect } from 'react'
import Header from './Header'
import { useNavigate } from 'react-router'
import { FormattedMessage } from 'react-intl'

export default function Setup(): JSX.Element {
  const navigate = useNavigate()

  useEffect(() => {
    window.electron.ipcRenderer.on('open-directory', () => navigate('/'))
  })

  return (
    <>
      <Header title="" onCreate={() => {}} isSidebarVisible={false} />
      <div className="setup">
        <div className="container">
          <button
            type="button"
            onClick={async () => {
              await window.api.openFile()
              navigate('/')
            }}
            className="t-button"
          >
            <FormattedMessage id="openFolder" />
          </button>
          <div className="shortcut">
            <div className="keyboard">⌘</div>
            <div className="keyboard">O</div>
          </div>
        </div>
      </div>
    </>
  )
}
