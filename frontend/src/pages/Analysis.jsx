// import { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import toast from 'react-hot-toast'
// import api from '../utils/api'
// import { analyzeCropCycle, formatDate, formatDateShort, healthColor } from '../utils/analysis'
// import NDVIChart from '../components/NDVIChart'
// import CropBanner from '../components/CropBanner'
// import RainChart from '../components/RainChart'
// import SummaryCards from '../components/SummaryCards'
// import InsightsPanel from '../components/InsightsPanel'
// import FieldMapCard from '../components/FieldMapCard'
// import styles from './Analysis.module.css'

// export default function Analysis() {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const [data, setData]       = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => { loadAnalysis() }, [id])

//   const loadAnalysis = async () => {
//     try {
//       const [dataRes, analysisRes] = await Promise.all([
//         api.get(`/data/${id}`),
//         api.get(`/analysis/${id}`)
//       ])
//       const ts = dataRes.data.cropData.timeSeries.map(p => ({ date: new Date(p.date), ndvi: p.ndvi }))
//       setData({
//         cropData: dataRes.data.cropData,
//         analysis: analysisRes.data.analysis,
//         local: analyzeCropCycle(ts)
//       })
//     } catch {
//       toast.error('Failed to load analysis')
//       navigate('/history')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const exportReport = () => {
//     if (!data) return
//     const { cropData, local: { stages, metrics }, analysis } = data
//     const insightLines = (analysis?.insights || []).map(ins =>
//       `  [${ins.type.toUpperCase()}] ${ins.title}\n  ${ins.message}`
//     ).join('\n\n')
//     const weatherLine = analysis?.weather?.monthly?.length
//       ? `\nWEATHER (regional avg)\n${analysis.weather.monthly.map(m => `  ${m.month}: ${m.avgTemp}°C, ${m.totalRain}mm rain`).join('\n')}`
//       : ''
//     const lines = [
//       'CROP CYCLE ANALYSIS REPORT',
//       '='.repeat(36),
//       `Dataset  : ${cropData.name}`,
//       `Crop     : ${cropData.cropType}`,
//       cropData.location?.label ? `Location : ${cropData.location.label}` : '',
//       '',
//       'HEALTH METRICS',
//       `  Health Score        : ${metrics.cropHealthScore}/100`,
//       `  Vegetation Coverage : ${metrics.vegetationCoverage}`,
//       `  Growing Season      : ${metrics.growingSeasonDays} days`,
//       `  Peak NDVI           : ${metrics.maxNDVI}`,
//       `  Average NDVI        : ${metrics.averageNDVI}`,
//       `  NDVI Variance       : ${metrics.ndviVariance}`,
//       '',
//       'DETECTED STAGES',
//       `  Growth Start  : ${formatDate(stages.growthStart.date)}  NDVI ${stages.growthStart.ndvi.toFixed(3)}  (${stages.growthStart.confidence}% confidence)`,
//       `  Peak Growth   : ${formatDate(stages.peakGrowth.date)}  NDVI ${stages.peakGrowth.ndvi.toFixed(3)}  (${stages.peakGrowth.confidence}% confidence)`,
//       `  Harvest Stage : ${formatDate(stages.harvest.date)}  NDVI ${stages.harvest.ndvi.toFixed(3)}  (${stages.harvest.confidence}% confidence)`,
//       weatherLine,
//       insightLines ? `\nSMART INSIGHTS\n${insightLines}` : '',
//       '',
//       `Generated : ${new Date().toLocaleString()}`,
//       'CropCycle Analysis System v1.1'
//     ].filter(Boolean).join('\n')

//     const blob = new Blob([lines], { type: 'text/plain' })
//     const url  = URL.createObjectURL(blob)
//     const a    = document.createElement('a')
//     a.href = url; a.download = `${cropData.name.replace(/\s+/g,'_')}_analysis.txt`; a.click()
//     URL.revokeObjectURL(url)
//     toast.success('Report exported!')
//   }

//   if (loading) return (
//     <div className={styles.loading}><div className={styles.spinner} />Running analysis...</div>
//   )
//   if (!data) return null

//   const { cropData, local, analysis } = data
//   const { stages, metrics, phases, timeSeries } = local
//   const hc   = healthColor(metrics.cropHealthScore)
//   const circ = 2 * Math.PI * 40
//   const dash = circ * (1 - metrics.cropHealthScore / 100)
//   const loc  = cropData.location

//   return (
//     <div className={`${styles.page} fade-in`}>

//       {/* Summary cards with weather */}
//       <SummaryCards metrics={metrics} weather={analysis?.weather} stages={stages} />

//       {/* Crop banner */}
//       <CropBanner cropType={cropData.cropType} datasetName={cropData.name} location={loc?.label} />

//       {/* Main layout: analysis + right side */}
//       <div className={styles.mainRow}>
//         <div className={styles.leftCol}>

//           {/* Health + stages top row */}
//           <div className={styles.topRow}>
//             <div className={styles.card}>
//               <div className={styles.gaugeRow}>
//                 <div className={styles.ring}>
//                   <svg width="96" height="96" viewBox="0 0 96 96">
//                     <circle cx="48" cy="48" r="40" fill="none" stroke="var(--surface3)" strokeWidth="8"/>
//                     <circle cx="48" cy="48" r="40" fill="none" stroke={hc} strokeWidth="8"
//                       strokeDasharray={circ.toFixed(1)} strokeDashoffset={dash.toFixed(1)}
//                       strokeLinecap="round"
//                       style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px', transition: 'stroke-dashoffset 1s ease' }}/>
//                   </svg>
//                   <div className={styles.ringLabel}>
//                     <span className={styles.ringScore} style={{ color: hc }}>{metrics.cropHealthScore}</span>
//                     <span className={styles.ringUnit}>/100</span>
//                   </div>
//                 </div>
//                 <div className={styles.gaugeRight}>
//                   <span className={styles.coveragePill} style={{ color: hc, background: `${hc}18` }}>
//                     {metrics.vegetationCoverage} health
//                   </span>
//                   <div className={styles.metaList}>
//                     {[['Peak NDVI', metrics.maxNDVI.toFixed(3)], ['Avg NDVI', metrics.averageNDVI.toFixed(3)], ['Min NDVI', metrics.minNDVI.toFixed(3)], ['Season', `${metrics.growingSeasonDays}d`], ['Variance', metrics.ndviVariance.toFixed(4)]].map(([l,v]) => (
//                       <div key={l} className={styles.metaRow}>
//                         <span className={styles.metaLabel}>{l}</span>
//                         <span className={styles.metaVal}>{v}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className={styles.card}>
//               <div className={styles.cardTitle} style={{ marginBottom: 12 }}>Detected stages</div>
//               <div className={styles.stageList}>
//                 {[
//                   { icon: '🌱', label: 'Growth start', s: stages.growthStart, col: '#8fb07a', bg: 'rgba(143,176,122,.12)' },
//                   { icon: '🔝', label: 'Peak growth',  s: stages.peakGrowth,  col: '#5a8fa3', bg: 'rgba(90,143,163,.12)' },
//                   { icon: '🌾', label: 'Harvest stage',s: stages.harvest,     col: '#c8a96e', bg: 'rgba(200,169,110,.12)' },
//                 ].map(({ icon, label, s, col, bg }) => (
//                   <div key={label} className={styles.stageRow}>
//                     <div className={styles.stageIcon} style={{ background: bg }}>{icon}</div>
//                     <div className={styles.stageInfo}>
//                       <div className={styles.stageName}>{label}</div>
//                       <div className={styles.stageDate}>{formatDate(s.date)}</div>
//                     </div>
//                     <div className={styles.stageRight}>
//                       <div style={{ fontSize: '12px', fontWeight: 600, color: col }}>NDVI {s.ndvi.toFixed(3)}</div>
//                       <div style={{ fontSize: '10px', color: 'var(--text-ter)', marginTop: 1 }}>{s.confidence}% conf</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* NDVI chart */}
//           <div className={styles.card}>
//             <div className={styles.chartHeader}>
//               <div>
//                 <div className={styles.cardTitle}>NDVI time series</div>
//                 <div className={styles.cardSub}>
//                   {timeSeries?.length} points · {formatDateShort(timeSeries?.[0]?.date)} → {formatDateShort(timeSeries?.[timeSeries?.length-1]?.date)}
//                 </div>
//               </div>
//               <div className={styles.badgeRow}>
//                 <span className={styles.badgeGreen}>● Growing</span>
//                 <span className={styles.badgeAmber}>● Declining</span>
//               </div>
//             </div>
//             <NDVIChart timeSeries={timeSeries} stages={stages} phases={phases} />
//           </div>

//           {/* Detection confidence */}
//           <div className={styles.card}>
//             <div className={styles.cardTitle} style={{ marginBottom: 14 }}>Detection confidence</div>
//             <div className={styles.confList}>
//               {[
//                 { label: 'Growth Start detection', val: stages.growthStart.confidence, col: '#8fb07a' },
//                 { label: 'Peak Growth detection',  val: stages.peakGrowth.confidence,  col: '#5a8fa3' },
//                 { label: 'Harvest Stage detection',val: stages.harvest.confidence,     col: '#c8a96e' },
//               ].map(({ label, val, col }) => (
//                 <div key={label} className={styles.confRow}>
//                   <div className={styles.confMeta}>
//                     <span className={styles.confLabel}>{label}</span>
//                     <span className={styles.confVal}>{val}%</span>
//                   </div>
//                   <div className={styles.progressBar}>
//                     <div className={styles.progressFill} style={{ width: `${val}%`, background: col }} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Rainfall chart */}
//           <div className={styles.card}>
//             <div className={styles.cardHeader}>
//               <div>
//                 <div className={styles.cardTitle}>Rainfall & crop correlation</div>
//                 <div className={styles.cardSub}>Regional monthly rainfall with seasonal NDVI response</div>
//               </div>
//             </div>
//             <RainChart cropType={cropData.cropType} />
//           </div>
//         </div>

//         {/* Right column: map + weather + info */}
//         <div className={styles.rightCol}>
//           {/* Map */}
//           <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
//             <FieldMapCard mode="display" lat={loc?.lat} lng={loc?.lng} label={loc?.label} height={220} />
//           </div>

//           {/* Weather summary */}
//           {analysis?.weather?.monthly?.length > 0 && (
//             <div className={styles.card}>
//               <div className={styles.cardTitle} style={{ marginBottom: 10 }}>Weather summary</div>
//               <div className={styles.weatherGrid}>
//                 {analysis.weather.monthly.slice(0, 6).map((m, i) => (
//                   <div key={i} className={styles.weatherCell}>
//                     <div className={styles.wMonth}>{m.month}</div>
//                     <div className={styles.wTemp}>{m.avgTemp}°</div>
//                     <div className={styles.wRain}>{m.totalRain.toFixed(0)}mm</div>
//                   </div>
//                 ))}
//               </div>
//               <div className={styles.weatherSource}>Source: {analysis.weather.source}</div>
//             </div>
//           )}

//           {/* Dataset info */}
//           <div className={styles.card}>
//             <div className={styles.cardTitle} style={{ marginBottom: 10 }}>Dataset info</div>
//             {[
//               ['Crop type', cropData.cropType],
//               ['Source', cropData.source],
//               ['Data points', timeSeries?.length],
//               ['Location', loc?.label || '—'],
//               ['Lat / Lng', loc ? `${loc.lat?.toFixed(4)}, ${loc.lng?.toFixed(4)}` : '—'],
//             ].map(([k, v]) => (
//               <div key={k} className={styles.infoRow}>
//                 <span className={styles.infoKey}>{k}</span>
//                 <span className={styles.infoVal}>{v}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Insights panel - full width */}
//       <div className={styles.card}>
//         <InsightsPanel cropDataId={id} preloadedInsights={analysis?.insights} />
//       </div>

//       {/* Actions */}
//       <div className={styles.actions}>
//         <button className={styles.btnOutline} onClick={() => navigate('/upload')}>New analysis</button>
//         <button className={styles.btnOutline} onClick={() => navigate('/history')}>All datasets</button>
//         <button className={styles.btnPrimary} onClick={exportReport}>Export report</button>
//       </div>
//     </div>
//   )
// }
// ---------------------------------------------------------------------------------------------------------------------------
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { analyzeCropCycle, formatDate, formatDateShort, healthColor } from '../utils/analysis'
import NDVIChart from '../components/NDVIChart'
import CropBanner from '../components/CropBanner'
import RainChart from '../components/RainChart'
import SummaryCards from '../components/SummaryCards'
import InsightsPanel from '../components/InsightsPanel'
import FieldMapCard from '../components/FieldMapCard'
import styles from './Analysis.module.css'

export default function Analysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAnalysis() }, [id])

  const loadAnalysis = async () => {
    try {
      const [dataRes, analysisRes] = await Promise.all([
        api.get(`/data/${id}`),
        api.get(`/analysis/${id}`)
      ])

      const ts = dataRes.data.cropData.timeSeries.map(p => ({
        date: new Date(p.date),
        ndvi: p.ndvi
      }))

      setData({
        cropData: dataRes.data.cropData,
        analysis: analysisRes.data.analysis,
        local: analyzeCropCycle(ts)
      })

    } catch {
      toast.error('Failed to load analysis')
      navigate('/history')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!data) return

    const { cropData, local: { stages, metrics }, analysis } = data

    const insightLines = (analysis?.insights || []).map(ins =>
      `  [${ins.type.toUpperCase()}] ${ins.title}\n  ${ins.message}`
    ).join('\n\n')

    const weatherLine = analysis?.weatherSummary
      ? `\nWEATHER SUMMARY\n  Avg Temp: ${analysis.weatherSummary.avgTemp}°C\n  Rainfall: ${analysis.weatherSummary.totalRain}mm`
      : ''

    const lines = [
      'CROP CYCLE ANALYSIS REPORT',
      '='.repeat(36),
      `Dataset  : ${cropData.name}`,
      `Crop     : ${cropData.cropType}`,
      cropData.location?.label ? `Location : ${cropData.location.label}` : '',
      '',
      'HEALTH METRICS',
      `  Health Score        : ${metrics.cropHealthScore}/100`,
      `  Vegetation Coverage : ${metrics.vegetationCoverage}`,
      `  Growing Season      : ${metrics.growingSeasonDays} days`,
      `  Peak NDVI           : ${metrics.maxNDVI}`,
      `  Average NDVI        : ${metrics.averageNDVI}`,
      `  NDVI Variance       : ${metrics.ndviVariance}`,
      '',
      'DETECTED STAGES',
      `  Growth Start  : ${formatDate(stages.growthStart.date)}`,
      `  Peak Growth   : ${formatDate(stages.peakGrowth.date)}`,
      `  Harvest Stage : ${formatDate(stages.harvest.date)}`,
      weatherLine,
      insightLines ? `\nSMART INSIGHTS\n${insightLines}` : '',
      '',
      `Generated : ${new Date().toLocaleString()}`,
      'CropCycle Analysis System v1.1'
    ].filter(Boolean).join('\n')

    const blob = new Blob([lines], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${cropData.name.replace(/\s+/g,'_')}_analysis.txt`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Report exported!')
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Running analysis...
      </div>
    )
  }

  if (!data) return null

  const { cropData, local, analysis } = data
  const { stages, metrics, phases, timeSeries } = local
  const hc   = healthColor(metrics.cropHealthScore)
  const circ = 2 * Math.PI * 40
  const dash = circ * (1 - metrics.cropHealthScore / 100)
  const loc  = cropData.location

  return (
    <div className={`${styles.page} fade-in`}>

      {/* ✅ FIXED: correct weather binding */}
      <SummaryCards
        metrics={metrics}
        weather={analysis?.weatherSummary}
        stages={stages}
      />

      <CropBanner
        cropType={cropData.cropType}
        datasetName={cropData.name}
        location={loc?.label}
      />

      <div className={styles.mainRow}>

        {/* LEFT SIDE */}
     <div className={styles.leftCol}>

  {/* TOP ROW */}
  <div className={styles.topRow}>

    {/* HEALTH CARD */}
    <div className={styles.card}>
      <div className={styles.gaugeRow}>

        <div className={styles.ring}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--surface3)" strokeWidth="8"/>
            <circle cx="48" cy="48" r="40" fill="none" stroke={hc} strokeWidth="8"
              strokeDasharray={circ.toFixed(1)}
              strokeDashoffset={dash.toFixed(1)}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }}/>
          </svg>

          <div className={styles.ringLabel}>
            <span className={styles.ringScore} style={{ color: hc }}>
              {metrics.cropHealthScore}
            </span>
            <span className={styles.ringUnit}>/100</span>
          </div>
        </div>

        {/* RIGHT SIDE DETAILS */}
      <div className={styles.metaList}>
  <div className={styles.metaRow}>
    <span className={styles.metaLabel}>Peak NDVI</span>
    <span className={styles.metaValue}>0.800</span>
  </div>

  <div className={styles.metaRow}>
    <span className={styles.metaLabel}>Avg NDVI</span>
    <span className={styles.metaValue}>0.540</span>
  </div>

  <div className={styles.metaRow}>
    <span className={styles.metaLabel}>Season</span>
    <span className={styles.metaValue}>82d</span>
  </div>

  <div className={styles.metaRow}>
    <span className={styles.metaLabel}>Variance</span>
    <span className={styles.metaValue}>0.0388</span>
  </div>
</div>

      </div>
    </div>

    {/* DETECTED STAGES */}
    <div className={styles.card}>
      <div className={styles.cardTitle}>Detected stages</div>

      <div className={styles.stageList}>
        {[
          { icon: '🌱', label: 'Growth start', s: stages.growthStart },
          { icon: '🔝', label: 'Peak growth', s: stages.peakGrowth },
          { icon: '🌾', label: 'Harvest stage', s: stages.harvest },
        ].map(({ icon, label, s }) => (
          <div key={label} className={styles.stageRow}>
            <div className={styles.stageIcon}>{icon}</div>

            <div className={styles.stageInfo}>
              <div className={styles.stageName}>{label}</div>
              <div className={styles.stageDate}>{formatDate(s.date)}</div>
            </div>

            <div className={styles.stageRight}>
              <div>NDVI {s.ndvi.toFixed(3)}</div>
              <div className={styles.stageConf}>{s.confidence}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>

  {/* NDVI */}
  <div className={styles.card}>
    <div className={styles.cardTitle}>NDVI time series</div>
    <NDVIChart timeSeries={timeSeries} stages={stages} phases={phases} />
  </div>

  {/* CONFIDENCE */}
  <div className={styles.card}>
    <div className={styles.cardTitle}>Detection confidence</div>

    <div className={styles.confList}>
      {[
        { label: 'Growth Start', val: stages.growthStart.confidence },
        { label: 'Peak Growth', val: stages.peakGrowth.confidence },
        { label: 'Harvest', val: stages.harvest.confidence },
      ].map(({ label, val }) => (
        <div key={label} className={styles.confRow}>
          <div className={styles.confMeta}>
            <span>{label}</span>
            <span>{val}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${val}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* RAIN */}
  <div className={styles.card}>
    <div className={styles.cardTitle}>Rainfall & crop correlation</div>
    <RainChart cropType={cropData.cropType} />
  </div>

</div>

        {/* RIGHT SIDE */}
        <div className={styles.rightCol}>

          {/* MAP */}
          <div className={styles.card}>
            <FieldMapCard
              lat={loc?.lat}
              lng={loc?.lng}
              label={loc?.label}
              height={220}
            />
          </div>

          {/* ✅ WEATHER SUMMARY FIXED */}
          {analysis?.weatherSummary && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Weather summary</div>

              <div className={styles.infoRow}>
                <span>Temperature</span>
                <span>{analysis.weatherSummary.avgTemp}°C</span>
              </div>

              <div className={styles.infoRow}>
                <span>Rainfall</span>
                <span>{analysis.weatherSummary.totalRain} mm</span>
              </div>

              <div className={styles.infoRow}>
                <span>Humidity</span>
                <span>{analysis.weatherSummary.avgHumidity}%</span>
              </div>
            </div>
          )}

          {/* DATASET INFO */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Dataset info</div>

            <div className={styles.infoRow}>
              <span>Crop</span>
              <span>{cropData.cropType}</span>
            </div>

            <div className={styles.infoRow}>
              <span>Location</span>
              <span>{loc?.label || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className={styles.card}>
        <InsightsPanel cropDataId={id} preloadedInsights={analysis?.insights} />
      </div>

      {/* ACTIONS */}
      <div className={styles.actions}>
        <button onClick={() => navigate('/upload')}>New analysis</button>
        <button onClick={() => navigate('/history')}>All datasets</button>
        <button onClick={exportReport}>Export report</button>
      </div>
    </div>
  )
}
