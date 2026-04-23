import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { analyzeCropCycle, formatDate, healthColor } from '../utils/analysis'
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
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalysis()
  }, [id])

  const loadAnalysis = async () => {
    try {
      const [dataRes, analysisRes] = await Promise.all([
        api.get(`/api/data/${id}`),
        api.get(`/api/analysis/${id}`)
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
  const hc = healthColor(metrics.cropHealthScore)
  const circ = 2 * Math.PI * 40
  const dash = circ * (1 - metrics.cropHealthScore / 100)
  const loc = cropData.location

  return (
    <div className={`${styles.page} fade-in`}>

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
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke={hc}
                      strokeWidth="8"
                      strokeDasharray={circ.toFixed(1)}
                      strokeDashoffset={dash.toFixed(1)}
                      strokeLinecap="round"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px' }}
                    />
                  </svg>

                  <div className={styles.ringLabel}>
                    <span className={styles.ringScore} style={{ color: hc }}>
                      {metrics.cropHealthScore}
                    </span>
                    <span className={styles.ringUnit}>/100</span>
                  </div>
                </div>

                <div className={styles.metaList}>
                  <div className={styles.metaRow}>
                    <span>Peak NDVI</span>
                    <span>{metrics.maxNDVI.toFixed(3)}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span>Avg NDVI</span>
                    <span>{metrics.averageNDVI.toFixed(3)}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span>Season</span>
                    <span>{metrics.growingSeasonDays}d</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span>Variance</span>
                    <span>{metrics.ndviVariance.toFixed(4)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* STAGES */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Detected stages</div>

              {[
                { label: 'Growth start', s: stages.growthStart },
                { label: 'Peak growth', s: stages.peakGrowth },
                { label: 'Harvest stage', s: stages.harvest },
              ].map(({ label, s }) => (
                <div key={label} className={styles.stageRow}>
                  <div>{label}</div>
                  <div>{formatDate(s.date)}</div>
                  <div>NDVI {s.ndvi.toFixed(3)}</div>
                </div>
              ))}
            </div>

          </div>

          {/* NDVI */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>NDVI time series</div>
            <NDVIChart timeSeries={timeSeries} stages={stages} phases={phases} />
          </div>

          {/* RAIN */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Rainfall</div>
            <RainChart cropType={cropData.cropType} />
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className={styles.rightCol}>

          <div className={styles.card}>
            <FieldMapCard
              lat={loc?.lat}
              lng={loc?.lng}
              label={loc?.label}
              height={220}
            />
          </div>

          {analysis?.weatherSummary && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Weather</div>
              <div>Temp: {analysis.weatherSummary.avgTemp}°C</div>
              <div>Rain: {analysis.weatherSummary.totalRain} mm</div>
            </div>
          )}

        </div>

      </div>

      <div className={styles.card}>
        <InsightsPanel cropDataId={id} preloadedInsights={analysis?.insights} />
      </div>

    </div>
  )
}

