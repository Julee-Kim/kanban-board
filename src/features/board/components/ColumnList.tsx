import type { ColumnType } from '@/features/board/types.ts'
import Column from '@/features/board/components/Column.tsx'
import styles from './ColumnList.module.css'

interface ColumnListProps {
  columns: ColumnType[]
}

const ColumnList = ({ columns = [] }: ColumnListProps) => {
  return (
    <ul className={styles.columnList}>
      {columns.length === 0 ? (
        <p className={styles.emptyText}>첫 번째 컬럼을 추가해보세요.</p>
      ) : (
        columns.map((column) => <Column key={column.id} column={column} />)
      )}
    </ul>
  )
}

export default ColumnList
