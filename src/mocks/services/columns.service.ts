import { columns, cards } from '../db'
import type { CardDTO, ColumnDTO, ColumnWithCardsDTO } from '../types/column.dto'

type RawCard = (typeof cards)[number]
type RawColumn = (typeof columns)[number]

export { updateCardPosition } from './cards.service'

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
 * 컬럼 생성
 * @param title - 생성할 컬럼 제목
 * @returns 생성된 컬럼 DTO
 */
export function createColumn(title: string): ColumnDTO {
  const newColumn = {
    id: `col_${Date.now()}`,
    title,
    order: columns.length,
    createdAt: new Date().toISOString(),
  }
  columns.push(newColumn)

  return {
    id: newColumn.id,
    title: newColumn.title,
    order: newColumn.order,
    created_at: newColumn.createdAt,
  }
}

/**
 * 컬럼 제목 수정
 * @param columnId - 수정할 컬럼 ID
 * @param title - 새로운 제목
 */
export function updateColumnTitle(columnId: string, title: string): boolean {
  const column = columns.find((c) => c.id === columnId)
  if (!column) return false

  column.title = title
  return true
}

/**
 * 컬럼 삭제
 * @param columnId - 삭제할 컬럼 ID
 */
export function deleteColumn(columnId: string): boolean {
  const columnIndex = columns.findIndex((c) => c.id === columnId)
  if (columnIndex === -1) return false

  // 컬럼 삭제
  columns.splice(columnIndex, 1)

  // 해당 컬럼의 카드들도 삭제
  for (let i = cards.length - 1; i >= 0; i--) {
    if (cards[i].columnId === columnId) {
      cards.splice(i, 1)
    }
  }

  return true
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