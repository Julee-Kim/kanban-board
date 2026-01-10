import { http, HttpResponse } from 'msw'
import { getColumnsWithCards, updateCardPosition } from './services/columns.service'

export const handlers = [
  http.get('/api/columns', () => {
    return HttpResponse.json(getColumnsWithCards())
  }),

  http.patch('/api/cards/:id', async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as { column_id: string; order: number }
    
    updateCardPosition(id as string, body.column_id, body.order)
    
    return HttpResponse.json({ success: true })
  }),
]
