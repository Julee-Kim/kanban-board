import type { CardType } from '@/features/board/types.ts'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Card from '@/features/board/components/Card.tsx'
import styles from './CardList.module.css'

interface CardListProps {
  cards: CardType[]
}

/**
 * 카드 리스트 컴포넌트
 * SortableContext로 같은 컬럼 내 카드들의 드래그 앤 드롭을 관리
 */
const CardList = ({ cards = [] }: CardListProps) => {
  // 정렬 가능한 카드 ID 목록 (SortableContext에 전달)
  const cardIds = cards.map((card) => card.id)

  return (
    <SortableContext
      items={cardIds} // 정렬 가능한 카드 ID 목록
      strategy={verticalListSortingStrategy} // 세로 방향 정렬
    >
      <ul className={styles.columnList}>
        {cards.length === 0 ? (
          <p className={styles.emptyText}>카드를 추가해보세요.</p>
        ) : (
          cards.map((card) => <Card key={card.id} card={card} />)
        )}
      </ul>
    </SortableContext>
  )
}

export default CardList
