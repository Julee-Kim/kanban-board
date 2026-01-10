import { createContext } from 'react'
import type { CardType } from '@/features/board/types.ts'

// isOpen, selectedCard: ModalCardDetail 컴포넌트 사용
export type CardDetailModalStateType = {
  isOpen: boolean // 모달 노출 여부
  selectedCard: CardType | null // 선택된 카드 정보
}

// openModal: Card 컴포넌트 사용
// closeModal: ModalCardDetail 컴포넌트 사용
export type CardDetailModalActionsType = {
  openModal: (card: CardType) => void // 모달 열기
  closeModal: () => void // 모달 닫기
}

export const CardDetailModalStateContext = createContext<CardDetailModalStateType | null>(null)
export const CardDetailModalActionsContext = createContext<CardDetailModalActionsType | null>(null)
