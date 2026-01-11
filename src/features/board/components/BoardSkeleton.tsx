import styles from './BoardSkeleton.module.css'

const BoardSkeleton = () => {
  return (
    <div className={styles.board}>
      <div className={styles.column}>
        <div className={styles.title} />
        <div className={styles.card} />
        <div className={styles.card} />
      </div>
      <div className={styles.column}>
        <div className={styles.title} />
        <div className={styles.card} />
      </div>
      <div className={styles.column}>
        <div className={styles.title} />
        <div className={styles.card} />
      </div>
    </div>
  )
}

export default BoardSkeleton
