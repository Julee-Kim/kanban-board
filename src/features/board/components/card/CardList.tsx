import type { CardType } from '@/features/board/types.ts'
import Card from '@/features/board/components/card/Card.tsx'
import styles from './CardList.module.css'

interface CardListProps {
  cards: CardType[]
}

const CardList = ({ cards = [] }: CardListProps) => {
  return (
    <ul className={styles.columnList}>
      {cards.length === 0 ? (
        <p className={styles.emptyText}>카드를 추가해보세요.</p>
      ) : (
        cards.map((card) => <Card key={card.id} card={card} />)
      )}
    </ul>
  )
}

export default CardList
