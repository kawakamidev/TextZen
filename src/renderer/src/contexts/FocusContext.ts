import { createContext, Dispatch, SetStateAction } from 'react'

export type FocusTarget = 'fileList' | 'editor' | 'fullTextSearch' | 'fileSearch'

interface ContextType {
  focus: FocusTarget
  setFocus: Dispatch<SetStateAction<FocusTarget>>
  toggleFocus: (value: FocusTarget) => void
}

export const FocusContext = createContext<ContextType>({
  focus: 'fileList',
  setFocus: () => {},
  toggleFocus: () => {}
})
