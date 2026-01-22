# 🌟 Kanban Board

칸반 보드 웹 애플리케이션입니다. 컬럼과 카드를 관리하고, 드래그 앤 드롭으로 작업 흐름을 시각적으로 관리할 수 있습니다.

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 🛠 기술 스택

- **React 19**
- **TypeScript 5.9**
- **Vite 7**
- **MSW 2**
- **TanStack Query 5**
- **dnd-kit 6**
- **Sonner 2**
- **CSS Modules**

## 📦 라이브러리 선택 이유

- **Vite**
  - 간단한 설정 및 빠른 개발서버
  - HMR(Hot Module Replacement) 최적화

- **MSW (Mock Service Worker)**
  - 네트워크 레벨에서 API 모킹
  - 실제 fetch 요청을 가로채서 개발/테스트 환경 일관성 유지
  - 브라우저와 Node.js 환경 모두 지원

- **TanStack Query**
  - 서버 상태 관리에 특화된 라이브러리
  - 캐싱, 로딩/에러 상태 관리 기능 내장
  - 낙관적 업데이트 및 롤백 구현 용이

- **dnd-kit**
  - Headless 라이브러리로 번들 사이즈 절감
  - 가볍고 유연한 API 제공

- **Sonner**
  - 간단한 API로 토스트 알림 구현
  - 별도 스타일링 없이 기본 스타일 그대로 사용 가능

- **CSS Modules**
  - 클래스명 충돌 방지
  - 별도 라이브러리 설치 없이 Vite 기본 지원
  - 런타임 오버헤드 없음



## ✅ 구현 기능

### 1. 컬럼 관리
- 컬럼 조회 (order 기준 정렬)
- 컬럼 생성 (제목 필수, 마지막 순서에 추가)
- 컬럼 수정 (인라인 수정, Enter/포커스아웃 저장)
- 컬럼 삭제 (확인 모달, 카드 함께 삭제 안내)

### 2. 카드 관리
- 카드 생성 (제목 필수)
- 카드 상세 조회 (모달)
  - 마감일 지난 카드 시각적 구분
- 카드 수정 (제목, 설명, 마감일)
  - 변경사항 없으면 저장 버튼 비활성화
- 카드 삭제 (확인 절차)

### 3. 드래그 앤 드롭
- 카드 컬럼 간 이동
- 같은 컬럼 내 순서 변경
- 드래그 시각적 피드백 (반투명 처리)
- ESC 키로 드래그 취소

### 4. 데이터 연동
- MSW를 활용한 Mock API 구현
- 네트워크 지연 시뮬레이션 (200~500ms)
- 캐싱 (staleTime: 1분, gcTime: 5분)
- 낙관적 업데이트 (카드 이동/수정/삭제, 컬럼 수정/삭제)
- 에러 발생 시 롤백

### 5. UI/UX
- 로딩 상태 (스켈레톤 UI)
- 에러 상태 (재시도 버튼)
- 빈 상태 안내 메시지
- 토스트 알림

## 📂 프로젝트 구조

```
src/
├── api/                        # API 함수
│   ├── cards.ts                # 카드 API
│   ├── columns.ts              # 컬럼 API
│   └── error.ts                # 에러 처리
├── components/                 # 공통 UI 컴포넌트
│   ├── ErrorMessage.tsx        # 에러 메시지
│   ├── PButton.tsx             # 버튼
│   └── PModal.tsx              # 모달
├── features/board/             # 보드 기능 모듈
│   ├── components/
│   │   ├── card/               # 카드 관련 컴포넌트
│   │   │   ├── AddCardForm.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CardList.tsx
│   │   │   └── ModalCardDetail.tsx
│   │   ├── column/             # 컬럼 관련 컴포넌트
│   │   │   ├── AddColumn.tsx
│   │   │   ├── AddColumnForm.tsx
│   │   │   ├── Column.tsx
│   │   │   ├── ColumnList.tsx
│   │   │   └── EditableText.tsx
│   │   ├── shared/             # 공유 컴포넌트
│   │   │   └── AddItemForm.tsx
│   │   └── skeleton/           # 스켈레톤 컴포넌트
│   │       └── BoardSkeleton.tsx
│   ├── contexts/               # Context API
│   │   ├── CardDetailModalProvider.tsx
│   │   ├── cardDetailModalContext.ts
│   │   └── useCardDetailModal.ts
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useCardDragAndDrop.ts
│   │   ├── useCardMutations.ts
│   │   └── useColumnMutations.ts
│   ├── utils/
│   │   ├── cardDragHelper.ts   # 드래그 헬퍼 함수
│   │   └── optimisticUpdate.ts # 낙관적 업데이트 유틸
│   ├── constants.ts
│   └── types.ts
├── mocks/                      # MSW Mock API
│   ├── handlers/               # API 핸들러
│   ├── services/               # 비즈니스 로직
│   ├── data.ts                 # 초기 데이터
│   └── db.ts                   # 인메모리 DB
├── pages/
│   └── board/index.tsx         # 보드 페이지
├── providers/
│   └── query/                  # TanStack Query 설정
├── router/
│   └── index.tsx               # 라우터 설정
├── styles/                     # 전역 스타일
└── utils/                      # 공통 유틸리티
```

## 🎯 설계 결정

### 상태 관리 전략
- **서버 상태**: TanStack Query로 관리
  - 캐싱, 백그라운드 리페칭, 낙관적 업데이트 활용
- **클라이언트 상태**: React Context + useState
  - 모달 열림/닫힘, 드래그 상태 등 UI 상태

### 컴포넌트 설계 원칙
- **단일 책임 원칙**: 컴포넌트는 렌더링, 커스텀 훅은 데이터 로직 담당
  - `useCardMutations`: 카드 CRUD mutation 관리
  - `useColumnMutations`: 컬럼 CRUD mutation 관리
  - `useCardDragAndDrop`: 드래그 앤 드롭 상태 및 핸들러 관리
- **재사용성**: 공통 UI를 분리하여 재사용이 가능하도록 만듬
  - `PButton`, `PModal`: 전역 공통 컴포넌트
  - `AddItemForm`: 컬럼/카드 생성 폼 공용 사용
- **가독성**: 역할별 폴더 구조(`card/`, `column/`, `skeleton/`, `shared/`) 및 명확한 네이밍

### 낙관적 업데이트
- 컬럼 수정/삭제, 카드 이동/수정/삭제 시 즉시 UI 반영
- API 실패 시 이전 상태로 롤백
- `optimisticUpdate.ts`에 캐시 업데이트 로직 분리

### 드래그 앤 드롭
- `dnd-kit/core` 사용
- `useCardDragAndDrop` 훅으로 로직 분리
- 헬퍼 함수(`cardDragHelper.ts`)로 순서 계산 로직 분리

---
