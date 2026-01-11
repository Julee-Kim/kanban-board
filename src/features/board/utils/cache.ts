import type { CardType, ColumnType, FetchColumnsRes } from '@/features/board/types'

/**
 * 캐시에서 특정 카드를 찾아 업데이트
 *
 * @param data - 현재 캐시된 컬럼 데이터
 * @param cardId - 업데이트할 카드 ID
 * @param updates - 변경할 카드 속성들 (title, description 등)
 * @returns 업데이트된 새로운 데이터 객체
 */
export const updateCardInCache = (
  data: FetchColumnsRes,
  cardId: string,
  updates: Partial<CardType>
): FetchColumnsRes => {
  // 새로운 컬럼 배열 생성
  const newColumns: ColumnType[] = []

  for (const column of data.data) {
    // 각 컬럼의 카드들을 순회하며 해당 카드 업데이트
    const newCards: CardType[] = []

    for (const card of column.cards) {
      if (card.id === cardId) {
        // 해당 카드를 찾으면 업데이트
        newCards.push({ ...card, ...updates })
      } else {
        newCards.push(card)
      }
    }

    newColumns.push({ ...column, cards: newCards })
  }

  return { ...data, data: newColumns }
}

/**
 * 캐시에서 특정 카드를 제거
 *
 * @param data - 현재 캐시된 컬럼 데이터
 * @param cardId - 제거할 카드 ID
 * @returns 카드가 제거된 새로운 데이터 객체
 */
export const removeCardFromCache = (data: FetchColumnsRes, cardId: string): FetchColumnsRes => {
  // 새로운 컬럼 배열 생성
  const newColumns: ColumnType[] = []

  for (const column of data.data) {
    // 해당 카드를 제외한 나머지 카드들만 유지
    const newCards = column.cards.filter((card) => card.id !== cardId)
    newColumns.push({ ...column, cards: newCards })
  }

  return { ...data, data: newColumns }
}
