import { http, HttpResponse } from 'msw'
import { simulateNetworkDelay } from '../utils/delay'
import { createCard, updateCard, updateCardPosition, deleteCard } from '../services/cards.service'

interface CreateCardBody {
  column_id: string
  title: string
}

interface UpdateCardBody {
  title?: string
  description?: string
}

interface MoveCardBody {
  target_column_id: string
  new_order: number
}

export const cardsHandlers = [
  http.post('/api/cards', async ({ request }) => {
    await simulateNetworkDelay()
    const body = (await request.json()) as CreateCardBody

    // 유효성 검사: 제목 누락 또는 길이 초과
    if (!body.title?.trim() || body.title.length > 100) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '카드 제목은 1~100자 이내로 입력해주세요.' } },
        { status: 400 }
      )
    }

    const newCard = createCard(body.column_id, body.title)
    return HttpResponse.json({ data: newCard }, { status: 201 })
  }),

  http.patch('/api/cards/:id', async ({ params, request }) => {
    await simulateNetworkDelay()
    const { id } = params
    const body = (await request.json()) as UpdateCardBody

    const updatedCard = updateCard(id as string, body.title ?? '', body.description ?? '')

    if (!updatedCard) {
      return HttpResponse.json(
        { error: { code: 'CARD_NOT_FOUND', message: '카드를 찾을 수 없습니다.' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: updatedCard })
  }),

  http.patch('/api/cards/:id/move', async ({ params, request }) => {
    await simulateNetworkDelay()
    const { id } = params
    const body = (await request.json()) as MoveCardBody

    const movedCard = updateCardPosition(id as string, body.target_column_id, body.new_order)

    if (!movedCard) {
      return HttpResponse.json(
        { error: { code: 'CARD_NOT_FOUND', message: '카드를 찾을 수 없습니다.' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ data: movedCard })
  }),

  http.delete('/api/cards/:id', async ({ params }) => {
    await simulateNetworkDelay()
    const { id } = params
    deleteCard(id as string)
    return HttpResponse.json({ data: { success: true } })
  }),
]
