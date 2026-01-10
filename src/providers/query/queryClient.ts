import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

const MINUTE = 1000 * 60

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: MINUTE, // 1분 동안 fresh
      gcTime: MINUTE * 5, // 5분 동안 캐시 유지
      refetchOnWindowFocus: false,
      retry: 1, // 실패 시 1번만 재시도
    },
    mutations: {
      retry: 1, // mutation 실패 시 1번만 재시도
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
