import type { CardType } from '@/features/board/types.ts'
import { useCardDetailModalActions } from '@/features/board/contexts/useCardDetailModal.ts'
import PButton from '@/components/PButton.tsx'
import styles from '@/features/board/components/Card.module.css'

interface CardProps {
  card: CardType
}

const Card = ({ card }: CardProps) => {
  const { openModal } = useCardDetailModalActions()

  return (
    <li className={styles.card}>
      <PButton className={styles.cardContent} onClick={() => openModal(card)}>
        {card.title}
      </PButton>
    </li>
  )
}

export default Card
