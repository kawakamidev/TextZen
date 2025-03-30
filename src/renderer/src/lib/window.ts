export {}

window.textZen.api = window.api
window.textZen.codemirror = {
  view: null,
  state: null,
  editor: null,
  styles: []
}

try {
  window.textZenInternal.files = await window.api.getFiles()
} catch (e) {
  console.warn(e)
}
window.textZenInternal.config = {
  general: {},
  view: {}
}
window.textZenInternal.config.general.path = await window.api.getConfig('general.path')
window.textZenInternal.config.view.theme = await window.api.getConfig('view.theme')
window.textZenInternal.config.view.locale = await window.api.getConfig('view.locale')
