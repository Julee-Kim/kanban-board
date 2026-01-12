import { useState } from 'react'
import type { ColumnType } from '@/features/board/types.ts'
import { useDroppable } from '@dnd-kit/core'
import useColumnMutations from '@/features/board/hooks/useColumnMutations.ts'
import EditableText from '@/features/board/components/column/EditableText.tsx'
import AddCardForm from '@/features/board/components/card/AddCardForm.tsx'
import PButton from '@/components/PButton.tsx'
import CardList from '@/features/board/components/card/CardList.tsx'
import styles from '@/features/board/components/column/Column.module.css'

interface ColumnProps {
  column: ColumnType
}

const Column = ({ column }: ColumnProps) => {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const { updateTitle, deleteColumn, isDeleting } = useColumnMutations(column.id)

  // 컬럼을 드롭 가능한 영역으로 설정
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const handleDeleteColumn = () => {
    const cardCount = column.cards.length
    const message =
      cardCount > 0
        ? `"${column.title}" 컬럼을 삭제하시겠습니까?\n\n이 컬럼에 있는 ${cardCount}개의 카드도 함께 삭제됩니다.`
        : `"${column.title}" 컬럼을 삭제하시겠습니까?`

    if (window.confirm(message)) deleteColumn()
  }

  const handleSaveTitle = (newTitle: string) => {
    updateTitle(newTitle)
  }

  return (
    <li ref={setNodeRef} className={`${styles.column} ${isOver ? styles.columnDragOver : ''}`}>
      <div className={styles.columnTitleWrap}>
        <EditableText
          className={styles.columnTitle}
          inputClassName={styles.columnTitleInput}
          value={column.title}
          onSave={handleSaveTitle}
        />
        <PButton
          className={styles.btnDeleteColumn}
          onClick={handleDeleteColumn}
          disabled={isDeleting}
        >
          삭제
        </PButton>
      </div>
      <div className={styles.columnContent}>
        <CardList cards={column.cards} />
        {isAddingCard ? (
          <AddCardForm columnId={column.id} onCancel={() => setIsAddingCard(false)} />
        ) : (
          <PButton className={styles.btnAddCard} onClick={() => setIsAddingCard(true)}>
            + 카드 추가
          </PButton>
        )}
      </div>
    </li>
  )
}

export default Column
