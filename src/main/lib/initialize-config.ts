import { store } from './store'

const initialize = (name: string, value): void => {
  if (store.get(name) === undefined) {
    store.set(name, value)
  }
}

export const initializeConfig = (): void => {
  initialize('view.sidebar.visible', true)
  initialize('view.sidebar.width', 200)
  initialize('view.theme', 'default')
  initialize('edit.linkAutoUpdate', true)
}
