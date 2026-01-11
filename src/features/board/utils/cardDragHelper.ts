import type { CardType, ColumnType } from '@/features/board/types.ts'

/**
 * 카드 ID로 카드 찾기
 * @param cardId - 찾을 카드의 ID
 * @param columns - 검색할 컬럼 배열
 * @returns 찾은 카드 또는 null
 */
export const findCardByIdHelper = (cardId: string, columns: ColumnType[]): CardType | null => {
  for (const column of columns) {
    const card = column.cards.find((c) => c.id === cardId)
    if (card) return card
  }
  return null
}

/**
 * 같은 컬럼 내에서 카드 순서 변경
 * @param columns - 전체 컬럼 배열
 * @param columnId - 카드가 속한 컬럼 ID
 * @param activeId - 드래그 중인 카드 ID (이동할 카드)
 * @param overId - 드롭 대상 카드 ID (이 카드의 위치로 이동)
 * @returns 업데이트된 컬럼 배열
 */
export const reorderCardsInColumnHelper = (
  columns: ColumnType[],
  columnId: string,
  activeId: string,
  overId: string
): ColumnType[] => {
  return columns.map((column) => {
    // 대상 컬럼이 아니면 그대로 반환
    if (column.id !== columnId) return column

    const cards = [...column.cards]

    // 드래그 중인 카드의 현재 인덱스
    const activeIndex = cards.findIndex((card) => card.id === activeId)
    // 드롭 대상 카드의 인덱스 (여기로 이동)
    const overIndex = cards.findIndex((card) => card.id === overId)

    // 유효하지 않은 인덱스이거나 같은 위치면 업데이트 안 함
    if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return column

    /**
     * 카드 순서 변경 로직
     * 1. activeIndex 위치의 카드를 배열에서 제거
     * 2. overIndex 위치에 제거한 카드를 삽입
     * splice(index, 0, item): index 위치에 item 삽입, 기존 요소들은 뒤로 밀림
     */
    const [movedCard] = cards.splice(activeIndex, 1)
    cards.splice(overIndex, 0, movedCard)

    // order 필드를 배열 인덱스에 맞게 업데이트 (0, 1, 2, ...)
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
 * @param insertAtCardId - 이 카드 위치에 삽입 (없으면 맨 끝에 추가)
 * @returns 업데이트된 컬럼
 */
const addCardToColumn = (
  column: ColumnType,
  cardToMove: CardType,
  cardId: string,
  insertAtCardId?: string
): ColumnType => {
  // 삽입 위치 결정
  let insertIndex = column.cards.length // 기본값: 맨 끝

  // 특정 카드의 위치에 삽입 (그 카드를 밀어내고 그 자리에 삽입)
  if (insertAtCardId) {
    const targetIndex = column.cards.findIndex((card) => card.id === insertAtCardId)
    if (targetIndex !== -1) {
      insertIndex = targetIndex
    }
  }

  // 드롭한 카드가 목표 컬럼에 이미 존재하는지 확인
  const existingIndex = column.cards.findIndex((card) => card.id === cardId)

  const newCards = [...column.cards]

  // 카드가 이미 존재하면 먼저 제거 및 조기 반환 체크
  if (existingIndex !== -1) {
    // 제거 후 삽입 위치를 조정하여 실제 삽입될 위치 계산
    const adjustedInsertIndex = existingIndex < insertIndex ? insertIndex - 1 : insertIndex

    // 이미 올바른 위치에 있으면 변경 불필요 (조기 반환으로 중복 작업 방지)
    if (existingIndex === adjustedInsertIndex) {
      return column
    }

    // 카드 제거
    newCards.splice(existingIndex, 1)
    // 제거 후 insertIndex 조정 (제거한 카드가 삽입 위치보다 앞에 있었으면)
    if (existingIndex < insertIndex) {
      insertIndex--
    }
  }

  const movedCard: CardType = {
    ...cardToMove,
    column_id: column.id,
    order: insertIndex,
  }

  // 카드를 특정 위치에 삽입
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
 * @param insertAtCardId - 이 카드 위치에 삽입 (없으면 맨 끝에 추가)
 * @returns 새로운 컬럼 배열
 */
export const moveCardToColumnHelper = (
  columns: ColumnType[],
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  insertAtCardId?: string
): ColumnType[] => {
  // 출발 컬럼과 도착 컬럼이 같으면 변경 없음
  if (fromColumnId === toColumnId) return columns

  // 1. 이동할 카드 찾기
  const cardToMove = findCardByIdHelper(cardId, columns)
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
      return addCardToColumn(column, cardToMove, cardId, insertAtCardId)
    }
    return column
  })
}
