import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createColumn } from '@/api/columns.ts'
import { COLUMN_TITLE_MAX_LENGTH } from '@/features/board/constants.ts'
import AddItemForm from '@/features/board/components/AddItemForm.tsx'
import styles from './AddColumnForm.module.css'

interface AddColumnFormProps {
  onCancel: () => void
}

const AddColumnForm = ({ onCancel }: AddColumnFormProps) => {
  const queryClient = useQueryClient()

  const createColumnMutation = useMutation({
    mutationFn: (title: string) => createColumn(title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['columns'] })
      onCancel()
    },
    onError: () => {
      toast.error('컬럼 생성에 실패했습니다.')
    },
  })

  const handleSubmit = (title: string) => {
    createColumnMutation.mutate(title)
  }

  return (
    <AddItemForm
      itemName="컬럼"
      maxLength={COLUMN_TITLE_MAX_LENGTH}
      isPending={createColumnMutation.isPending}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      className={styles.addColumnForm}
    />
  )
}

export default AddColumnForm
