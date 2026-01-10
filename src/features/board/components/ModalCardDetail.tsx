import Modal from '@/components/PModal.tsx'
import {
  useCardDetailModalActions,
  useCardDetailModalState,
} from '@/features/board/contexts/useCardDetailModal.ts'
import PButton from '@/components/PButton.tsx'
import styles from './ModalCardDetail.module.css'

// ISO 날짜 문자열을 '2025년 1월 12일 AM 12:14' 형식으로 변환
const formatDateTime = (iso: string) => {
  if (!iso || iso === '-') return '-'

  const d = new Date(iso)

  // 잘못된 날짜 문자열 방어
  if (isNaN(d.getTime())) return '-'

  // 날짜 구성
  const yyyy = d.getFullYear()
  const month = d.getMonth() + 1 // month는 0부터 시작
  const day = d.getDate()

  // 시간 구성 (12시간제)
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')

  const ap = h < 12 ? 'AM' : 'PM'
  h = h % 12 || 12
  const hh = String(h).padStart(2, '0')

  return `${yyyy}년 ${month}월 ${day}일 ${ap} ${hh}:${m}`
}

const ModalCardDetail = () => {
  const { closeModal } = useCardDetailModalActions()
  const { isOpen, selectedCard } = useCardDetailModalState()

  if (!selectedCard) return null

  return (
    <Modal isOpen={isOpen} onClose={closeModal}>
      <Modal.Header />
      <Modal.Overlay />
      <Modal.Content>
        <div className={styles.box}>
          <label htmlFor="cardTitle" className={`${styles.label} ${styles.titleLabel}`}>
            Title
          </label>

          <textarea
            name="cardTitle"
            id="cardTitle"
            maxLength={100}
            rows={4}
            className={styles.textarea}
            value={selectedCard.title}
          ></textarea>
        </div>
        <div className={styles.box}>
          <label htmlFor="cardDesc" className={styles.label}>
            Description
          </label>
          <textarea
            name="cardDesc"
            id="cardDesc"
            maxLength={1000}
            rows={4}
            className={styles.textarea}
            value={selectedCard.description}
          ></textarea>
        </div>
        <dl className={styles.dateArea}>
          <dt>마감일: </dt>
          <dd>{formatDateTime(selectedCard.due_date ?? '')}</dd>

          <dt>생성일: </dt>
          <dd>{formatDateTime(selectedCard.created_at ?? '')}</dd>

          <dt>수정일: </dt>
          <dd>{formatDateTime(selectedCard.updated_at ?? '')}</dd>
        </dl>
      </Modal.Content>
      <Modal.Footer>
        <div className={styles.modalFooterInner}>
          <PButton className={styles.btnDelete}>삭제</PButton>
          <div>
            <PButton className={styles.btnClose} onClick={closeModal}>
              닫기
            </PButton>
            <PButton className={styles.btnSave}>저장</PButton>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalCardDetail
