import { useState, useRef } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { ColumnType } from '@/features/board/types.ts'
import { useDroppable } from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateColumnTitle, deleteColumn } from '@/api/columns.ts'
import { autoResizeTextarea } from '@/utils/textarea.ts'
import PButton from '@/components/PButton.tsx'
import CardList from '@/features/board/components/CardList.tsx'
import styles from '@/features/board/components/Column.module.css'

interface ColumnProps {
  column: ColumnType
}

const Column = ({ column }: ColumnProps) => {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 컬럼을 드롭 가능한 영역으로 설정
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const updateTitleMutation = useMutation({
    mutationFn: (newTitle: string) => updateColumnTitle(column.id, newTitle),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['columns'] })
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: () => deleteColumn(column.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['columns'] })
    },
  })

  const handleDeleteColumn = () => {
    const cardCount = column.cards.length
    const message =
      cardCount > 0
        ? `"${column.title}" 컬럼을 삭제하시겠습니까?\n\n이 컬럼에 있는 ${cardCount}개의 카드도 함께 삭제됩니다.`
        : `"${column.title}" 컬럼을 삭제하시겠습니까?`

    if (window.confirm(message)) deleteColumnMutation.mutate()
  }

  const startEditing = () => {
    setIsEditing(true)
    setTimeout(() => textareaRef.current?.select(), 0)
  }

  const saveTitle = () => {
    const trimmed = title.trim()

    if (!trimmed) {
      setTitle(column.title)
      setIsEditing(false)
      return
    }

    if (trimmed !== column.title) {
      updateTitleMutation.mutate(trimmed)
    }

    setIsEditing(false)
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value)
    autoResizeTextarea(e.target)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // IME 조합 중(한글 입력 등)에는 keydown 이벤트가 두 번 발생하므로 무시
    if (e.nativeEvent.isComposing) return

    if (e.key === 'Enter') {
      e.preventDefault()
      saveTitle()
    } else if (e.key === 'Escape') {
      setTitle(column.title)
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    saveTitle()
  }

  return (
    <li ref={setNodeRef} className={`${styles.column} ${isOver ? styles.columnDragOver : ''}`}>
      <div className={styles.columnTitleWrap}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={title}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className={styles.columnTitleInput}
            rows={1}
            autoFocus
          />
        ) : (
          <h2 className={styles.columnTitle} onClick={startEditing}>
            {column.title}
          </h2>
        )}
        <PButton className={styles.btnDeleteColumn} onClick={handleDeleteColumn}>
          삭제
        </PButton>
      </div>
      <CardList cards={column.cards} />
      <PButton className={styles.btnAddCard}>+ 카드 추가</PButton>
    </li>
  )
}

export default Column
