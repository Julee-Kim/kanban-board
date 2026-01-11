import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'

const MINUTE = 1000 * 60

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: MINUTE, // 1분 동안 fresh
      gcTime: MINUTE * 5, // 5분 동안 캐시 유지
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
      retry: 1,
    },
    mutations: {
      retry: 0, // 중복 생성/수정 방지
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`[queryCache error - query key: ${query.queryKey}]`, error)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error(`[mutationCache error - mutation key: ${mutation.options.mutationKey}]`, error)

      // 개별 mutation에서 onError를 정의한 경우 공통 토스트 표시 안 함
      if (mutation.options.onError) return

      // 서버 에러 메시지 또는 기본 메시지 표시
      const message = error instanceof Error ? error.message : '요청에 실패했습니다.'
      toast.error(message)
    },
  }),
})
