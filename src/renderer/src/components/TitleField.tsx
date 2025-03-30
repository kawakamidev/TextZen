import { EditorContext } from '@renderer/contexts/editorContext'
import { KeyboardEventHandler, useContext } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

interface Props {
  value: string
  onChange: (value: string) => void
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement> | undefined
}

export default function TitleField({ value, onChange, onKeyDown }: Props): JSX.Element {
  const { titleEditor } = useContext(EditorContext)

  return (
    <TextareaAutosize
      value={value}
      className="tf"
      ref={titleEditor}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      title="Title"
    />
  )
}
