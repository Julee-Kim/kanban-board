import { useState, useRef } from 'react'
import type { ChangeEvent, KeyboardEvent, FormEvent, FocusEvent } from 'react'
import { autoResizeTextarea } from '@/utils/textarea.ts'
import PButton from '@/components/PButton.tsx'
import styles from './AddItemForm.module.css'

interface AddItemFormProps {
  placeholder: string // textarea placeholder 텍스트
  submitLabel: string // 제출 버튼 라벨
  isPending: boolean // 제출 중 상태 (중복 제출 방지)
  onSubmit: (title: string) => void // 제출 시 호출되는 콜백
  onCancel: () => void // 취소 시 호출되는 콜백
  maxLength?: number // 최대 글자수 제한
  className?: string // 추가 CSS 클래스
}

const AddItemForm = ({
  placeholder,
  submitLabel,
  maxLength,
  isPending,
  onSubmit,
  onCancel,
  className,
}: AddItemFormProps) => {
  const [title, setTitle] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = maxLength ? e.target.value.slice(0, maxLength) : e.target.value
    setTitle(value)
    autoResizeTextarea(e.target)
  }

  const submit = () => {
    if (isPending) return

    const trimmed = title.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME 조합 중(한글 입력 등)에는 keydown 이벤트가 두 번 발생하므로 무시
    if (e.nativeEvent.isComposing) return

    if (e.key === 'Enter') {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  const handleBlur = (e: FocusEvent) => {
    // 폼 내부 요소로 포커스가 이동하면 닫지 않음
    if (e.currentTarget.contains(e.relatedTarget)) return
    onCancel()
  }

  return (
    <div className={`${styles.addItemForm} ${className ?? ''}`} onBlur={handleBlur}>
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={title}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.titleInput}
          rows={1}
          autoFocus
        />
        <div className={styles.buttons}>
          <PButton type="submit" className={styles.btnSubmit}>
            {submitLabel}
          </PButton>
          <PButton type="button" onClick={onCancel} className={styles.btnCancel}>
            취소
          </PButton>
        </div>
      </form>
    </div>
  )
}

export default AddItemForm
