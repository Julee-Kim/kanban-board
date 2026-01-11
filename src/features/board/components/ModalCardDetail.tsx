import { useState, useRef, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCard } from '@/api/cards.ts'
import { autoResizeTextarea } from '@/utils/textarea.ts'
import Modal from '@/components/PModal.tsx'
import PButton from '@/components/PButton.tsx'
import { formatDateTime } from '@/utils/date.ts'
import styles from './ModalCardDetail.module.css'
import { CARD_TITLE_MAX_LENGTH, CARD_DESCRIPTION_MAX_LENGTH } from '@/features/board/constants.ts'
import type { CardType } from '@/features/board/types.ts'

interface ModalCardDetailProps {
  isOpen: boolean
  card: CardType
  onClose: () => void
}

const ModalCardDetail = ({ isOpen, card, onClose }: ModalCardDetailProps) => {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const updateCardMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description: string }) =>
      updateCard(card.id, title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] })
      onClose()
    },
  })

  const handleTitleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value.slice(0, CARD_TITLE_MAX_LENGTH))
    autoResizeTextarea(e.target)
  }

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value.slice(0, CARD_DESCRIPTION_MAX_LENGTH))
    autoResizeTextarea(e.target)
  }

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요')
      return
    }
    updateCardMutation.mutate({ title: title.trim(), description: description.trim() })
  }

  const isOverdue = card.due_date ? new Date(card.due_date) < new Date() : false
  // 변경사항이 없으면 저장 버튼 비활성화
  const hasChanges = title.trim() !== card.title || description.trim() !== card.description

  useEffect(() => {
    autoResizeTextarea(titleRef.current)
    autoResizeTextarea(descriptionRef.current)
  }, [title, description])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Header>카드 상세</Modal.Header>
      <Modal.Content>
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
        <dl className={styles.dateArea}>
          <dt className={isOverdue ? styles.overdue : ''}>마감일: </dt>
          <dd className={isOverdue ? styles.overdue : ''}>{formatDateTime(card.due_date ?? '')}</dd>

          <dt>생성일: </dt>
          <dd>{formatDateTime(card.created_at ?? '')}</dd>

          <dt>수정일: </dt>
          <dd>{formatDateTime(card.updated_at ?? '')}</dd>
        </dl>
      </Modal.Content>
      <Modal.Footer>
        <div className={styles.modalFooterInner}>
          <PButton className={styles.btnDelete}>삭제</PButton>
          <div>
            <PButton className={styles.btnClose} onClick={onClose}>
              닫기
            </PButton>
            <PButton className={styles.btnSave} disabled={!hasChanges} onClick={handleSave}>
              저장
            </PButton>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalCardDetail
