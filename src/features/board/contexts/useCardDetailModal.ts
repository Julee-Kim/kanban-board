import { useContext } from 'react'
import {
  CardDetailModalStateContext,
  CardDetailModalActionsContext,
  type CardDetailModalStateType,
  type CardDetailModalActionsType,
} from './cardDetailModalContext.ts'

// isOpen, selectedCard: ModalCardDetail 컴포넌트 사용
export const useCardDetailModalState = (): CardDetailModalStateType => {
  const context = useContext(CardDetailModalStateContext)
  if (!context) {
    throw new Error(
      'useCardDetailModalState는 CardDetailModalProvider 내부에서만 사용할 수 있습니다.'
    )
  }
  return context
}

// openModal: Card 컴포넌트 사용
// closeModal: ModalCardDetail 컴포넌트 사용
export const useCardDetailModalActions = (): CardDetailModalActionsType => {
  const context = useContext(CardDetailModalActionsContext)
  if (!context) {
    throw new Error(
      'useCardDetailModalActions는 CardDetailModalProvider 내부에서만 사용할 수 있습니다.'
    )
  }
  return context
}
