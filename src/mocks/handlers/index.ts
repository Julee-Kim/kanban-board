import { columnsHandlers } from './columns.handler'
import { cardsHandlers } from './cards.handler'

export const handlers = [...columnsHandlers, ...cardsHandlers]
