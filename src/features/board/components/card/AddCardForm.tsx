import { CARD_TITLE_MAX_LENGTH } from '@/features/board/constants.ts'
import useCardMutations from '@/features/board/hooks/useCardMutations.ts'
import AddItemForm from '@/features/board/components/shared/AddItemForm.tsx'

interface AddCardFormProps {
  columnId: string
  onCancel: () => void
}

const AddCardForm = ({ columnId, onCancel }: AddCardFormProps) => {
  const { createCard, isCreating } = useCardMutations(undefined, columnId)

  const handleSubmit = (title: string) => {
    createCard(title, { onSuccess: onCancel })
  }

  return (
    <AddItemForm
      itemName="카드"
      maxLength={CARD_TITLE_MAX_LENGTH}
      isPending={isCreating}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  )
}

export default AddCardForm
