import { useState, useRef } from 'react'
import type { ChangeEvent, KeyboardEvent, FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createColumn } from '@/api/board.ts'
import { autoResizeTextarea } from '@/utils/textarea.ts'
import PButton from '@/components/PButton.tsx'
import styles from './AddColumnForm.module.css'

interface AddColumnFormProps {
  onCancel: () => void
}

const AddColumnForm = ({ onCancel }: AddColumnFormProps) => {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const createColumnMutation = useMutation({
    mutationFn: (title: string) => createColumn(title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['columns'] })
      onCancel()
    },
  })

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value)
    autoResizeTextarea(e.target)
  }

  const submitColumn = () => {
    if (createColumnMutation.isPending) return

    const trimmed = title.trim()
    if (!trimmed) return
    createColumnMutation.mutate(trimmed)
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
    submitColumn()
  }

  return (
    <div className={styles.addColumnForm}>
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={title}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="컬럼 제목 입력"
          className={styles.columnTitleInput}
          rows={1}
          autoFocus
        />
        <div className={styles.addColumnButtons}>
          <PButton type="submit" className={styles.btnSubmitColumn}>
            컬럼 추가
          </PButton>
          <PButton type="button" onClick={onCancel} className={styles.btnCancelColumn}>
            취소
          </PButton>
        </div>
      </form>
    </div>
  )
}

export default AddColumnForm
