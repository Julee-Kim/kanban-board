/**
 * 카드 내용 수정 API
 * @param cardId - 수정할 카드 ID
 * @param title - 새로운 제목
 * @param description - 새로운 설명
 */
export const updateCard = async (
  cardId: string,
  title: string,
  description: string
): Promise<void> => {
  try {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    })

    if (!res.ok) throw new Error('updateCard failed')
  } catch (err) {
    console.error('updateCard fetch error:', err)
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
