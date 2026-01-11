import styles from './BoardSkeleton.module.css'

const BoardSkeleton = () => {
  return (
    <div className={styles.board}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={styles.column}>
          <div className={styles.title} />
          <div className={styles.card} />
          <div className={styles.card} />
          <div className={styles.card} />
        </div>
      ))}
    </div>
  )
}

export default BoardSkeleton
