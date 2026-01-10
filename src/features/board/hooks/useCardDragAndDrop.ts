import { useState } from 'react'
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import type { ColumnType, CardType } from '@/features/board/types.ts'

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
}

/**
 * 카드 ID로 카드 찾기
 * @param cardId - 찾을 카드의 ID
 * @param columns - 검색할 컬럼 배열
 * @returns 찾은 카드 또는 null
 */
const findCardById = (cardId: string, columns: ColumnType[]): CardType | null => {
  for (const column of columns) {
    const card = column.cards.find((c) => c.id === cardId)
    if (card) return card
  }
  return null
}

/**
 * 같은 컬럼 내에서 카드 순서 변경
 * @param columns - 컬럼 배열
 * @param columnId - 카드가 속한 컬럼 ID
 * @param activeId - 드래그 중인 카드 ID
 * @param overId - 드롭 대상 카드 ID
 * @returns 새로운 컬럼 배열
 */
const reorderCardsInColumnHelper = (
  columns: ColumnType[],
  columnId: string,
  activeId: string,
  overId: string
): ColumnType[] => {
  return columns.map((column) => {
    if (column.id !== columnId) return column

    const cards = [...column.cards]
    // 드래그 중인 카드의 현재 인덱스
    const activeIndex = cards.findIndex((card) => card.id === activeId)
    // 드롭 대상 카드의 인덱스
    const overIndex = cards.findIndex((card) => card.id === overId)

    // 유효하지 않은 인덱스이거나 같은 위치면 업데이트 안 함
    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return column

    // 카드 순서 변경: activeIndex 위치의 카드를 제거하고 overIndex 위치에 삽입
    const removedCard = cards.splice(activeIndex, 1)[0]
    cards.splice(overIndex, 0, removedCard)

    // order 필드 업데이트
    const updatedCards = cards.map((card, index) => ({
      ...card,
      order: index,
    }))

    return {
      ...column,
      cards: updatedCards,
    }
  })
}

/**
 * 다른 컬럼에 카드 추가 (특정 위치에 삽입 가능)
 * @param column - 도착 컬럼
 * @param cardToMove - 이동할 카드
 * @param cardId - 이동할 카드 ID
 * @param insertAfterCardId - 이 카드 뒤에 삽입 (없으면 맨 끝에 추가)
 * @returns 업데이트된 컬럼
 */
const addCardToColumn = (
  column: ColumnType,
  cardToMove: CardType,
  cardId: string,
  insertAfterCardId?: string
): ColumnType => {
  // handleDragOver가 매우 자주 호출되므로, 상태 업데이트 전에 중복 추가를 방지하기 위한 체크
  const cardExists = column.cards.some((card) => card.id === cardId)
  if (cardExists) return column

  // 삽입 위치 결정
  let insertIndex = column.cards.length // 기본값: 맨 끝

  // 특정 위치에 삽입
  if (insertAfterCardId) {
    const insertAfterIndex = column.cards.findIndex((card) => card.id === insertAfterCardId)
    if (insertAfterIndex !== -1) {
      insertIndex = insertAfterIndex + 1
    }
  }

  const movedCard: CardType = {
    ...cardToMove,
    column_id: column.id,
    order: insertIndex,
  }

  // 카드를 특정 위치에 삽입
  const newCards = [...column.cards]
  newCards.splice(insertIndex, 0, movedCard)

  // order 재정렬
  const updatedCards = newCards.map((card, index) => ({
    ...card,
    order: index,
  }))

  return {
    ...column,
    cards: updatedCards,
  }
}

/**
 * 카드를 다른 컬럼으로 이동
 * @param columns - 컬럼 배열
 * @param cardId - 이동할 카드 ID
 * @param fromColumnId - 출발 컬럼 ID
 * @param toColumnId - 도착 컬럼 ID
 * @param insertAfterCardId - 이 카드 뒤에 삽입 (없으면 맨 끝에 추가)
 * @returns 새로운 컬럼 배열
 */
const moveCardToColumnHelper = (
  columns: ColumnType[],
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  insertAfterCardId?: string
): ColumnType[] => {
  // 출발 컬럼과 도착 컬럼이 같으면 변경 없음
  if (fromColumnId === toColumnId) return columns

  // 1. 이동할 카드 찾기
  const cardToMove = findCardById(cardId, columns)
  if (!cardToMove) return columns

  // 2. 출발 컬럼에서 먼저 제거 (중복 방지)
  const columnsWithoutCard = columns.map((column) => {
    if (column.id === fromColumnId) {
      return {
        ...column,
        cards: column.cards
          .filter((card) => card.id !== cardId)
          .map((card, index) => ({ ...card, order: index })),
      }
    }
    return column
  })

  // 3. 도착 컬럼에 카드 추가
  return columnsWithoutCard.map((column) => {
    if (column.id === toColumnId) {
      return addCardToColumn(column, cardToMove, cardId, insertAfterCardId)
    }
    return column
  })
}

/**
 * 카드 드래그 앤 드롭 로직을 관리하는 커스텀 훅
 * @param serverColumns - 서버에서 가져온 컬럼 데이터 (실제 데이터)
 * @returns 드래그 앤 드롭에 필요한 상태와 핸들러들
 */
export const useCardDragAndDrop = ({
  serverColumns,
}: UseCardDragAndDropProps): UseCardDragAndDropReturn => {
  // 클라이언트 UI 상태 (드래그 중 임시 상태)
  // 드래그 중에는 localColumns 사용, 평소에는 serverColumns 사용
  const [localColumns, setLocalColumns] = useState<ColumnType[] | null>(null)

  // 드래그 중인 카드 정보
  const [activeCard, setActiveCard] = useState<CardType | null>(null)

  // 표시할 컬럼: 드래그 중이면 localColumns, 아니면 serverColumns
  const columns = localColumns ?? serverColumns

  // 드래그 센서 설정 (8px 이동해야 드래그 시작)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  /**
   * 같은 컬럼 내에서 카드 순서 변경
   * @param columnId - 카드가 속한 컬럼 ID
   * @param activeId - 드래그 중인 카드 ID
   * @param overId - 드롭 대상 카드 ID
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
   * @param insertAfterCardId - 이 카드 뒤에 삽입 (없으면 맨 끝에 추가)
   */
  const moveCardToColumn = (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    insertAfterCardId?: string
  ) => {
    setLocalColumns((prevColumns) => {
      if (!prevColumns) return null
      return moveCardToColumnHelper(
        prevColumns,
        cardId,
        fromColumnId,
        toColumnId,
        insertAfterCardId
      )
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
    const card = findCardById(cardId, initialColumns)
    setActiveCard(card)
  }

  /**
   * 드래그 오버 시 로컬 상태만 업데이트 (빠른 UI 반응을 위해)
   * @param event - 드래그 오버 이벤트 (active: 드래그 중인 요소, over: 마우스가 올라간 대상)
   */
  const handleDragOver = (event: DragOverEvent) => {
    // over: 드래그 중 마우스가 올라간 대상 (카드 또는 컬럼)
    const { over } = event

    if (!over || !localColumns || !activeCard) return

    // 현재 카드의 실제 위치 확인 (localColumns에서 찾기)
    // activeCard.column_id는 드래그 시작 시점의 값이므로, 이동 후에는 실제 위치를 확인해야 함
    const currentCard = findCardById(activeCard.id, localColumns)
    if (!currentCard) return

    // 마우스가 올라간 대상 확인 - over가 카드인지 확인
    const overCard = findCardById(over.id as string, localColumns)
    // 마우스가 올라간 대상 확인 - over가 컬럼인지 확인
    const overColumn = localColumns.find((col) => col.id === over.id)

    // 케이스 1: 다른 컬럼 위로 드래그 (맨 끝에 추가)
    // currentCard.column_id: 현재 카드의 실제 위치 (이동 후 변경됨)
    // overColumn.id: 드롭하려는 컬럼
    // 두 값이 다르면 다른 컬럼으로 이동
    if (overColumn && currentCard.column_id !== overColumn.id) {
      moveCardToColumn(activeCard.id, currentCard.column_id, overColumn.id)
      return
    }

    if (overCard) {
      // 케이스 2: 다른 컬럼의 카드 위로 드래그 (특정 위치에 삽입)
      // currentCard.column_id: 현재 카드의 실제 위치
      // overCard.column_id: 드롭하려는 카드가 속한 컬럼
      // 두 값이 다르면 다른 컬럼으로 이동
      if (currentCard.column_id !== overCard.column_id) {
        moveCardToColumn(activeCard.id, currentCard.column_id, overCard.column_id, overCard.id)
        return
      }

      // 케이스 3: 같은 컬럼 내에서 다른 카드 위로 드래그
      if (activeCard.id !== over.id) {
        // 순서만 변경
        reorderCardsInColumn(currentCard.column_id, activeCard.id, over.id as string)
      }
    }
  }

  /**
   * 드래그 완료 시 로컬 상태 리셋
   * @param event - 드래그 종료 이벤트 (over: 드롭된 대상)
   */
  const handleDragEnd = (event: DragEndEvent) => {
    // over: 드래그 중 마우스가 올라간 대상 (카드 또는 컬럼)
    const { over } = event

    if (!over || !localColumns) {
      // 드래그가 취소된 경우 로컬 상태 리셋
      setLocalColumns(null)
      setActiveCard(null)
      return
    }

    // TODO: 나중에 API 연동 시 서버 상태 업데이트 추가

    // 로컬 상태 리셋 (서버 상태 사용)
    setLocalColumns(null)
    // 드래그 중인 카드 정보 리셋
    setActiveCard(null)
  }

  return {
    columns,
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}
