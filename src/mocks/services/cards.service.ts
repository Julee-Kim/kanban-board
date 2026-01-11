import { cards } from '../db'
import type { CardDTO } from '../types/dto'

// ISO 8601 형식으로 변환 (밀리초 제외)
const toISOStringWithoutMs = (date: Date): string => {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

// datetime-local 형식(YYYY-MM-DDTHH:mm)을 ISO 8601 형식(YYYY-MM-DDTHH:mm:00Z)으로 변환
const toISODueDate = (dateTimeLocal: string | null): string | null => {
  if (!dateTimeLocal) return null
  return `${dateTimeLocal}:00Z`
}

/**
 * 카드 생성
 * @param columnId - 카드를 추가할 컬럼 ID
 * @param title - 카드 제목
 * @returns 생성된 카드 DTO
 */
export function createCard(columnId: string, title: string): CardDTO {
  const columnCards = cards.filter((c) => c.columnId === columnId)
  const maxOrder = columnCards.length > 0 ? Math.max(...columnCards.map((c) => c.order)) : -1

  const now = toISOStringWithoutMs(new Date())
  const newCard = {
    id: crypto.randomUUID(),
    columnId,
    title,
    description: '',
    order: maxOrder + 1,
    dueDate: null,
    createdAt: now,
    updatedAt: now,
  }

  cards.push(newCard)

  return {
    id: newCard.id,
    column_id: newCard.columnId,
    title: newCard.title,
    description: newCard.description,
    due_date: newCard.dueDate,
    order: newCard.order,
    created_at: newCard.createdAt,
    updated_at: newCard.updatedAt,
  }
}

/**
 * 카드 내용 수정
 * @param cardId - 수정할 카드 ID
 * @param title - 새로운 제목
 * @param description - 새로운 설명
 * @param dueDate - 마감일 (YYYY-MM-DDTHH:mm 형식 또는 null)
 * @returns 수정된 카드 DTO, 카드가 없으면 null
 */
export function updateCard(
  cardId: string,
  title: string,
  description: string,
  dueDate: string | null
): CardDTO | null {
  const card = cards.find((c) => c.id === cardId)
  if (!card) return null

  card.title = title
  card.description = description
  card.dueDate = toISODueDate(dueDate)
  card.updatedAt = toISOStringWithoutMs(new Date())

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
}

/**
 * 카드 삭제
 * @param cardId - 삭제할 카드 ID
 */
export function deleteCard(cardId: string): void {
  const cardIndex = cards.findIndex((c) => c.id === cardId)
  if (cardIndex === -1) return

  const deletedCard = cards[cardIndex]
  cards.splice(cardIndex, 1)

  // 같은 컬럼 내 카드들의 order 재정렬
  const columnCards = cards.filter((c) => c.columnId === deletedCard.columnId)
  columnCards.sort((a, b) => a.order - b.order)
  columnCards.forEach((c, index) => {
    c.order = index
  })
}

/**
 * 카드 위치 업데이트
 * @param cardId - 업데이트할 카드 ID
 * @param columnId - 새로운 컬럼 ID
 * @param order - 새로운 순서
 * @returns 이동된 카드 DTO, 카드가 없으면 null
 */
export function updateCardPosition(cardId: string, columnId: string, order: number): CardDTO | null {
  const cardIndex = cards.findIndex((card) => card.id === cardId)
  if (cardIndex === -1) return null

  const card = cards[cardIndex]
  const oldColumnId = card.columnId
  const isSameColumn = oldColumnId === columnId

  if (isSameColumn) {
    // 같은 컬럼 내에서 순서 변경
    const columnCards = cards.filter((c) => c.columnId === columnId)
    columnCards.sort((a, b) => a.order - b.order)

    // 이동할 카드를 제거
    const oldIndex = columnCards.findIndex((c) => c.id === cardId)
    if (oldIndex === -1) return null

    const [movedCard] = columnCards.splice(oldIndex, 1)
    // 새 위치에 삽입
    columnCards.splice(order, 0, movedCard)

    // order 재정렬
    columnCards.forEach((c, index) => {
      c.order = index
    })

    card.updatedAt = new Date().toISOString()
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
}
