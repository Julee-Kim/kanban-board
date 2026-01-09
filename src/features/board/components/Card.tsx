import type { CardType } from '@/features/board/types.ts'
import styles from '@/features/board/components/Card.module.css'

interface CardProps {
  card: CardType
}

const Card = ({ card }: CardProps) => {
  return (
    <li className={styles.card}>
      <button type="button" className={styles.cardContent}>
        {card.title}
      </button>
    </li>
  )
}

export default Card
