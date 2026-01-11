import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCard } from '@/api/cards.ts'
import { CARD_TITLE_MAX_LENGTH } from '@/features/board/constants.ts'
import AddItemForm from '@/features/board/components/shared/AddItemForm.tsx'

interface AddCardFormProps {
  columnId: string
  onCancel: () => void
}

const AddCardForm = ({ columnId, onCancel }: AddCardFormProps) => {
  const queryClient = useQueryClient()

  const createCardMutation = useMutation({
    mutationFn: (title: string) => createCard(columnId, title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['columns'] })
      onCancel()
    },
  })

  const handleSubmit = (title: string) => {
    createCardMutation.mutate(title)
  }

  return (
    <AddItemForm
      itemName="카드"
      maxLength={CARD_TITLE_MAX_LENGTH}
      isPending={createCardMutation.isPending}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}

export default AddCardForm
