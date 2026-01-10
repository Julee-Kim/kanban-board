import { useQuery } from '@tanstack/react-query'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { fetchColumns } from '@/api/board.ts'
import { CardDetailModalProvider } from '@/features/board/contexts/CardDetailModalProvider.tsx'
import { useCardDragAndDrop } from '@/features/board/hooks/useCardDragAndDrop.ts'
import ColumnList from '@/features/board/components/ColumnList.tsx'
import Card from '@/features/board/components/Card.tsx'
import AddColumn from '@/features/board/components/AddColumn.tsx'
import ModalCardDetail from '@/features/board/components/ModalCardDetail.tsx'
import styles from './index.module.css'

const BoardContent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['columns'],
    queryFn: fetchColumns,
  })

  // 서버 상태 (실제 데이터)
  const serverColumns = data?.data ?? []

  // 드래그 앤 드롭 로직 커스텀 훅
  const {
    columns,
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useCardDragAndDrop({ serverColumns })

  if (isLoading) {
    return <div className={styles.board}>로딩 중...</div>
  }

  if (error) {
    return <div className={styles.board}>에러가 발생했습니다.</div>
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={styles.board}>
        <ColumnList columns={columns} />

        {/* 컬럼 추가 UI */}
        <AddColumn />

        {/* Card 클릭을 통해 열리고, CardDetailModalProvider에서 제어되는 카드 상세 모달 */}
        <ModalCardDetail />
      </div>

      {/* 드래그 중 카드 그림자 효과 */}
      <DragOverlay>{activeCard ? <Card card={activeCard} /> : null}</DragOverlay>
    </DndContext>
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
