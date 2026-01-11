import type { MouseEvent } from 'react'
import type { CardType } from '@/features/board/types.ts'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { useCardDetailModalActions } from '@/features/board/contexts/useCardDetailModal.ts'
import PButton from '@/components/PButton.tsx'
import styles from '@/features/board/components/card/Card.module.css'

interface CardProps {
  card: CardType
}

const Card = ({ card }: CardProps) => {
  const { openModal } = useCardDetailModalActions()

  /**
   * 드래그 가능한 카드
   * - attributes: 접근성을 위한 ARIA 속성 (role, aria-describedby 등)
   * - listeners: 드래그 시작을 감지하는 이벤트 핸들러 (onPointerDown 등)
   * - isDragging: 현재 이 카드가 드래그 중인지 여부 (true/false)
   */
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: card.id,
  })

  // 드롭 가능한 카드 (다른 카드를 이 카드 위에 놓을 수 있음)
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: card.id,
  })

  // 두 ref를 하나의 DOM 요소에 연결 (드래그도 되고 드롭 대상도 되는 카드)
  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node)
    setDroppableRef(node)
  }

  const handleClickCard = (e: MouseEvent) => {
    e.stopPropagation() // 드래그 이벤트와 충돌 방지
    openModal(card)
  }

  return (
    <li
      ref={setNodeRef}
      className={styles.card}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      {...attributes}
      {...listeners}
    >
      <PButton className={styles.cardContent} onClick={handleClickCard}>
        {card.title}
      </PButton>
    </li>
  )
}

export default Card
