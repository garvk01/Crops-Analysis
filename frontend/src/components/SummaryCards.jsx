// import styles from './SummaryCards.module.css'

// const STATUS_CFG = {
//   good:     { bg:'rgba(143,176,122,.12)', text:'#8fb07a', border:'rgba(143,176,122,.22)' },
//   excellent:{ bg:'rgba(143,176,122,.15)', text:'#b8d4a2', border:'rgba(143,176,122,.28)' },
//   optimal:  { bg:'rgba(143,176,122,.12)', text:'#8fb07a', border:'rgba(143,176,122,.22)' },
//   high:     { bg:'rgba(200,169,110,.12)', text:'#e8c98a', border:'rgba(200,169,110,.22)' },
//   low:      { bg:'rgba(90,143,163,.12)',  text:'#8ab8cc', border:'rgba(90,143,163,.22)'  },
//   critical: { bg:'rgba(184,92,74,.12)',   text:'#d4876f', border:'rgba(184,92,74,.22)'   },
//   stable:   { bg:'rgba(143,176,122,.08)', text:'#8fa88a', border:'rgba(143,176,122,.14)' },
//   fair:     { bg:'rgba(200,169,110,.10)', text:'#c8a96e', border:'rgba(200,169,110,.18)' },
// }

// function Badge({ status }) {
//   const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.stable
//   return <span className={styles.badge} style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>{status}</span>
// }

// function Card({ iconPath, label, value, unit, sub, status, iconColor }) {
//   return (
//     <div className={styles.card}>
//       <div className={styles.cardTop}>
//         <div className={styles.iconWrap} style={{ background: `${iconColor}18` }}>
//           <svg viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
//             <path d={iconPath}/>
//           </svg>
//         </div>
//         <Badge status={status}/>
//       </div>
//       <div className={styles.val}>{value}{unit && <span className={styles.unit}>{unit}</span>}</div>
//       <div className={styles.label}>{label}</div>
//       {sub && <div className={styles.sub}>{sub}</div>}
//     </div>
//   )
// }

// export default function SummaryCards({ metrics, weather, stages }) {
//   const cw = weather?.monthly?.[0] || null
//   const pw = weather?.monthly?.find(m =>
//     stages?.peakGrowth?.date && m.month === new Date(stages.peakGrowth.date).toLocaleString('en',{month:'short'})
//   ) || cw

//   const temp  = pw?.avgTemp ?? '—'
//   const rain  = pw?.totalRain ?? '—'
//   const tStat = typeof temp === 'number' && temp > 35 ? 'Critical' : typeof temp === 'number' && temp > 28 ? 'High' : 'Stable'
//   const rStat = typeof rain === 'number' && rain < 20 ? 'Low' : typeof rain === 'number' && rain > 200 ? 'High' : 'Optimal'
//   const nStat = metrics ? metrics.maxNDVI >= 0.75 ? 'Excellent' : metrics.maxNDVI >= 0.55 ? 'Good' : metrics.maxNDVI >= 0.35 ? 'Fair' : 'Low' : '—'
//   const hScore = metrics?.cropHealthScore ?? '—'
//   const hStat  = typeof hScore === 'number' && hScore >= 75 ? 'Good' : typeof hScore === 'number' && hScore >= 50 ? 'Fair' : 'Low'

//   return (
//     <div className={styles.grid}>
//       <Card iconPath="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"
//         label="Temperature" value={typeof temp==='number'?temp.toFixed(1):temp} unit="°C"
//         sub={pw?.month ? `${pw.month} avg` : 'Peak season'} status={tStat} iconColor="#b85c4a" />
//       <Card iconPath="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 15.25M8 16l4 4 4-4M12 12v8"
//         label="Rainfall" value={typeof rain==='number'?rain.toFixed(0):rain} unit="mm"
//         sub={pw?.month ? `${pw.month} total` : 'Peak month'} status={rStat} iconColor="#5a8fa3" />
//       <Card iconPath="M22 12h-4l-3 9L9 3l-3 9H2"
//         label="Peak NDVI" value={metrics?.maxNDVI?.toFixed(2) ?? '—'} unit=""
//         sub={stages?.peakGrowth?.date ? new Date(stages.peakGrowth.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'Season peak'}
//         status={nStat} iconColor="#8fb07a" />
//       <Card iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//         label="Health score" value={typeof hScore==='number'?hScore:hScore} unit={typeof hScore==='number'?'/100':''}
//         sub={metrics?.vegetationCoverage || 'Overall crop'} status={hStat} iconColor="#8fb07a" />
//     </div>
//   )
// }
// ------------------------------------------------------------------------------------------------------------------------
import styles from './SummaryCards.module.css'

const STATUS_CFG = {
  good:     { bg:'rgba(143,176,122,.12)', text:'#8fb07a', border:'rgba(143,176,122,.22)' },
  excellent:{ bg:'rgba(143,176,122,.15)', text:'#b8d4a2', border:'rgba(143,176,122,.28)' },
  optimal:  { bg:'rgba(143,176,122,.12)', text:'#8fb07a', border:'rgba(143,176,122,.22)' },
  high:     { bg:'rgba(200,169,110,.12)', text:'#e8c98a', border:'rgba(200,169,110,.22)' },
  low:      { bg:'rgba(90,143,163,.12)',  text:'#8ab8cc', border:'rgba(90,143,163,.22)'  },
  critical: { bg:'rgba(184,92,74,.12)',   text:'#d4876f', border:'rgba(184,92,74,.22)'   },
  stable:   { bg:'rgba(143,176,122,.08)', text:'#8fa88a', border:'rgba(143,176,122,.14)' },
  fair:     { bg:'rgba(200,169,110,.10)', text:'#c8a96e', border:'rgba(200,169,110,.18)' },
}

function Badge({ status }) {
  const cfg = STATUS_CFG[status?.toLowerCase()] || STATUS_CFG.stable
  return (
    <span
      className={styles.badge}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {status}
    </span>
  )
}

function Card({ iconPath, label, value, unit, sub, status, iconColor }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.iconWrap} style={{ background: `${iconColor}18` }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
            <path d={iconPath}/>
          </svg>
        </div>
        <Badge status={status}/>
      </div>

      <div className={styles.val}>
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>

      <div className={styles.label}>{label}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  )
}

export default function SummaryCards({ metrics, weather, stages }) {

  // ✅ FIXED: Directly use backend weatherSummary
  const temp = weather?.avgTemp
  const rain = weather?.totalRain

  // ✅ Safe status logic
  const tStat =
    typeof temp === 'number'
      ? temp > 35 ? 'Critical'
      : temp > 28 ? 'High'
      : 'Stable'
      : 'Stable'

  const rStat =
    typeof rain === 'number'
      ? rain < 20 ? 'Low'
      : rain > 200 ? 'High'
      : 'Optimal'
      : 'Optimal'

  const nStat = metrics
    ? metrics.maxNDVI >= 0.75 ? 'Excellent'
    : metrics.maxNDVI >= 0.55 ? 'Good'
    : metrics.maxNDVI >= 0.35 ? 'Fair'
    : 'Low'
    : '—'

  const hScore = metrics?.cropHealthScore

  const hStat =
    typeof hScore === 'number'
      ? hScore >= 75 ? 'Good'
      : hScore >= 50 ? 'Fair'
      : 'Low'
      : 'Low'

  return (
    <div className={styles.grid}>

      {/* 🌡 Temperature */}
      <Card
        iconPath="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"
        label="Temperature"
        value={temp !== undefined ? temp.toFixed(1) : '—'}
        unit="°C"
        sub="Season average"
        status={tStat}
        iconColor="#b85c4a"
      />

      {/* 🌧 Rainfall */}
      <Card
        iconPath="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 15.25M8 16l4 4 4-4M12 12v8"
        label="Rainfall"
        value={rain !== undefined ? rain.toFixed(0) : '—'}
        unit="mm"
        sub="Season total"
        status={rStat}
        iconColor="#5a8fa3"
      />

      {/* 🌿 NDVI */}
      <Card
        iconPath="M22 12h-4l-3 9L9 3l-3 9H2"
        label="Peak NDVI"
        value={metrics?.maxNDVI?.toFixed(2) ?? '—'}
        unit=""
        sub={
          stages?.peakGrowth?.date
            ? new Date(stages.peakGrowth.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})
            : 'Season peak'
        }
        status={nStat}
        iconColor="#8fb07a"
      />

      {/* ❤️ Health */}
      <Card
        iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        label="Health score"
        value={typeof hScore === 'number' ? hScore : '—'}
        unit={typeof hScore === 'number' ? '/100' : ''}
        sub="Overall crop"
        status={hStat}
        iconColor="#8fb07a"
      />

    </div>
  )
}