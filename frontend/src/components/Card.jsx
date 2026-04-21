import styles from './Card.module.css'

export default function Card({ children, className = '', small = false, style }) {
  return (
    <div className={`${styles.card} ${small ? styles.small : ''} ${className}`} style={style}>
      {children}
    </div>
  )
}

export function MetricCard({ label, value, sub, accent }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue} style={accent ? { color: accent } : {}}>{value}</div>
      {sub && <div className={styles.metricSub}>{sub}</div>}
    </div>
  )
}

export function StageCard({ icon, label, date, ndvi, confidence, colorClass }) {
  return (
    <div className={styles.stageCard}>
      <div className={`${styles.stageIcon} ${styles[colorClass]}`}>{icon}</div>
      <div>
        <div className={styles.stageLabel}>{label}</div>
        <div className={styles.stageDate}>{date}</div>
        <div className={styles.stageNdvi}>NDVI {ndvi}</div>
        <div className={styles.stageConf}>{confidence}% confidence</div>
      </div>
    </div>
  )
}
