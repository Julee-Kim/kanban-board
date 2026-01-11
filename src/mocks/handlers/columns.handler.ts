import { http, HttpResponse } from 'msw'
import { simulateNetworkDelay } from '../utils/delay'
import {
  getColumnsWithCards,
  createColumn,
  updateColumnTitle,
  deleteColumn,
} from '../services/columns.service'

export const columnsHandlers = [
  http.get('/api/columns', async () => {
    await simulateNetworkDelay()
    return HttpResponse.json(getColumnsWithCards())
  }),

  http.post('/api/columns', async ({ request }) => {
    await simulateNetworkDelay()
    const body = (await request.json()) as { title: string }
    createColumn(body.title)
    return HttpResponse.json({ success: true })
  }),

  http.patch('/api/columns/:id', async ({ params, request }) => {
    await simulateNetworkDelay()
    const { id } = params
    const body = (await request.json()) as { title: string }

    const success = updateColumnTitle(id as string, body.title)

    if (!success) {
      return HttpResponse.json({ error: 'Column not found' }, { status: 404 })
    }

    return HttpResponse.json({ success: true })
  }),

  http.delete('/api/columns/:id', async ({ params }) => {
    await simulateNetworkDelay()
    const { id } = params

    const success = deleteColumn(id as string)

    if (!success) {
      return HttpResponse.json({ error: 'Column not found' }, { status: 404 })
    }

    return HttpResponse.json({ success: true })
  }),
]
