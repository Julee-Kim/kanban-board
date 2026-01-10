import { http, HttpResponse } from 'msw'
import { updateCardPosition } from '../services/cards.service'

export const cardsHandlers = [
  http.patch('/api/cards/:id', async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as { column_id: string; order: number }

    updateCardPosition(id as string, body.column_id, body.order)

    return HttpResponse.json({ success: true })
  }),
]
