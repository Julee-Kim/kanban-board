// src/mocks/data.ts
export const initialColumns = [
  { id: 'col_001', title: 'To Do', order: 0, createdAt: '2025-01-02T09:00:00Z' },
  { id: 'col_002', title: 'In Progress', order: 1, createdAt: '2025-01-02T09:00:00Z' },
  { id: 'col_003', title: 'Done', order: 2, createdAt: '2025-01-02T09:00:00Z' },
]

export const initialCards = [
  {
    id: 'card_001',
    columnId: 'col_001',
    title: '프로젝트 요구사항 분석',
    description: '클라이언트 미팅 내용을 바탕으로 요구사항 문서 작성',
    dueDate: '2025-01-15T00:00:00Z',
    order: 0,
    createdAt: '2025-01-03T10:00:00Z',
    updatedAt: null,
  },
  {
    id: 'card_002',
    columnId: 'col_001',
    title: '기술 스택 검토',
    description: '',
    dueDate: null,
    order: 1,
    createdAt: '2025-01-04T14:30:00Z',
    updatedAt: '2025-01-05T09:00:00Z',
  },
  {
    id: 'card_003',
    columnId: 'col_002',
    title: '와이어프레임 작성',
    description: 'Figma를 사용하여 주요 화면 와이어프레임 작성',
    dueDate: '2025-01-12T00:00:00Z',
    order: 0,
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-06T11:20:00Z',
  },
  {
    id: 'card_004',
    columnId: 'col_003',
    title: '개발 환경 세팅',
    description: 'Vite + React + TypeScript 프로젝트 초기 설정 완료',
    dueDate: null,
    order: 0,
    createdAt: '2025-01-02T15:00:00Z',
    updatedAt: null,
  },
  {
    id: 'card_005',
    columnId: 'col_999',
    title: '레거시 데이터 정리',
    description: '이전 프로젝트에서 마이그레이션된 태스크',
    dueDate: '2025-01-05T00:00:00Z',
    order: 0,
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: null,
  },
]
