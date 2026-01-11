import { useState, useRef, useEffect } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { COLUMN_TITLE_MAX_LENGTH } from '@/features/board/constants.ts'
import { autoResizeTextarea } from '@/utils/textarea.ts'

interface EditableTextProps {
  value: string
  onSave?: (value: string) => void
  className?: string
  inputClassName?: string
}

const EditableText = ({
  value,
  onSave,
  className = '',
  inputClassName = '',
}: EditableTextProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(value)

  const startEditing = () => {
    setText(value)
    setIsEditing(true)
  }

  const save = () => {
    const trimmed = text.trim()

    if (!trimmed) {
      setText(value)
      setIsEditing(false)
      return
    }

    if (trimmed !== value) {
      onSave?.(trimmed)
    }

    setIsEditing(false)
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value.slice(0, COLUMN_TITLE_MAX_LENGTH))
    autoResizeTextarea(e.target)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return

    if (e.key === 'Enter') {
      e.preventDefault()
      save()
    } else if (e.key === 'Escape') {
      setText(value)
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    save()
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [isEditing])

  if (isEditing) {
    return (
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={inputClassName}
        rows={1}
        autoFocus
      />
    )
  }

  return (
    <h2 className={className} onClick={startEditing}>
      {value}
    </h2>
  )
}

export default EditableText
