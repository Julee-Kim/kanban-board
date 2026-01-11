export interface CardType {
  id: string // UUID 형식 권장 (예: "card_x1y2z3")
  column_id: string // 소속 컬럼 ID
  title: string // 카드 제목, 1~100자
  description: string // 카드 설명, 0~1000자
  due_date: string | null // 마감일, ISO 8601 형식 또는 null
  order: number // 컬럼 내 정렬 순서, 0부터 시작
  created_at: string // 생성일, ISO 8601 형식
  updated_at: string | null // 수정일, ISO 8601 형식 또는 null
}

export interface ColumnType {
  id: string // UUID 형식 권장 (예: "col_a1b2c3d4")
  title: string // 컬럼 제목, 1~50자
  order: number // 정렬 순서, 0부터 시작
  cards: CardType[]
  created_at: string // ISO 8601 형식 (예: "2025-01-10T09:00:00Z")
}

export interface FetchColumnsRes {
  data: ColumnType[]
}

export interface CardRes {
  data: CardType
}

export interface DeleteCardRes {
  data: { success: boolean }
}

export interface ColumnRes {
  data: Omit<ColumnType, 'cards'>
}

export interface DeleteColumnRes {
  data: {
    success: boolean
    deleted_cards_count: number
  }
}
