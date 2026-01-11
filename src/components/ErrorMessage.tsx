import PButton from '@/components/PButton.tsx'
import styles from './ErrorMessage.module.css'

interface ErrorMessageProps {
  message: string
  onRetry: () => void | Promise<unknown>
}

const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className={styles.container}>
      <p>{message}</p>
      <PButton className={styles.retryButton} onClick={onRetry}>
        재시도
      </PButton>
    </div>
  )
}

export default ErrorMessage
