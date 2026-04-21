import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { analyzeCropCycle, formatDate, formatDateShort, healthColor, cropIcon, DEMO_DATASETS } from '../utils/analysis'
import NDVIChart from '../components/NDVIChart'
import CropBanner from '../components/CropBanner'
import RainChart from '../components/RainChart'
import SummaryCards from '../components/SummaryCards'
import InsightsPanel from '../components/InsightsPanel'
import FieldMapCard from '../components/FieldMapCard'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const [datasets, setDatasets]     = useState([])
  const [featured, setFeatured]     = useState(null)
  const [featuredId, setFeaturedId] = useState(null)
  const [analysis, setAnalysis]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await api.get('/data')
      const ds  = res.data.datasets || []
      setDatasets(ds)

      if (ds.length > 0) {
        const latest = ds[0]
        const [dataRes, analysisRes] = await Promise.all([
          api.get(`/data/${latest._id}`),
          api.get(`/analysis/${latest._id}`).catch(() => ({ data: { analysis: null } }))
        ])
        const cd = dataRes.data.cropData
        const ts = cd.timeSeries.map(p => ({ date: new Date(p.date), ndvi: p.ndvi }))
        setFeatured({
          ...analyzeCropCycle(ts),
          datasetName: cd.name,
          cropType: cd.cropType,
          location: cd.location
        })
        setFeaturedId(latest._id)
        setAnalysis(analysisRes.data.analysis)
      } else {
        const demo = DEMO_DATASETS.wheat_india
        setFeatured({ ...analyzeCropCycle(demo.timeSeries), datasetName: demo.name, cropType: demo.cropType, location: null })
      }
    } catch {
      const demo = DEMO_DATASETS.wheat_india
      setFeatured({ ...analyzeCropCycle(demo.timeSeries), datasetName: demo.name, cropType: demo.cropType, location: null })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      Loading dashboard...
    </div>
  )

  if (!featured) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>🌱</div>
      <p>No datasets yet. Upload your first NDVI dataset to get started.</p>
      <button className={styles.btnPrimary} onClick={() => navigate('/upload')}>Start Analysis →</button>
    </div>
  )

  const { stages, metrics, phases, timeSeries } = featured
  const hc  = healthColor(metrics.cropHealthScore)
  const loc = featured.location
  const ringCirc = 2 * Math.PI * 33

  return (
    <div className={`${styles.page} fade-in`}>

      <SummaryCards metrics={metrics} weather={analysis?.weather} stages={stages} />

      <CropBanner cropType={featured.cropType || 'wheat'} datasetName={featured.datasetName} location={loc?.label} />

      <div className={styles.mainRow}>
        <div className={styles.chartSection}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>NDVI time series</div>
                <div className={styles.cardSub}>{featured.datasetName} · {timeSeries?.length} data points</div>
              </div>
              <div className={styles.badgeRow}>
                <span className={styles.badgeGreen}>● Growing</span>
                <span className={styles.badgeAmber}>● Declining</span>
              </div>
            </div>
            <NDVIChart timeSeries={timeSeries} stages={stages} phases={phases} />
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <div className={styles.cardTitle}>Rainfall & crop correlation</div>
                <div className={styles.cardSub}>Regional monthly rainfall (mm) with NDVI response</div>
              </div>
            </div>
            <RainChart cropType={featured.cropType || 'wheat'} />
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <FieldMapCard mode="display" lat={loc?.lat} lng={loc?.lng} label={loc?.label} height={200} />
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle} style={{ marginBottom: 12 }}>Crop stages</div>
            <div className={styles.stageList}>
              {[
                { emoji: '🌱', label: 'Growth start', s: stages.growthStart, col: '#8fb07a' },
                { emoji: '🔝', label: 'Peak growth',  s: stages.peakGrowth,  col: '#5a8fa3' },
                { emoji: '🌾', label: 'Harvest',      s: stages.harvest,     col: '#c8a96e' },
              ].map(({ emoji, label, s, col }) => (
                <div key={label} className={styles.stageRow}>
                  <div className={styles.stageEmoji}>{emoji}</div>
                  <div className={styles.stageInfo}>
                    <div className={styles.stageLbl}>{label}</div>
                    <div className={styles.stageDate}>{formatDate(s.date)}</div>
                  </div>
                  <span className={styles.stageNdvi} style={{ color: col }}>{s.ndvi.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.healthRow}>
              <div className={styles.ring}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="33" fill="none" stroke="var(--surface3)" strokeWidth="7"/>
                  <circle cx="40" cy="40" r="33" fill="none" stroke={hc} strokeWidth="7"
                    strokeDasharray={ringCirc.toFixed(1)}
                    strokeDashoffset={(ringCirc * (1 - metrics.cropHealthScore / 100)).toFixed(1)}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px', transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className={styles.ringLabel}>
                  <span className={styles.ringScore} style={{ color: hc }}>{metrics.cropHealthScore}</span>
                  <span className={styles.ringUnit}>/100</span>
                </div>
              </div>
              <div className={styles.healthMeta}>
                <div className={styles.healthTitle}>{metrics.vegetationCoverage} health</div>
                <div className={styles.healthSub}>{metrics.growingSeasonDays}d season · avg {metrics.averageNDVI.toFixed(2)}</div>
                {featuredId && (
                  <button className={styles.analyzeBtn} onClick={() => navigate(`/analysis/${featuredId}`)}>
                    Full analysis →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {(analysis?.insights?.length > 0 || featuredId) && (
        <div className={styles.card}>
          <InsightsPanel cropDataId={featuredId} preloadedInsights={analysis?.insights} />
        </div>
      )}

      {datasets.length > 1 && (
        <div>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Recent datasets</div>
            <button className={styles.btnOutline} onClick={() => navigate('/history')}>View all →</button>
          </div>
          <div className={styles.datasetGrid}>
            {datasets.slice(0, 3).map(d => (
              <div key={d._id} className={styles.dsCard} onClick={() => navigate(`/analysis/${d._id}`)}>
                <span className={styles.dsIcon}>{cropIcon(d.cropType)}</span>
                <div className={styles.dsInfo}>
                  <div className={styles.dsName}>{d.name}</div>
                  <div className={styles.dsMeta}>{d.cropType} · {d.source}</div>
                </div>
                <span className={styles.dsAction}>→</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
