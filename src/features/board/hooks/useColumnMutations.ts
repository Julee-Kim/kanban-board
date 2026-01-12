import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { FetchColumnsRes } from '@/features/board/types.ts'
import { createColumn, updateColumnTitle, deleteColumn } from '@/api/columns.ts'
import { removeColumnFromCache, updateColumnTitleInCache } from '@/features/board/utils/optimisticUpdate'

const useColumnMutations = (columnId?: string) => {
  const queryClient = useQueryClient()

  const createColumnMutation = useMutation({
    mutationFn: (title: string) => createColumn(title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['columns'] })
    },
  })

  const updateTitleMutation = useMutation({
    mutationFn: (newTitle: string) => {
      if (!columnId) throw new Error('컬럼 ID가 필요합니다')
      return updateColumnTitle(columnId, newTitle)
    },
    onMutate: async (newTitle) => {
      if (!columnId) return

      await queryClient.cancelQueries({ queryKey: ['columns'] })

      const previousData = queryClient.getQueryData<FetchColumnsRes>(['columns'])

      queryClient.setQueryData<FetchColumnsRes>(['columns'], (old) => {
        if (!old) return old
        return updateColumnTitleInCache(old, columnId, newTitle)
      })

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: () => {
      if (!columnId) throw new Error('컬럼 ID가 필요합니다')
      return deleteColumn(columnId)
    },
    onMutate: async () => {
      if (!columnId) return

      await queryClient.cancelQueries({ queryKey: ['columns'] })

      const previousData = queryClient.getQueryData<FetchColumnsRes>(['columns'])

      queryClient.setQueryData<FetchColumnsRes>(['columns'], (old) => {
        if (!old) return old
        return removeColumnFromCache(old, columnId)
      })

      return { previousData }
    },
    onSuccess: () => {
      toast.success('컬럼이 삭제되었습니다.')
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
    },
  })

  return {
    createColumn: createColumnMutation.mutate,
    isCreating: createColumnMutation.isPending,
    updateTitle: updateTitleMutation.mutate,
    deleteColumn: deleteColumnMutation.mutate,
    isDeleting: deleteColumnMutation.isPending,
  }
}

export default useColumnMutations
