import { useState } from 'react'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { PointerSensor, useSensor, useSensors, KeyboardSensor } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import type { CardType, ColumnType } from '@/features/board/types.ts'
import useCardMutations from '@/features/board/hooks/useCardMutations.ts'
import {
  findCardByIdHelper,
  reorderCardsInColumnHelper,
  moveCardToColumnHelper,
} from '@/features/board/utils/cardDragHelper.ts'

/**
 * useCardDragAndDrop 훅의 입력 파라미터
 */
interface UseCardDragAndDropProps {
  // 서버에서 가져온 컬럼 데이터 (실제 데이터)
  serverColumns: ColumnType[]
}

/**
 * useCardDragAndDrop 훅의 반환값
 */
interface UseCardDragAndDropReturn {
  // 표시할 컬럼 배열 (드래그 중이면 localColumns, 아니면 serverColumns)
  columns: ColumnType[]
  // 드래그 중인 카드 정보 (드래그 중이 아니면 null)
  activeCard: CardType | null
  // 드래그 센서 설정 (8px 이동해야 드래그 시작)
  sensors: ReturnType<typeof useSensors>
  // 드래그 시작 이벤트 핸들러
  handleDragStart: (event: DragStartEvent) => void
  // 드래그 오버 이벤트 핸들러 (드래그 중 계속 호출됨)
  handleDragOver: (event: DragOverEvent) => void
  // 드래그 종료 이벤트 핸들러
  handleDragEnd: (event: DragEndEvent) => void
  // 드래그 취소 이벤트 핸들러 (ESC 키 등)
  handleDragCancel: () => void
}

/**
 * 카드 드래그 앤 드롭 로직을 관리하는 커스텀 훅
 * @param serverColumns - 서버에서 가져온 컬럼 데이터 (실제 데이터)
 * @returns 드래그 앤 드롭에 필요한 상태와 핸들러들
 */
export const useCardDragAndDrop = ({
  serverColumns,
}: UseCardDragAndDropProps): UseCardDragAndDropReturn => {
  const queryClient = useQueryClient()

  // 드래그 중 임시 상태
  // 드래그 중에는 localColumns 사용, 평소에는 serverColumns 사용
  const [localColumns, setLocalColumns] = useState<ColumnType[] | null>(null)

  // 드래그 중인 카드 정보
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  const { moveCard } = useCardMutations()

  // 표시할 컬럼: 드래그 중이면 localColumns, 아니면 serverColumns
  const columns = localColumns ?? serverColumns

  // 드래그 센서 설정 (8px 이동해야 드래그 시작, ESC 키로 취소 가능)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  /**
   * 같은 컬럼 내에서 카드 순서 변경
   * @param columnId - 카드가 속한 컬럼 ID
   * @param activeId - 드래그 중인 카드 ID (이동할 카드)
   * @param overId - 드롭 대상 카드 ID (이 카드의 위치로 이동)
   */
  const reorderCardsInColumn = (columnId: string, activeId: string, overId: string) => {
    setLocalColumns((prevColumns) => {
      if (!prevColumns) return null
      return reorderCardsInColumnHelper(prevColumns, columnId, activeId, overId)
    })
  }

  /**
   * 카드를 다른 컬럼으로 이동
   * @param cardId - 이동할 카드 ID
   * @param fromColumnId - 출발 컬럼 ID
   * @param toColumnId - 도착 컬럼 ID
   * @param insertAtCardId - 이 카드 위치에 삽입 (없으면 맨 끝에 추가)
   */
  const moveCardToColumn = (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    insertAtCardId?: string
  ) => {
    setLocalColumns((prevColumns) => {
      if (!prevColumns) return null
      return moveCardToColumnHelper(prevColumns, cardId, fromColumnId, toColumnId, insertAtCardId)
    })
  }

  /**
   * 드래그 시작 시 로컬 상태 초기화
   * @param event - 드래그 시작 이벤트 (active: 드래그 중인 요소 정보)
   */
  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string
    // 드래그 시작 시 서버 데이터를 로컬 상태로 복사
    const initialColumns = [...serverColumns]
    setLocalColumns(initialColumns)

    // 드래그 중인 카드 정보 저장
    const card = findCardByIdHelper(cardId, initialColumns)
    setActiveCard(card)
  }

  /**
   * 드래그 오버 시 로컬 상태만 업데이트 (빠른 UI 반응을 위해)
   * @param event - 드래그 오버 이벤트 (active: 드래그 중인 요소, over: 마우스가 올라간 대상)
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event

    if (!over || !localColumns || !activeCard) return

    // 현재 카드의 실제 위치 확인
    const currentCard = findCardByIdHelper(activeCard.id, localColumns)
    if (!currentCard) return

    // 마우스가 올라간 대상 확인
    const overCard = findCardByIdHelper(over.id as string, localColumns)
    const overColumn = localColumns.find((col) => col.id === over.id)

    // 실제 위치 업데이트
    if (overCard) {
      if (currentCard.column_id !== overCard.column_id) {
        // 다른 컬럼의 카드 위로 드래그
        moveCardToColumn(activeCard.id, currentCard.column_id, overCard.column_id, overCard.id)
      } else if (activeCard.id !== over.id) {
        // 같은 컬럼 내에서 다른 카드 위로 드래그
        reorderCardsInColumn(currentCard.column_id, activeCard.id, over.id as string)
      }
    } else if (overColumn && currentCard.column_id !== overColumn.id) {
      // 다른 컬럼의 빈 공간 위로 드래그
      moveCardToColumn(activeCard.id, currentCard.column_id, overColumn.id)
    }
  }

  /**
   * 드래그 완료 시 로컬 상태 리셋 및 서버 상태 업데이트
   * @param event - 드래그 종료 이벤트 (over: 드롭된 대상)
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    // over: 드래그 중 마우스가 올라간 대상 (카드 또는 컬럼)
    const { over } = event

    if (!over || !localColumns || !activeCard) {
      // 드래그가 취소된 경우 로컬 상태 리셋
      setLocalColumns(null)
      setActiveCard(null)
      return
    }

    // 드래그된 카드의 최종 위치 확인
    const finalCard = findCardByIdHelper(activeCard.id, localColumns)
    if (!finalCard) {
      setLocalColumns(null)
      setActiveCard(null)
      return
    }

    // 드래그 종료 즉시 activeCard 리셋 (드래그 오버레이 제거)
    setActiveCard(null)

    // 원래 위치와 다른 경우에만 API 호출
    const originalCard = findCardByIdHelper(activeCard.id, serverColumns)
    if (
      originalCard &&
      (originalCard.column_id !== finalCard.column_id || originalCard.order !== finalCard.order)
    ) {
      // 서버 상태 업데이트
      moveCard(
        {
          cardId: finalCard.id,
          targetColumnId: finalCard.column_id,
          newOrder: finalCard.order,
        },
        {
          onSuccess: () => {
            // 성공 시 로컬 상태를 캐시에 직접 반영 (불필요한 네트워크 요청 방지)
            if (localColumns) {
              queryClient.setQueryData(['columns'], { data: localColumns })
            }
            setLocalColumns(null)
          },
          onError: () => {
            // 로컬 상태도 리셋하여 서버 데이터로 복원
            setLocalColumns(null)
          },
        }
      )
    } else {
      // 위치가 변경되지 않았으면 즉시 로컬 상태 리셋
      setLocalColumns(null)
    }
  }

  /**
   * 드래그 취소 시 로컬 상태 리셋
   * ESC 키를 누르면 드래그가 취소되고 원래 상태로 복원됨
   */
  const handleDragCancel = () => {
    // 임시 상태를 모두 리셋하여 원래 상태로 복원
    setLocalColumns(null)
    setActiveCard(null)
  }

  return {
    columns,
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}
