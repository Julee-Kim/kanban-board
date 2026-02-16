/**
 * 드래그 앤 드롭 칸반 보드 - 통합 구현
 * 구조: 타입 정의 → 헬퍼 함수 → 커스텀 훅 → UI 컴포넌트
 * 실무에서는 파일을 분리하지만, 코드 제출을 위해 통합했습니다.
 */

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 카드 데이터 타입
interface Card {
  id: string // 카드 고유 ID
  title: string // 카드 제목
  description: string // 카드 설명
  column_id: string // 소속 컬럼 ID
  order: number // 컬럼 내 정렬 순서
  due_date: string | null // 마감일
  created_at: string // 생성일
  updated_at: string // 수정일
}

// 컬럼 데이터 타입
interface Column {
  id: string // 컬럼 고유 ID
  title: string // 컬럼 제목
  order: number // 컬럼 정렬 순서
  cards: Card[] // 컬럼에 속한 카드 목록
  created_at: string // 생성일
  updated_at: string // 수정일
}

// 컬럼 목록 API 응답 타입
interface FetchColumnsResponse {
  data: Column[]
}

// ============================================
// 헬퍼 함수 (순수 함수로 비즈니스 로직 분리)
// ============================================

/**
 * 카드 ID로 카드 찾기
 * @param cardId - 찾을 카드의 ID
 * @param columns - 검색할 컬럼 배열
 * @returns 찾은 카드 또는 null
 */
const findCardById = (cardId: string, columns: Column[]): Card | null => {
  for (const column of columns) {
    const card = column.cards.find((c) => c.id === cardId)
    if (card) return card
  }
  return null
}

/**
 * 카드 배열 내에서 특정 카드를 다른 위치로 재정렬
 * @param cards - 정렬 대상 카드 배열
 * @param activeId - 현재 드래그 중인 카드 ID
 * @param overId - 드롭 대상 카드 ID (이 위치로 이동)
 * @returns 재정렬된 카드 배열 (변경이 없으면 기존 배열 반환)
 */
const reorderCards = (cards: Card[], activeId: string, overId: string): Card[] => {
  const copied = [...cards]

  // 드래그 중인 카드의 현재 인덱스
  const activeIndex = copied.findIndex((c) => c.id === activeId)

  // 드롭 대상 카드의 인덱스 (이 위치로 이동)
  const overIndex = copied.findIndex((c) => c.id === overId)

  // 유효하지 않은 인덱스이거나 같은 위치면 업데이트 안 함
  if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
    return cards
  }

  // 배열에서 카드 제거 후 새 위치에 삽입
  const [moved] = copied.splice(activeIndex, 1)
  copied.splice(overIndex, 0, moved)

  // order 필드를 배열 인덱스에 맞게 업데이트
  const updatedCards = copied.map((card, index) => ({
    ...card,
    order: index,
  }))

  return updatedCards
}

/**
 * 같은 컬럼 내에서 카드 순서 변경
 * @param columns - 전체 컬럼 배열
 * @param columnId - 카드가 속한 컬럼 ID
 * @param activeId - 드래그 중인 카드 ID
 * @param overId - 드롭 대상 카드 ID
 * @returns 업데이트된 컬럼 배열
 */
const reorderCardsInColumnHelper = (
  columns: Column[],
  columnId: string,
  activeId: string,
  overId: string
): Column[] => {
  return columns.map((column) => {
    // 카드가 속한 대상 컬럼이 아니면 그대로 반환
    if (column.id !== columnId) return column

    return {
      ...column,
      cards: reorderCards(column.cards, activeId, overId),
    }
  })
}

/**
 * 다른 컬럼에 카드 추가 (특정 위치에 삽입 가능)
 * @param column - 도착 컬럼
 * @param cardToMove - 이동할 카드
 * @param cardId - 이동할 카드 ID
 * @param insertAtCardId - 이 카드 위치에 삽입 (없으면 맨 끝에 추가)
 * @returns 업데이트된 컬럼
 */
const addCardToColumn = (
  column: Column,
  cardToMove: Card,
  cardId: string,
  insertAtCardId?: string
): Column => {
  let insertIndex = column.cards.length // 삽입 위치 (기본값: 맨 끝)

  // 1. 특정 카드의 위치에 삽입 (그 카드를 밀어내고 그 자리에 삽입)
  if (insertAtCardId) {
    const targetIndex = column.cards.findIndex((card) => card.id === insertAtCardId)
    if (targetIndex !== -1) {
      insertIndex = targetIndex
    }
  }

  const existingIndex = column.cards.findIndex((card) => card.id === cardId) // 드롭한 카드가 목표 컬럼에 이미 존재하는지 확인
  const newCards = [...column.cards]

  // 2. 카드가 이미 존재하면 먼저 제거 및 조기 반환 체크
  if (existingIndex !== -1) {
    // 2-1. 제거 후 삽입 위치를 조정하여 실제 삽입될 위치 계산
    const adjustedInsertIndex = existingIndex < insertIndex ? insertIndex - 1 : insertIndex

    // 2-2. 이미 올바른 위치에 있으면 변경 불필요 (조기 반환으로 중복 작업 방지)
    if (existingIndex === adjustedInsertIndex) {
      return column
    }

    // 2-3. 기존 카드 제거 및 삽입 위치 보정
    newCards.splice(existingIndex, 1)
    if (existingIndex < insertIndex) {
      insertIndex--
    }
  }

  // 3. 카드를 새 위치에 삽입
  const movedCard: Card = { ...cardToMove, column_id: column.id, order: insertIndex }
  newCards.splice(insertIndex, 0, movedCard)

  // 4. order 재정렬
  const updatedCards = newCards.map((card, index) => ({
    ...card,
    order: index,
  }))

  return { ...column, cards: updatedCards }
}

/**
 * 카드를 다른 컬럼으로 이동
 * @param columns - 컬럼 배열
 * @param cardId - 이동할 카드 ID
 * @param fromColumnId - 출발 컬럼 ID
 * @param toColumnId - 도착 컬럼 ID
 * @param insertAtCardId - 이 카드 위치에 삽입 (없으면 맨 끝에 추가)
 * @returns 새로운 컬럼 배열
 */
const moveCardToColumnHelper = (
  columns: Column[],
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  insertAtCardId?: string
): Column[] => {
  // 출발 컬럼과 도착 컬럼이 같으면 이동할 필요 없으므로 원본 그대로 반환
  if (fromColumnId === toColumnId) return columns

  // 전체 컬럼에서 이동 대상 카드를 탐색, 존재하지 않으면 원본 그대로 반환
  const cardToMove = findCardById(cardId, columns)
  if (!cardToMove) return columns

  // 출발 컬럼에서 카드 제거
  const columnsWithoutCard = columns.map((column) => {
    if (column.id === fromColumnId) {
      return {
        ...column,
        cards: column.cards
          .filter((card) => card.id !== cardId)
          .map((card, index) => ({ ...card, order: index })),
      }
    }
    return column
  })

  // 도착 컬럼에 카드 추가
  return columnsWithoutCard.map((column) => {
    if (column.id === toColumnId) {
      return addCardToColumn(column, cardToMove, cardId, insertAtCardId)
    }
    return column
  })
}

// ============================================
// 커스텀 훅 (드래그 앤 드롭 상태 관리)
// ============================================

/**
 * 카드 드래그 앤 드롭 로직을 관리하는 커스텀 훅
 *
 * 설계 의도:
 * - 컴포넌트와 비즈니스 로직을 분리하여 테스트 용이성과 재사용성 향상
 * - 드래그 중에는 로컬 상태로 빠른 UI 업데이트 (사용자 경험 개선)
 * - 드래그 완료 시 서버 API 호출 및 낙관적 업데이트
 * - 에러 발생 시 이전 상태로 자동 롤백하여 데이터 일관성 유지
 *
 * 상태 관리 전략:
 * 1. 평상시: serverColumns (서버에서 가져온 실제 데이터) 표시
 * 2. 드래그 중: localColumns (임시 상태)로 빠르게 UI 업데이트
 * 3. 드래그 완료: API 호출 후 성공 시 localColumns를 캐시에 반영, 실패 시 롤백
 *
 * @param serverColumns - 서버에서 가져온 실제 데이터
 * @returns 드래그 앤 드롭에 필요한 상태와 핸들러들
 */
const useCardDragAndDrop = (serverColumns: Column[]) => {
  const queryClient = useQueryClient()

  // 드래그 중 임시 상태 (로컬에서만 빠르게 업데이트)
  const [localColumns, setLocalColumns] = useState<Column[] | null>(null)
  // 드래그 중인 카드 정보
  const [activeCard, setActiveCard] = useState<Card | null>(null)

  // 표시할 컬럼: 드래그 중이면 localColumns, 아니면 serverColumns
  const columns = localColumns ?? serverColumns

  // 드래그 센서 설정 (8px 이동해야 드래그 시작, ESC 키로 취소 가능)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // 카드 이동 API 호출 mutation
  const moveCardMutation = useMutation({
    mutationFn: async ({
      cardId,
      targetColumnId,
      newOrder,
    }: {
      cardId: string
      targetColumnId: string
      newOrder: number
    }) => {
      // 실제 환경에서는 API 호출 (예: fetch('/api/cards/move', ...))
      return { cardId, targetColumnId, newOrder }
    },
    onMutate: async () => {
      // mutation 시작 전 실행: 이전 데이터 백업 (롤백용)
      await queryClient.cancelQueries({ queryKey: ['columns'] })
      const previousData = queryClient.getQueryData(['columns'])
      return { previousData }
    },
    onSuccess: () => {
      // 성공 시: 로컬 상태를 캐시에 반영하여 서버 응답 기다리지 않고 UI 업데이트 완료
      if (localColumns) {
        queryClient.setQueryData(['columns'], { data: localColumns })
      }
      setLocalColumns(null)
    },
    onError: (_error, _variables, context) => {
      // 실패 시: 이전 상태로 롤백하여 데이터 일관성 유지
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
      setLocalColumns(null)
    },
  })

  /**
   * 같은 컬럼 내에서 카드 순서 변경
   * @param columnId - 카드가 속한 컬럼 ID
   * @param activeId - 드래그 중인 카드 ID (이동할 카드)
   * @param overId - 드롭 대상 카드 ID (이 카드의 위치로 이동)
   */
  const reorderCardsInColumn = (columnId: string, activeId: string, overId: string) => {
    setLocalColumns((prevColumns) => {
      if (!prevColumns) return null
      return reorderCardsInColumnHelper(prevColumns, columnId, activeId, overId)
    })
  }

  /**
   * 카드를 다른 컬럼으로 이동
   * @param cardId - 이동할 카드 ID
   * @param fromColumnId - 출발 컬럼 ID
   * @param toColumnId - 도착 컬럼 ID
   * @param insertAtCardId - 이 카드 위치에 삽입 (없으면 맨 끝에 추가)
   */
  const moveCardToColumn = (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    insertAtCardId?: string
  ) => {
    setLocalColumns((prevColumns) => {
      if (!prevColumns) return null
      return moveCardToColumnHelper(prevColumns, cardId, fromColumnId, toColumnId, insertAtCardId)
    })
  }

  /**
   * 드래그 시작 시 로컬 상태 초기화
   * @param event - 드래그 시작 이벤트 (active: 드래그 중인 요소 정보)
   */
  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string
    // 드래그 시작 시 서버 데이터를 로컬 상태로 복사
    const initialColumns = [...serverColumns]
    setLocalColumns(initialColumns)

    // 드래그 중인 카드 정보 저장
    const card = findCardById(cardId, initialColumns)
    setActiveCard(card)
  }

  /**
   * 드래그 오버 시 로컬 상태만 업데이트 (빠른 UI 반응을 위해)
   * @param event - 드래그 오버 이벤트 (active: 드래그 중인 요소, over: 마우스가 올라간 대상)
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event

    if (!over || !localColumns || !activeCard) return

    // 현재 카드의 실제 위치 확인
    const currentCard = findCardById(activeCard.id, localColumns)
    if (!currentCard) return

    // 마우스가 올라간 대상 확인
    const overCard = findCardById(over.id as string, localColumns)
    const overColumn = localColumns.find((col) => col.id === over.id)

    // 실제 위치 업데이트
    if (overCard) {
      if (currentCard.column_id === overCard.column_id && activeCard.id !== over.id) {
        // case 1. 같은 컬럼 내에서 다른 카드 위로 드래그
        reorderCardsInColumn(currentCard.column_id, activeCard.id, over.id as string)
      } else if (currentCard.column_id !== overCard.column_id) {
        // case 2. 다른 컬럼의 카드 위로 드래그
        moveCardToColumn(activeCard.id, currentCard.column_id, overCard.column_id, overCard.id)
      }
    } else if (overColumn && currentCard.column_id !== overColumn.id) {
      // case 3. 다른 컬럼의 빈 공간 위로 드래그
      moveCardToColumn(activeCard.id, currentCard.column_id, overColumn.id)
    }
  }

  /**
   * 드래그 종료 핸들러
   * 최종 위치를 확인하여 변경이 있으면 API 호출, 없으면 로컬 상태만 리셋
   * @param event - 드래그 종료 이벤트 (over: 드롭된 대상)
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event

    // 유효하지 않은 드롭인 경우 로컬 상태 리셋
    if (!over || !localColumns || !activeCard) {
      setLocalColumns(null)
      setActiveCard(null)
      return
    }

    // 드래그된 카드의 최종 위치 확인
    const finalCard = findCardById(activeCard.id, localColumns)
    if (!finalCard) {
      setLocalColumns(null)
      setActiveCard(null)
      return
    }

    // 드래그 종료 즉시 activeCard 리셋 (드래그 오버레이 제거)
    setActiveCard(null)

    // 원래 위치와 다른 경우에만 API 호출
    const originalCard = findCardById(activeCard.id, serverColumns)
    if (
      originalCard &&
      (originalCard.column_id !== finalCard.column_id || originalCard.order !== finalCard.order)
    ) {
      // 서버에 변경사항 전송
      moveCardMutation.mutate({
        cardId: finalCard.id,
        targetColumnId: finalCard.column_id,
        newOrder: finalCard.order,
      })
    } else {
      // 위치가 변경되지 않았으면 로컬 상태만 리셋
      setLocalColumns(null)
    }
  }

  return {
    columns,
    activeCard,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}

// ============================================
// UI 컴포넌트 (뷰 로직)
// ============================================

// 카드 컴포넌트 (드래그 가능한 카드)
const Card = ({ card }: { card: Card }) => {
  // 드래그 가능한 카드
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

  // 두 ref를 하나의 DOM 요소에 연결
  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node)
    setDroppableRef(node)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: 'grab' }}
      {...attributes}
      {...listeners}
    >
      {card.title}
    </div>
  )
}

// 컬럼 컴포넌트 (카드 리스트 포함)
const Column = ({ column }: { column: Column }) => {
  // 컬럼을 드롭 가능한 영역으로 설정 (빈 컬럼에도 카드를 드롭할 수 있도록)
  const { setNodeRef } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        minWidth: '300px',
        background: '#f5f5f5',
        padding: '16px',
      }}
    >
      <h3>{column.title}</h3>
      <div>
        {column.cards.length === 0 ? (
          <p>카드가 없습니다</p>
        ) : (
          column.cards.map((card) => <Card key={card.id} card={card} />)
        )}
      </div>
    </div>
  )
}

// 컬럼 리스트 컴포넌트
const ColumnList = ({ columns }: { columns: Column[] }) => {
  return (
    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
      {columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
    </div>
  )
}

/**
 * 칸반 보드 페이지
 * DndContext로 전체 드래그 앤 드롭 컨텍스트를 제공하고, useCardDragAndDrop 훅으로 드래그 로직을 처리합니다.
 *
 * 데이터 흐름:
 * 1. useQuery로 서버에서 데이터 fetch
 * 2. useCardDragAndDrop에 서버 데이터 전달
 * 3. 드래그 중에는 로컬 상태로 빠르게 UI 업데이트
 * 4. 드래그 완료 시 API 호출 및 낙관적 업데이트
 */
const KanbanBoardPage = () => {
  const { data, isLoading, isError } = useQuery<FetchColumnsResponse>({
    queryKey: ['columns'],
    queryFn: async () => {
      const res = await fetch('/api/columns')
      return await res.json()
    }
  })

  const serverColumns = data?.data ?? []

  // 드래그 앤 드롭 로직 커스텀 훅
  const { columns, activeCard, sensors, handleDragStart, handleDragOver, handleDragEnd } =
    useCardDragAndDrop(serverColumns)

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>로딩 중...</div>
  }

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>데이터를 불러오는데 실패했습니다.</div>
    )
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ColumnList columns={columns} />

        {/* 드래그 중인 카드 오버레이 */}
        <DragOverlay>{activeCard ? <Card card={activeCard} /> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}

export default KanbanBoardPage
