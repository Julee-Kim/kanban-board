import { Children, useEffect, isValidElement, createContext, useContext } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode, JSX, PropsWithChildren, ReactPortal } from 'react'
import styles from './PModal.module.css'

// ========== Context ==========
type ModalContextType = {
  isOpen: boolean
  onClose: () => void
}

const ModalContext = createContext<ModalContextType | null>(null)

const useModalContext = () => {
  const ctx = useContext(ModalContext)
  if (!ctx) {
    throw new Error('Modal.* 컴포넌트는 반드시 <Modal> 내부에서만 사용해야 합니다.')
  }
  return ctx
}

// ========== Sub Components ==========
const Overlay = ({ closeOnOverlay = true }: { closeOnOverlay?: boolean }) => {
  const { onClose } = useModalContext()

  return (
    <div className={styles.overlay} onClick={closeOnOverlay ? onClose : undefined} aria-hidden />
  )
}

const Header = () => {
  const { onClose } = useModalContext()

  return (
    <div className={styles.modalHeader}>
      <button className={styles.btnClose} onClick={onClose} aria-label="모달 닫기">
        X
      </button>
    </div>
  )
}

const Content = ({ children, className }: PropsWithChildren<{ className?: string }>) => {
  return <div className={`${styles.modalContent} ${className ?? ''}`}>{children}</div>
}

const Footer = ({ children }: { children: ReactNode }) => {
  return <div className={styles.modalFooter}>{children}</div>
}

// ========== Types ==========
type ModalProps = PropsWithChildren<{
  isOpen: boolean
  onClose: () => void
}>

// ========== Modal Component ==========
function ModalComponent({ isOpen, onClose, children }: ModalProps): ReactPortal | null {
  useEffect(() => {
    if (!isOpen) return

    document.body.classList.add('noScroll')
    return () => document.body.classList.remove('noScroll')
  }, [isOpen])

  // 닫힌 상태에서는 모달을 렌더링하지 않음
  if (!isOpen) return null

  /**
   * children에 전달된 순서와 무관하게
   * Header → Content → Footer 렌더링 순서를 보장하기 위해 Modal 서브 컴포넌트를 타입 기준으로 분리
   * */
  const childrenArray = Children.toArray(children)
  const pick = (type: JSX.ElementType) =>
    childrenArray.find((c) => isValidElement(c) && c.type === type)

  const OverlayEl = pick(Overlay)
  const HeaderEl = pick(Header)
  const ContentEl = pick(Content)
  const FooterEl = pick(Footer)

  return createPortal(
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <div
        role="dialog"
        aria-modal="true"
        className={`${styles.modalContainer} ${styles.openContainer}`}
      >
        {OverlayEl}
        <div className={`${styles.modal} ${styles.openCenter}`}>
          {HeaderEl}
          {ContentEl}
          {FooterEl}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  )
}

// ========== Modal with Sub Components ==========
const Modal = Object.assign(ModalComponent, {
  Overlay,
  Header,
  Content,
  Footer,
}) as typeof ModalComponent & {
  Overlay: typeof Overlay
  Header: typeof Header
  Content: typeof Content
  Footer: typeof Footer
}

export default Modal
