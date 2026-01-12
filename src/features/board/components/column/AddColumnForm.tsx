import { COLUMN_TITLE_MAX_LENGTH } from '@/features/board/constants.ts'
import useColumnMutations from '@/features/board/hooks/useColumnMutations.ts'
import AddItemForm from '@/features/board/components/shared/AddItemForm.tsx'
import styles from './AddColumnForm.module.css'

interface AddColumnFormProps {
  onCancel: () => void
}

const AddColumnForm = ({ onCancel }: AddColumnFormProps) => {
  const { createColumn, isCreating } = useColumnMutations()

  const handleSubmit = (title: string) => {
    createColumn(title, { onSuccess: onCancel })
  }

  return (
    <AddItemForm
      itemName="컬럼"
      maxLength={COLUMN_TITLE_MAX_LENGTH}
      isPending={isCreating}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      className={styles.addColumnForm}
    />
  )
}

export default AddColumnForm
