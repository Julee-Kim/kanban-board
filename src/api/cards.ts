import type { CardRes, DeleteCardRes } from '@/features/board/types.ts'
import { handleApiError } from './error'

/**
 * 카드 생성 API
 * @param columnId - 카드를 추가할 컬럼 ID
 * @param title - 카드 제목
 */
export const createCard = async (columnId: string, title: string): Promise<CardRes> => {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ column_id: columnId, title }),
  })

  if (!res.ok) await handleApiError(res, '카드 생성에 실패했습니다.')

  return await res.json()
}

/**
 * 카드 내용 수정 API
 * @param cardId - 수정할 카드 ID
 * @param title - 새로운 제목
 * @param description - 새로운 설명
 */
export const updateCard = async (cardId: string, title: string, description: string): Promise<CardRes> => {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  })

  if (!res.ok) await handleApiError(res, '카드 수정에 실패했습니다.')

  return await res.json()
}

/**
 * 카드 이동/순서 변경 API
 * @param cardId - 이동할 카드 ID
 * @param targetColumnId - 대상 컬럼 ID
 * @param newOrder - 새로운 순서
 */
export const moveCard = async (cardId: string, targetColumnId: string, newOrder: number): Promise<CardRes> => {
  const res = await fetch(`/api/cards/${cardId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target_column_id: targetColumnId,
      new_order: newOrder,
    }),
  })

  if (!res.ok) await handleApiError(res, '카드 이동에 실패했습니다.')

  return await res.json()
}

/**
 * 카드 삭제 API
 * @param cardId - 삭제할 카드 ID
 */
export const deleteCard = async (cardId: string): Promise<DeleteCardRes> => {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'DELETE',
  })

  if (!res.ok) await handleApiError(res, '카드 삭제에 실패했습니다.')

  return await res.json()
}
