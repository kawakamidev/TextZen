import { createContext, Dispatch, SetStateAction } from 'react'

interface ContextType {
  current: string | null
  setCurrent: Dispatch<SetStateAction<string | null>>
}

export const FileListContext = createContext<ContextType>({
  current: null,
  setCurrent: () => {}
})
