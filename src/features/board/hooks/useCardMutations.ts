import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { FetchColumnsRes } from '@/features/board/types.ts'
import { createCard, updateCard, deleteCard, moveCard } from '@/api/cards.ts'
import { updateCardInCache, removeCardFromCache } from '@/features/board/utils/optimisticUpdate'

interface UpdateCardParams {
  title: string
  description: string
  dueDate: string | null
}

interface MoveCardParams {
  cardId: string
  targetColumnId: string
  newOrder: number
}

const useCardMutations = (cardId?: string, columnId?: string) => {
  const queryClient = useQueryClient()

  const createCardMutation = useMutation({
    mutationFn: (title: string) => {
      if (!columnId) throw new Error('컬럼 ID가 필요합니다')
      return createCard(columnId, title)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['columns'] })
    },
  })

  const updateCardMutation = useMutation({
    mutationFn: ({ title, description, dueDate }: UpdateCardParams) => {
      if (!cardId) throw new Error('카드 ID가 필요합니다')
      return updateCard(cardId, title, description, dueDate)
    },
    onMutate: async ({ title, description, dueDate }) => {
      if (!cardId) return

      await queryClient.cancelQueries({ queryKey: ['columns'] })

      const previousData = queryClient.getQueryData<FetchColumnsRes>(['columns'])

      queryClient.setQueryData<FetchColumnsRes>(['columns'], (old) => {
        if (!old) return old
        return updateCardInCache(old, cardId, {
          title,
          description,
          due_date: dueDate || null,
          updated_at: new Date().toISOString(),
        })
      })

      return { previousData }
    },
    onSuccess: () => {
      toast.success('카드가 수정되었습니다.')
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
    },
  })

  const deleteCardMutation = useMutation({
    mutationFn: () => {
      if (!cardId) throw new Error('카드 ID가 필요합니다')
      return deleteCard(cardId)
    },
    onMutate: async () => {
      if (!cardId) return

      await queryClient.cancelQueries({ queryKey: ['columns'] })

      const previousData = queryClient.getQueryData<FetchColumnsRes>(['columns'])

      queryClient.setQueryData<FetchColumnsRes>(['columns'], (old) => {
        if (!old) return old
        return removeCardFromCache(old, cardId)
      })

      return { previousData }
    },
    onSuccess: () => {
      toast.success('카드가 삭제되었습니다.')
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
    },
  })

  const moveCardMutation = useMutation({
    mutationFn: ({ cardId, targetColumnId, newOrder }: MoveCardParams) =>
      moveCard(cardId, targetColumnId, newOrder),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['columns'] })
      const previousData = queryClient.getQueryData(['columns'])
      return { previousData }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
    },
  })

  return {
    createCard: createCardMutation.mutate,
    isCreating: createCardMutation.isPending,
    updateCard: updateCardMutation.mutate,
    isUpdating: updateCardMutation.isPending,
    deleteCard: deleteCardMutation.mutate,
    isDeleting: deleteCardMutation.isPending,
    moveCard: moveCardMutation.mutate,
    isMoving: moveCardMutation.isPending,
  }
}

export default useCardMutations
