import { useEffect, useState } from 'react'
import type { ColumnType } from '@/features/board/types.ts'
import { fetchColumns } from '@/api/board.ts'
import { CardDetailModalProvider } from '@/features/board/contexts/CardDetailModalProvider.tsx'
import ColumnList from '@/features/board/components/ColumnList.tsx'
import PButton from '@/components/PButton.tsx'
import ModalCardDetail from '@/features/board/components/ModalCardDetail.tsx'
import styles from './index.module.css'

const BoardContent = () => {
  const [columns, setColumns] = useState<ColumnType[]>([])

  useEffect(() => {
    const init = async () => {
      const data = await fetchColumns()
      setColumns(data.data)
    }
    init()
  }, [])
  return (
    <div className={styles.board}>
      <ColumnList columns={columns} />
      <PButton className={styles.btnAddColumn}>+ 컬럼 추가</PButton>

      {/* Card 클릭을 통해 열리고, CardDetailModalProvider에서 제어되는 카드 상세 모달 */}
      <ModalCardDetail />
    </div>
  )
}

const BoardPage = () => {
  return (
    <CardDetailModalProvider>
      <BoardContent />
    </CardDetailModalProvider>
  )
}

export default BoardPage
