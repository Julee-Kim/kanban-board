import { useState, useRef, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CardType, FetchColumnsRes } from '@/features/board/types'
import { CARD_TITLE_MAX_LENGTH, CARD_DESCRIPTION_MAX_LENGTH } from '@/features/board/constants.ts'
import { updateCard, deleteCard } from '@/api/cards.ts'
import { formatDateTime, formatDateTimeISO } from '@/utils/date.ts'
import { autoResizeTextarea } from '@/utils/textarea.ts'
import { updateCardInCache, removeCardFromCache } from '@/features/board/utils/optimisticUpdate'
import PModal from '@/components/PModal.tsx'
import PButton from '@/components/PButton.tsx'
import styles from './ModalCardDetail.module.css'

interface ModalCardDetailProps {
  isOpen: boolean
  card: CardType
  onClose: () => void
}

const ModalCardDetail = ({ isOpen, card, onClose }: ModalCardDetailProps) => {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [dueDate, setDueDate] = useState(formatDateTimeISO(card.due_date))
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const updateCardMutation = useMutation({
    mutationFn: ({
      title,
      description,
      dueDate,
    }: {
      title: string
      description: string
      dueDate: string | null
    }) => updateCard(card.id, title, description, dueDate),
    onSuccess: () => {
      toast.success('카드가 수정되었습니다.')
      onClose()
    },
    onMutate: async ({ title, description, dueDate }) => {
      // 낙관적 업데이트 중 이전 데이터로 덮어씌워지는 것을 방지
      await queryClient.cancelQueries({ queryKey: ['columns'] })

      // 이전 데이터 백업 (에러 시 롤백용)
      const previousData = queryClient.getQueryData<FetchColumnsRes>(['columns'])

      // 캐시 즉시 업데이트
      queryClient.setQueryData<FetchColumnsRes>(['columns'], (old) => {
        if (!old) return old
        return updateCardInCache(old, card.id, {
          title,
          description,
          due_date: dueDate || null,
          updated_at: new Date().toISOString(),
        })
      })

      return { previousData }
    },
    onError: (_error, _variables, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
    },
  })

  const deleteCardMutation = useMutation({
    mutationFn: () => deleteCard(card.id),
    onMutate: async () => {
      // 낙관적 업데이트 중 이전 데이터로 덮어씌워지는 것을 방지
      await queryClient.cancelQueries({ queryKey: ['columns'] })

      // 이전 데이터 백업 (에러 시 롤백용)
      const previousData = queryClient.getQueryData<FetchColumnsRes>(['columns'])

      // 캐시에서 카드 즉시 제거
      queryClient.setQueryData<FetchColumnsRes>(['columns'], (old) => {
        if (!old) return old
        return removeCardFromCache(old, card.id)
      })

      return { previousData }
    },
    onSuccess: () => {
      toast.success('카드가 삭제되었습니다.')
      onClose()
    },
    onError: (_error, _variables, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.previousData) {
        queryClient.setQueryData(['columns'], context.previousData)
      }
    },
  })

  const handleDelete = () => {
    if (window.confirm('해당 카드를 삭제하시겠습니까?')) {
      deleteCardMutation.mutate()
    }
  }

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value.slice(0, CARD_TITLE_MAX_LENGTH))
    autoResizeTextarea(e.target)
  }

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value.slice(0, CARD_DESCRIPTION_MAX_LENGTH))
    autoResizeTextarea(e.target)
  }

  const handleDueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value)
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요')
      return
    }
    const dueDateValue = dueDate || null
    updateCardMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDateValue,
    })
  }

  const isOverdue = card.due_date ? new Date(card.due_date) < new Date() : false
  // 변경사항이 없으면 저장 버튼 비활성화
  const hasChanges =
    title.trim() !== card.title ||
    description.trim() !== card.description ||
    dueDate !== formatDateTimeISO(card.due_date)

  useEffect(() => {
    autoResizeTextarea(titleRef.current)
    autoResizeTextarea(descriptionRef.current)
  }, [title, description])

  return (
    <PModal isOpen={isOpen} onClose={onClose}>
      <PModal.Overlay />
      <PModal.Header>카드 상세</PModal.Header>
      <PModal.Content>
        <div className={styles.box}>
          <label className={styles.label}>
            제목 <span className={styles.required}>*</span>
          </label>
          <div className={styles.textareaWrapper}>
            <textarea
              ref={titleRef}
              value={title}
              onChange={handleTitleChange}
              className={styles.titleInput}
              rows={1}
            />
            <span className={styles.charCount}>
              {title.length}/{CARD_TITLE_MAX_LENGTH}
            </span>
          </div>
        </div>
        <div className={styles.box}>
          <label className={styles.label}>설명</label>
          <div className={styles.textareaWrapper}>
            <textarea
              ref={descriptionRef}
              value={description}
              onChange={handleDescriptionChange}
              className={styles.descriptionInput}
              rows={1}
            />
            <span className={styles.charCount}>
              {description.length}/{CARD_DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
        </div>
        <div className={`${styles.box} ${styles.dueDateRow}`}>
          <label className={styles.label}>마감일</label>
          <input
            type="datetime-local"
            value={dueDate}
            className={`${styles.dueDateInput} ${isOverdue ? styles.dueDateOverdue : ''}`}
            onChange={handleDueDateChange}
          />
        </div>
        <div className={styles.dateArea}>
          <span className={styles.dateLabel}>생성일</span>
          <span className={styles.dateValue}>{formatDateTime(card.created_at ?? '')}</span>
          <span className={styles.dateLabel}>수정일</span>
          <span className={styles.dateValue}>{formatDateTime(card.updated_at ?? '')}</span>
        </div>
      </PModal.Content>
      <PModal.Footer>
        <div className={styles.modalFooterInner}>
          <PButton
            className={styles.btnDelete}
            onClick={handleDelete}
            disabled={deleteCardMutation.isPending}
          >
            삭제
          </PButton>
          <div>
            <PButton className={styles.btnClose} onClick={onClose}>
              닫기
            </PButton>
            <PButton
              className={styles.btnSave}
              disabled={!hasChanges || updateCardMutation.isPending}
              onClick={handleSave}
            >
              저장
            </PButton>
          </div>
        </div>
      </PModal.Footer>
    </PModal>
  )
}

export default ModalCardDetail
