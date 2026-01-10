import { cards } from '../db'

/**
 * 카드 위치 업데이트
 * @param cardId - 업데이트할 카드 ID
 * @param columnId - 새로운 컬럼 ID
 * @param order - 새로운 순서
 */
export function updateCardPosition(cardId: string, columnId: string, order: number): void {
  const cardIndex = cards.findIndex((card) => card.id === cardId)
  if (cardIndex === -1) return

  const card = cards[cardIndex]
  const oldColumnId = card.columnId
  const isSameColumn = oldColumnId === columnId

  if (isSameColumn) {
    // 같은 컬럼 내에서 순서 변경
    const columnCards = cards.filter((c) => c.columnId === columnId)
    columnCards.sort((a, b) => a.order - b.order)

    // 이동할 카드를 제거
    const oldIndex = columnCards.findIndex((c) => c.id === cardId)
    if (oldIndex === -1) return

    const [movedCard] = columnCards.splice(oldIndex, 1)
    // 새 위치에 삽입
    columnCards.splice(order, 0, movedCard)

    // order 재정렬
    columnCards.forEach((c, index) => {
      c.order = index
    })
  } else {
    // 다른 컬럼으로 이동
    // 1. 출발 컬럼의 카드들 order 재정렬
    const fromColumnCards = cards.filter((c) => c.columnId === oldColumnId && c.id !== cardId)
    fromColumnCards.sort((a, b) => a.order - b.order)
    fromColumnCards.forEach((c, index) => {
      c.order = index
    })

    // 2. 도착 컬럼의 카드들 정렬 (이동할 카드 제외)
    const toColumnCards = cards.filter((c) => c.columnId === columnId)
    toColumnCards.sort((a, b) => a.order - b.order)

    // 3. 새 위치에 카드 삽입
    toColumnCards.splice(order, 0, card)

    // 4. 카드 정보 업데이트 및 order 재정렬
    toColumnCards.forEach((c, index) => {
      c.order = index
      if (c.id === cardId) {
        c.columnId = columnId
        c.updatedAt = new Date().toISOString()
      }
    })
  }
}
