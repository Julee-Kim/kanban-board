import type { ColumnType } from '@/features/board/types.ts'
import PButton from '@/components/PButton.tsx'
import CardList from '@/features/board/components/CardList.tsx'
import styles from '@/features/board/components/Column.module.css'

interface ColumnProps {
  column: ColumnType
}

const Column = ({ column }: ColumnProps) => {
  return (
    <li className={styles.column}>
      <div className={styles.columnTitleWrap}>
        <h2 className={styles.columnTitle}>{column.title}</h2>
        <PButton className={styles.btnDeleteColumn}>삭제</PButton>
      </div>
      <CardList cards={column.cards} />
      <PButton className={styles.btnAddCard}>+ 카드 추가</PButton>
    </li>
  )
}

export default Column
