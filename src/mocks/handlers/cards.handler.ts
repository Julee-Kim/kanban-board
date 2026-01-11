import { http, HttpResponse } from 'msw'
import { updateCard, updateCardPosition } from '../services/cards.service'

interface UpdateCardBody {
  title?: string
  description?: string
  column_id?: string
  order?: number
}

export const cardsHandlers = [
  http.patch('/api/cards/:id', async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as UpdateCardBody

    // 카드 내용 수정 (title, description)
    if (body.title !== undefined) {
      updateCard(id as string, body.title, body.description ?? '')
    }

    // 카드 위치 변경 (column_id, order)
    if (body.column_id !== undefined && body.order !== undefined) {
      updateCardPosition(id as string, body.column_id, body.order)
    }

    return HttpResponse.json({ success: true })
  }),
]
