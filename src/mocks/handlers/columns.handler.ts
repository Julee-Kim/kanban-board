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
    const body = (await request.json()) as { title?: string }

    // 유효성 검사: 제목 누락
    if (!body.title?.trim()) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '컬럼 제목은 필수입니다.' } },
        { status: 400 }
      )
    }

    const newColumn = createColumn(body.title)
    return HttpResponse.json({ data: newColumn }, { status: 201 })
  }),

  http.patch('/api/columns/:id', async ({ params, request }) => {
    await simulateNetworkDelay()
    const { id } = params
    const body = (await request.json()) as { title: string }

    const success = updateColumnTitle(id as string, body.title)

    if (!success) {
      return HttpResponse.json(
        { error: { code: 'COLUMN_NOT_FOUND', message: '컬럼을 찾을 수 없습니다.' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: null })
  }),

  http.delete('/api/columns/:id', async ({ params }) => {
    await simulateNetworkDelay()
    const { id } = params

    const success = deleteColumn(id as string)

    if (!success) {
      return HttpResponse.json(
        { error: { code: 'COLUMN_NOT_FOUND', message: '컬럼을 찾을 수 없습니다.' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: null })
  }),
]
