import { useState, useRef, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import type { CardType } from '@/features/board/types'
import { CARD_TITLE_MAX_LENGTH, CARD_DESCRIPTION_MAX_LENGTH } from '@/features/board/constants.ts'
import { formatDateTime, formatDateTimeISO } from '@/utils/date.ts'
import { autoResizeTextarea } from '@/utils/textarea.ts'
import useCardMutations from '@/features/board/hooks/useCardMutations.ts'
import PModal from '@/components/PModal.tsx'
import PButton from '@/components/PButton.tsx'
import styles from './ModalCardDetail.module.css'

interface ModalCardDetailProps {
  isOpen: boolean
  card: CardType
  onClose: () => void
}

const ModalCardDetail = ({ isOpen, card, onClose }: ModalCardDetailProps) => {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const [dueDate, setDueDate] = useState(formatDateTimeISO(card.due_date))
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const { updateCard, isUpdating, deleteCard, isDeleting } = useCardMutations(card.id)

  const handleDelete = () => {
    if (window.confirm('해당 카드를 삭제하시겠습니까?')) {
      deleteCard(undefined, { onSuccess: onClose })
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
    updateCard(
      {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDateValue,
      },
      { onSuccess: onClose }
    )
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
            disabled={isDeleting}
          >
            삭제
          </PButton>
          <div>
            <PButton className={styles.btnClose} onClick={onClose}>
              닫기
            </PButton>
            <PButton
              className={styles.btnSave}
              disabled={!hasChanges || isUpdating}
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
