import { useState } from 'react'
import AddColumnForm from './AddColumnForm.tsx'
import PButton from '@/components/PButton.tsx'
import styles from './AddColumn.module.css'

const AddColumn = () => {
  const [isAdding, setIsAdding] = useState(false)

  if (isAdding) {
    return <AddColumnForm onCancel={() => setIsAdding(false)} />
  }

  return (
    <PButton onClick={() => setIsAdding(true)} className={styles.btnAddColumn}>
      + 컬럼 추가
    </PButton>
  )
}

export default AddColumn
