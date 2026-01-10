import type { FetchColumnsRes } from '@/features/board/types.ts'

export const fetchColumns = async (): Promise<FetchColumnsRes> => {
  try {
    const res = await fetch('/api/columns')

    if (!res.ok) throw new Error('fetchColumns failed')

    return await res.json()
  } catch (err) {
    console.error('fetchColumns fetch error:', err)
    return { data: [] }
  }
}

/**
 * 컬럼 생성 API
 * @param title - 생성할 컬럼 제목
 */
export const createColumn = async (title: string): Promise<void> => {
  try {
    const res = await fetch('/api/columns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    })

    if (!res.ok) throw new Error('createColumn failed')
  } catch (err) {
    console.error('createColumn fetch error:', err)
    throw err
  }
}

/**
 * 카드 위치 업데이트 API
 * @param cardId - 업데이트할 카드 ID
 * @param columnId - 새로운 컬럼 ID
 * @param order - 새로운 순서
 */
export const updateCardPosition = async (
  cardId: string,
  columnId: string,
  order: number
): Promise<void> => {
  try {
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

    if (!res.ok) throw new Error('updateCardPosition failed')
  } catch (err) {
    console.error('updateCardPosition fetch error:', err)
    throw err
  }
}