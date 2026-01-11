import { handleApiError } from './error'

/**
 * 카드 생성 API
 * @param columnId - 카드를 추가할 컬럼 ID
 * @param title - 카드 제목
 */
export const createCard = async (columnId: string, title: string): Promise<void> => {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ column_id: columnId, title }),
  })

  if (!res.ok) await handleApiError(res, '카드 생성에 실패했습니다.')
}

/**
 * 카드 내용 수정 API
 * @param cardId - 수정할 카드 ID
 * @param title - 새로운 제목
 * @param description - 새로운 설명
 */
export const updateCard = async (cardId: string, title: string, description: string): Promise<void> => {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  })

  if (!res.ok) await handleApiError(res, '카드 수정에 실패했습니다.')
}

/**
 * 카드 위치 업데이트 API
 * @param cardId - 업데이트할 카드 ID
 * @param columnId - 새로운 컬럼 ID
 * @param order - 새로운 순서
 */
export const updateCardPosition = async (cardId: string, columnId: string, order: number): Promise<void> => {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      column_id: columnId,
      order,
    }),
  })

  if (!res.ok) await handleApiError(res, '카드 이동에 실패했습니다.')
}

/**
 * 카드 삭제 API
 * @param cardId - 삭제할 카드 ID
 */
export const deleteCard = async (cardId: string): Promise<void> => {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'DELETE',
  })

  if (!res.ok) await handleApiError(res, '카드 삭제에 실패했습니다.')
}
