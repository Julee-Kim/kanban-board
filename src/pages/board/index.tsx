import { useState } from 'react'
import type { ColumnType } from '@/features/board/types.ts'
import ColumnList from '@/features/board/components/ColumnList.tsx'
import PButton from '@/components/PButton.tsx'
import styles from './index.module.css'

const BoardPage = () => {
  const [columns, setColumns] = useState<ColumnType[]>([])

  return (
    <div className={styles.board}>
      <ColumnList columns={columns} />
      <PButton className={styles.btnAddColumn}>+ 컬럼 추가</PButton>
    </div>
  )
}

export default BoardPage
