import { useQuery } from '@tanstack/react-query'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { fetchColumns } from '@/api/columns.ts'
import { CardDetailModalProvider } from '@/features/board/contexts/CardDetailModalProvider.tsx'
import {
  useCardDetailModalState,
  useCardDetailModalActions,
} from '@/features/board/contexts/useCardDetailModal.ts'
import { useCardDragAndDrop } from '@/features/board/hooks/useCardDragAndDrop.ts'
import ColumnList from '@/features/board/components/column/ColumnList.tsx'
import Card from '@/features/board/components/card/Card.tsx'
import AddColumn from '@/features/board/components/column/AddColumn.tsx'
import ModalCardDetail from '@/features/board/components/card/ModalCardDetail.tsx'
import BoardSkeleton from '@/features/board/components/shared/BoardSkeleton.tsx'
import ErrorMessage from '@/components/ErrorMessage.tsx'
import styles from './index.module.css'

const BoardContent = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['columns'],
    queryFn: fetchColumns,
  })
  const { isOpen, selectedCard } = useCardDetailModalState()
  const { closeModal } = useCardDetailModalActions()

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
    return <BoardSkeleton />
  }

  if (error) {
    return <ErrorMessage message="데이터를 불러오는 중 문제가 발생했습니다." onRetry={refetch} />
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
        {selectedCard && (
          <ModalCardDetail isOpen={isOpen} card={selectedCard} onClose={closeModal} />
        )}
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
