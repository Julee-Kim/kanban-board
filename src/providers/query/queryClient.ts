import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

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
      // TODO: 에러 처리
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      console.error(`[mutationCache error - mutation key: ${mutation.options.mutationKey}]`, error)
      // TODO: 에러 처리
    },
  }),
})
