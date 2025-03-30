import './assets/style.css'

import './lib/console-message'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

window.textZen.path = await window.api.getConfig('general.path')
try {
  const fs = await window.api.getFiles()
  window.textZen.files = fs
} catch (e) {
  console.warn(e)
}

window.textZen.theme = await window.api.getConfig('view.theme')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
