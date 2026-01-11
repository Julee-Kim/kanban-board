import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  })

  const handleSubmit = (title: string) => {
    createColumnMutation.mutate(title)
  }

  return (
    <AddItemForm
      placeholder="컬럼 제목 입력"
      submitLabel="컬럼 추가"
      maxLength={COLUMN_TITLE_MAX_LENGTH}
      isPending={createColumnMutation.isPending}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      className={styles.addColumnForm}
    />
  )
}

export default AddColumnForm
