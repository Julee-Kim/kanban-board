import type { CardType } from '@/features/board/types.ts'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCardDetailModalActions } from '@/features/board/contexts/useCardDetailModal.ts'
import PButton from '@/components/PButton.tsx'
import styles from '@/features/board/components/Card.module.css'

interface CardProps {
  card: CardType
}

const Card = ({ card }: CardProps) => {
  const { openModal } = useCardDetailModalActions()

  const {
    attributes, // 접근성 속성
    listeners, // 드래그 시작 이벤트
    setNodeRef, // 드래그 가능한 요소 등록
    transform, // 드래그 중 위치 변환
    transition, // 애니메이션 전환
    isDragging, // 드래그 중 여부
  } = useSortable({
    id: card.id,
  })

  // 드래그 중 스타일 (위치 이동, 애니메이션, 반투명)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleClickCard = (e: React.MouseEvent) => {
    e.stopPropagation() // 드래그 이벤트와 충돌 방지
    openModal(card)
  }

  return (
    <li
      ref={setNodeRef} // 드래그 가능한 요소로 등록
      style={style}
      className={styles.card}
      {...attributes} // 접근성 속성
      {...listeners} // 드래그 시작 이벤트
    >
      <PButton className={styles.cardContent} onClick={handleClickCard}>
        {card.title}
      </PButton>
    </li>
  )
}

export default Card
