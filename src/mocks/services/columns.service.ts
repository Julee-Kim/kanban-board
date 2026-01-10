import { columns, cards } from '../db'
import type { CardDTO, ColumnWithCardsDTO } from '../types/column.dto'

type RawCard = (typeof cards)[number]
type RawColumn = (typeof columns)[number]

/**
 * DB에 저장된 컬럼/카드 데이터를
 * API 응답 규약에 맞는 ColumnWithCardsDTO(snake_case) 형태로 반환.
 */
export function getColumnsWithCards(): { data: ColumnWithCardsDTO[] } {
  // 1. 컬럼을 order 기준으로 정렬
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order)

  // 2. 카드를 columnId 기준으로 그룹핑 (RAW)
  const cardsByColumnId = groupCardsByColumnId(cards)

  // 3. 컬럼을 API 응답 DTO로 변환
  const result: ColumnWithCardsDTO[] = sortedColumns.map((column) =>
    createColumnDTO(column, cardsByColumnId)
  )

  return { data: result }
}

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

/* ----------------- helpers (function 내부 로직 분리) ----------------- */

/**
 * 모든 카드를 columnId 기준으로 그룹핑
 */
const groupCardsByColumnId = (rawCards: RawCard[]): Record<string, RawCard[]> => {
  return rawCards.reduce<Record<string, RawCard[]>>((acc, card) => {
    if (!acc[card.columnId]) {
      acc[card.columnId] = []
    }
    acc[card.columnId].push(card)
    return acc
  }, {})
}

/**
 * 카드 배열을 order 기준으로 정렬하고
 * API 응답용 CardDTO(snake_case)로 변환
 */
const createCardDTOs = (rawCards: RawCard[]): CardDTO[] => {
  return rawCards
    .sort((a, b) => a.order - b.order)
    .map((card) => {
      return {
        id: card.id,
        column_id: card.columnId,
        title: card.title,
        description: card.description,
        due_date: card.dueDate,
        order: card.order,
        created_at: card.createdAt,
        updated_at: card.updatedAt,
      }
    })
}

/**
 * 컬럼 하나와 해당 컬럼의 카드 목록을 조합하여
 * API 응답용 ColumnWithCardsDTO로 변환
 */
const createColumnDTO = (
  column: RawColumn,
  cardsByColumnId: Record<string, RawCard[]>
): ColumnWithCardsDTO => {
  return {
    id: column.id,
    title: column.title,
    order: column.order,
    created_at: column.createdAt,
    cards: createCardDTOs(cardsByColumnId[column.id] ?? []),
  }
}