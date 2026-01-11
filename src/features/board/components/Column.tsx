import { useState } from 'react'
import { toast } from 'sonner'
import type { ColumnType, FetchColumnsRes } from '@/features/board/types.ts'
import { useDroppable } from '@dnd-kit/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateColumnTitle, deleteColumn } from '@/api/columns.ts'
import { removeColumnFromCache, updateColumnTitleInCache } from '@/features/board/utils/cache'
import EditableText from '@/features/board/components/EditableText.tsx'
import AddCardForm from '@/features/board/components/AddCardForm.tsx'
import PButton from '@/components/PButton.tsx'
import CardList from '@/features/board/components/CardList.tsx'
import styles from '@/features/board/components/Column.module.css'

interface ColumnProps {
  column: ColumnType
}

const Column = ({ column }: ColumnProps) => {
  const queryClient = useQueryClient()
  const [isAddingCard, setIsAddingCard] = useState(false)

  // 컬럼을 드롭 가능한 영역으로 설정
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const updateTitleMutation = useMutation({
    mutationFn: (newTitle: string) => updateColumnTitle(column.id, newTitle),
    onMutate: async (newTitle) => {
      // 낙관적 업데이트 중 이전 데이터로 덮어씌워지는 것을 방지
      await queryClient.cancelQueries({ queryKey: ['columns'] })

      // 이전 데이터 백업 (에러 시 롤백용)
      const previousData = queryClient.getQueryData<FetchColumnsRes>(['columns'])

      // 캐시에서 컬럼 타이틀 즉시 업데이트
      queryClient.setQueryData<FetchColumnsRes>(['columns'], (old) => {
        if (!old) return old
        return updateColumnTitleInCache(old, column.id, newTitle)
      })

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
      toast.error('컬럼 타이틀 수정에 실패했습니다.')
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: () => deleteColumn(column.id),
    onMutate: async () => {
      // 낙관적 업데이트 중 이전 데이터로 덮어씌워지는 것을 방지
      await queryClient.cancelQueries({ queryKey: ['columns'] })

      // 이전 데이터 백업 (에러 시 롤백용)
      const previousData = queryClient.getQueryData<FetchColumnsRes>(['columns'])

      // 캐시에서 컬럼 즉시 제거
      queryClient.setQueryData<FetchColumnsRes>(['columns'], (old) => {
        if (!old) return old
        return removeColumnFromCache(old, column.id)
      })

      return { previousData }
    },
    onSuccess: () => {
      toast.success('컬럼이 삭제되었습니다.')
    },
    onError: (_error, _variables, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
      toast.error('컬럼 삭제에 실패했습니다.')
    },
  })

  const handleDeleteColumn = () => {
    const cardCount = column.cards.length
    const message =
      cardCount > 0
        ? `"${column.title}" 컬럼을 삭제하시겠습니까?\n\n이 컬럼에 있는 ${cardCount}개의 카드도 함께 삭제됩니다.`
        : `"${column.title}" 컬럼을 삭제하시겠습니까?`

    if (window.confirm(message)) deleteColumnMutation.mutate()
  }

  const handleSaveTitle = (newTitle: string) => {
    updateTitleMutation.mutate(newTitle)
  }

  return (
    <li ref={setNodeRef} className={`${styles.column} ${isOver ? styles.columnDragOver : ''}`}>
      <div className={styles.columnTitleWrap}>
        <EditableText
          className={styles.columnTitle}
          inputClassName={styles.columnTitleInput}
          value={column.title}
          onSave={handleSaveTitle}
        />
        <PButton className={styles.btnDeleteColumn} onClick={handleDeleteColumn}>
          삭제
        </PButton>
      </div>
      <div className={styles.columnContent}>
        <CardList cards={column.cards} />
        {isAddingCard ? (
          <AddCardForm columnId={column.id} onCancel={() => setIsAddingCard(false)} />
        ) : (
          <PButton className={styles.btnAddCard} onClick={() => setIsAddingCard(true)}>
            + 카드 추가
          </PButton>
        )}
      </div>
    </li>
  )
}

export default Column
