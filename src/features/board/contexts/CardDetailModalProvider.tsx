import { useState, useMemo, useCallback, type ReactNode } from 'react'
import {
  CardDetailModalActionsContext,
  CardDetailModalStateContext,
} from './cardDetailModalContext.ts'
import type { CardType } from '@/features/board/types.ts'

interface CardDetailModalProviderProps {
  children: ReactNode
}

export const CardDetailModalProvider = ({ children }: CardDetailModalProviderProps) => {
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null)

  const isOpen = selectedCard !== null

  const openModal = useCallback((card: CardType) => {
    setSelectedCard(card)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedCard(null)
  }, [])

  // State Context: ModalCardDetail 컴포넌트에서 사용
  const stateValue = useMemo(
    () => ({
      isOpen,
      selectedCard,
    }),
    [isOpen, selectedCard]
  )

  /**
   * Actions Context
   * openModal - Card 컴포넌트에서 사용
   * closeModal - ModalCardDetail 컴포넌트에서 사용
   * */
  const actionsValue = useMemo(
    () => ({
      openModal,
      closeModal,
    }),
    [openModal, closeModal]
  )

  return (
    <CardDetailModalActionsContext.Provider value={actionsValue}>
      <CardDetailModalStateContext.Provider value={stateValue}>
        {children}
      </CardDetailModalStateContext.Provider>
    </CardDetailModalActionsContext.Provider>
  )
}
