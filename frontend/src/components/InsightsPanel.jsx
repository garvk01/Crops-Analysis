import { useState, useEffect } from 'react'
import api from '../utils/api'
import styles from './InsightsPanel.module.css'

const TYPE_CFG = {
  critical: { label:'Critical', dot:'#b85c4a', bg:'rgba(184,92,74,.10)', border:'rgba(184,92,74,.22)', text:'#d4876f' },
  warning:  { label:'Warning',  dot:'#c8a96e', bg:'rgba(200,169,110,.10)', border:'rgba(200,169,110,.22)', text:'#e8c98a' },
  info:     { label:'Info',     dot:'#5a8fa3', bg:'rgba(90,143,163,.10)', border:'rgba(90,143,163,.22)', text:'#8ab8cc' },
}

const CAT_ICONS = {
  growth:   'M12 2a10 10 0 010 20M12 2C6.5 2 2 6.5 2 12M12 22V12M2 12h10',
  ndvi:     'M22 12h-4l-3 9L9 3l-3 9H2',
  rainfall: 'M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 15.25M8 16l4 4 4-4M12 12v8',
  stress:   'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
  harvest:  'M17 8C8 10 5.9 16.17 3.82 22H5C5.5 20.5 7 17 12 15c3.71-.78 6.02-3.5 7.06-7L17 8z',
}

function InsightCard({ insight }) {
  const cfg = TYPE_CFG[insight.type] || TYPE_CFG.info
  const iconPath = CAT_ICONS[insight.category] || CAT_ICONS.stress
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.card} style={{ background: cfg.bg, borderColor: cfg.border }} onClick={() => setOpen(o => !o)}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrap} style={{ background: cfg.border }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={cfg.text} strokeWidth="1.8" strokeLinecap="round" width="14" height="14">
            <path d={iconPath}/>
          </svg>
        </div>
        <div className={styles.cardMain}>
          <div className={styles.cardTitle}>{insight.title}</div>
          <span className={styles.typeBadge} style={{ color: cfg.text, background: cfg.border }}>
            <span className={styles.typeDot} style={{ background: cfg.dot }}/>{cfg.label}
          </span>
        </div>
        <svg className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && (
        <div className={styles.cardBody}>
          <p className={styles.message}>{insight.message}</p>
          {insight.value !== undefined && (
            <div className={styles.values}>
              <span className={styles.valueChip}>Measured: <strong>{typeof insight.value === 'number' ? insight.value.toFixed(insight.value > 1 ? 1 : 3) : insight.value}</strong></span>
              {insight.threshold !== undefined && <span className={styles.valueChip}>Threshold: <strong>{typeof insight.threshold === 'number' ? insight.threshold.toFixed(insight.threshold > 1 ? 0 : 3) : insight.threshold}</strong></span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function InsightsPanel({ cropDataId, preloadedInsights }) {
  const [insights, setInsights] = useState(preloadedInsights || [])
  const [loading, setLoading]   = useState(!preloadedInsights)
  const [regen, setRegen]       = useState(false)

  useEffect(() => { if (!preloadedInsights && cropDataId) fetch() }, [cropDataId])

  const fetch = async () => {
    try { setLoading(true); const r = await api.get(`/insights/${cropDataId}`); setInsights(r.data.insights || []) }
    catch { /* graceful */ } finally { setLoading(false) }
  }

  const regenerate = async (e) => {
    e.stopPropagation(); setRegen(true)
    try { const r = await api.post(`/insights/${cropDataId}/regenerate`); setInsights(r.data.insights || []) }
    catch { /* graceful */ } finally { setRegen(false) }
  }

  const counts = { critical: 0, warning: 0, info: 0 }
  insights.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1 })

  if (loading) return <div className={styles.loading}><div className={styles.spinner}/>Generating insights...</div>

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className={styles.panelTitle}>Smart insights</div>
          <div className={styles.panelSub}>
            {counts.critical > 0 && <span style={{ color:'#d4876f' }}>{counts.critical} critical · </span>}
            {counts.warning  > 0 && <span style={{ color:'#e8c98a' }}>{counts.warning} warning · </span>}
            {counts.info     > 0 && <span style={{ color:'#8ab8cc' }}>{counts.info} info</span>}
            {insights.length === 0 && 'No issues detected'}
          </div>
        </div>
        {cropDataId && <button className={styles.regenBtn} onClick={regenerate} disabled={regen}>{regen ? '...' : '↻ Refresh'}</button>}
      </div>
      {insights.length === 0
        ? <div className={styles.empty}><div className={styles.emptyIcon}>✓</div><div className={styles.emptyText}>All metrics within normal range</div></div>
        : <div className={styles.list}>{insights.map((ins, i) => <InsightCard key={i} insight={ins}/>)}</div>
      }
    </div>
  )
}
