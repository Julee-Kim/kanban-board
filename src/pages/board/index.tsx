import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragStartEvent } from '@dnd-kit/core'
import type { ColumnType } from '@/features/board/types.ts'
import { fetchColumns } from '@/api/board.ts'
import { CardDetailModalProvider } from '@/features/board/contexts/CardDetailModalProvider.tsx'
import ColumnList from '@/features/board/components/ColumnList.tsx'
import Card from '@/features/board/components/Card.tsx'
import PButton from '@/components/PButton.tsx'
import ModalCardDetail from '@/features/board/components/ModalCardDetail.tsx'
import styles from './index.module.css'

const BoardContent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['columns'],
    queryFn: fetchColumns,
  })

  const columns: ColumnType[] = data?.data ?? []

  // 드래그 중인 카드 ID 추적
  const [activeId, setActiveId] = useState<string | null>(null)

  // 드래그 중인 카드 정보 찾기
  const activeCard = activeId
    ? columns.flatMap((col) => col.cards).find((card) => card.id === activeId)
    : null

  // 드래그 센서 설정 (8px 이동해야 드래그 시작)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 드래그 시작 시 activeId 설정
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // 드래그 종료 시 activeId 초기화
  const handleDragEnd = () => {
    setActiveId(null)
  }

  if (isLoading) {
    return <div className={styles.board}>로딩 중...</div>
  }

  if (error) {
    return <div className={styles.board}>에러가 발생했습니다.</div>
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={styles.board}>
        <ColumnList columns={columns} />
        <PButton className={styles.btnAddColumn}>+ 컬럼 추가</PButton>

        {/* Card 클릭을 통해 열리고, CardDetailModalProvider에서 제어되는 카드 상세 모달 */}
        <ModalCardDetail />
      </div>

      {/* 드래그 중 카드 그림자 효과 */}
      <DragOverlay>
        {activeCard ? <Card card={activeCard} /> : null}
      </DragOverlay>
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
