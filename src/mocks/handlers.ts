import { http, HttpResponse } from 'msw'
import { getColumnsWithCards } from './services/columns.service'

export const handlers = [
  http.get('/api/columns', () => {
    return HttpResponse.json(getColumnsWithCards())
  }),
]
