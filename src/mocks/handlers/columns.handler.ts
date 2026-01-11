import { http, HttpResponse } from 'msw'
import {
  getColumnsWithCards,
  createColumn,
  updateColumnTitle,
  deleteColumn,
} from '../services/columns.service'

export const columnsHandlers = [
  http.get('/api/columns', () => {
    return HttpResponse.json(getColumnsWithCards())
  }),

  http.post('/api/columns', async ({ request }) => {
    const body = (await request.json()) as { title: string }
    createColumn(body.title)
    return HttpResponse.json({ success: true })
  }),

  http.patch('/api/columns/:id', async ({ params, request }) => {
    const { id } = params
    const body = (await request.json()) as { title: string }

    const success = updateColumnTitle(id as string, body.title)

    if (!success) {
      return HttpResponse.json({ error: 'Column not found' }, { status: 404 })
    }

    return HttpResponse.json({ success: true })
  }),

  http.delete('/api/columns/:id', ({ params }) => {
    const { id } = params

    const success = deleteColumn(id as string)

    if (!success) {
      return HttpResponse.json({ error: 'Column not found' }, { status: 404 })
    }

    return HttpResponse.json({ success: true })
  }),
]
