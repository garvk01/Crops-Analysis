/**
 * Client-side crop cycle analysis engine
 * Mirrors the backend analysisService.js for instant preview before API call
 */

export function smoothNDVI(series, windowSize = 3) {
  return series.map((point, i) => {
    const half = Math.floor(windowSize / 2)
    const start = Math.max(0, i - half)
    const end = Math.min(series.length - 1, i + half)
    const slice = series.slice(start, end + 1)
    const avg = slice.reduce((sum, p) => sum + p.ndvi, 0) / slice.length
    return { ...point, ndvi: avg }
  })
}

export function analyzeCropCycle(timeSeries) {
  if (!timeSeries || timeSeries.length < 5)
    throw new Error('Need at least 5 data points for analysis')

  const sorted = [...timeSeries].sort((a, b) => new Date(a.date) - new Date(b.date))
  const smoothed = smoothNDVI(sorted)
  const ndvis = sorted.map(p => p.ndvi)
  const maxNDVI = Math.max(...ndvis)
  const minNDVI = Math.min(...ndvis)
  const avgNDVI = ndvis.reduce((a, b) => a + b, 0) / ndvis.length

  // --- Growth Start ---
  const thr25 = minNDVI + (maxNDVI - minNDVI) * 0.25
  let growthStart = null
  for (let i = 1; i < smoothed.length - 2; i++) {
    if (smoothed[i].ndvi > thr25 && smoothed[i].ndvi > smoothed[i-1].ndvi && smoothed[i+1].ndvi > smoothed[i].ndvi) {
      growthStart = {
        date: sorted[i].date,
        ndvi: sorted[i].ndvi,
        confidence: Math.min(100, Math.round(((smoothed[i].ndvi - minNDVI) / (maxNDVI - minNDVI)) * 80 + 20))
      }
      break
    }
  }
  if (!growthStart) growthStart = { date: sorted[0].date, ndvi: sorted[0].ndvi, confidence: 50 }

  // --- Peak Growth ---
  let peakIdx = 0
  sorted.forEach((p, i) => { if (p.ndvi > sorted[peakIdx].ndvi) peakIdx = i })
  const peakGrowth = {
    date: sorted[peakIdx].date,
    ndvi: sorted[peakIdx].ndvi,
    confidence: Math.min(100, Math.round(sorted[peakIdx].ndvi * 100 + 40))
  }

  // --- Harvest ---
  const thr35 = minNDVI + (maxNDVI - minNDVI) * 0.35
  const post = sorted.slice(peakIdx + 1)
  let harvest = null
  for (let i = 1; i < post.length; i++) {
    if (post[i].ndvi < thr35 && post[i].ndvi < post[i-1].ndvi) {
      const drop = (maxNDVI - post[i].ndvi) / (maxNDVI - minNDVI)
      harvest = { date: post[i].date, ndvi: post[i].ndvi, confidence: Math.min(100, Math.round(drop * 90 + 10)) }
      break
    }
  }
  if (!harvest) { const l = sorted[sorted.length - 1]; harvest = { date: l.date, ndvi: l.ndvi, confidence: 55 } }

  // --- Metrics ---
  const variance = ndvis.reduce((s, v) => s + Math.pow(v - avgNDVI, 2), 0) / ndvis.length
  const growingSeasonDays = Math.round((new Date(harvest.date) - new Date(growthStart.date)) / 86400000)
  const cropHealthScore = Math.round(
    Math.min(40, maxNDVI * 50) +
    Math.min(30, avgNDVI * 40) +
    Math.min(20, growingSeasonDays / 10) +
    ((growthStart.confidence + peakGrowth.confidence + harvest.confidence) / 3) * 0.1
  )
  const vegetationCoverage = maxNDVI >= 0.7 ? 'Excellent' : maxNDVI >= 0.5 ? 'Good' : maxNDVI >= 0.3 ? 'Fair' : 'Poor'

  // --- Phases ---
  const firstDate = sorted[0].date
  const lastDate = sorted[sorted.length - 1].date
  const phases = [
    { name: 'Dormant',   start: firstDate,           end: growthStart.date, color: '#94a3b8', flex: 1   },
    { name: 'Growing',   start: growthStart.date,    end: peakGrowth.date,  color: '#4ade80', flex: 2   },
    { name: 'Peak',      start: peakGrowth.date,     end: peakGrowth.date,  color: '#22c55e', flex: 0.4 },
    { name: 'Declining', start: peakGrowth.date,     end: harvest.date,     color: '#facc15', flex: 1.5 },
    { name: 'Harvest',   start: harvest.date,        end: lastDate,         color: '#f97316', flex: 0.8 },
  ]

  return {
    stages: { growthStart, peakGrowth, harvest },
    metrics: {
      cropHealthScore,
      growingSeasonDays,
      averageNDVI:        +avgNDVI.toFixed(3),
      maxNDVI:            +maxNDVI.toFixed(3),
      minNDVI:            +minNDVI.toFixed(3),
      ndviVariance:       +variance.toFixed(4),
      vegetationCoverage,
    },
    phases,
    timeSeries: sorted,
  }
}

export function parseCSV(text) {
  const lines = text.trim().split('\n')
  const header = lines[0].toLowerCase().split(',').map(h => h.trim())
  const dateIdx = header.findIndex(h => h.includes('date'))
  const ndviIdx = header.findIndex(h => h.includes('ndvi') || h.includes('value'))
  if (dateIdx < 0 || ndviIdx < 0) throw new Error('CSV must have "date" and "ndvi" columns')
  return lines.slice(1).filter(l => l.trim()).map((line, i) => {
    const cols = line.split(',')
    const date = new Date(cols[dateIdx]?.trim())
    const ndvi = parseFloat(cols[ndviIdx]?.trim())
    if (isNaN(date.getTime())) throw new Error(`Invalid date at row ${i + 2}`)
    if (isNaN(ndvi)) throw new Error(`Invalid NDVI value at row ${i + 2}`)
    return { date, ndvi }
  })
}

export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function healthColor(score) {
  if (score >= 75) return '#3fa83a'
  if (score >= 50) return '#d4920f'
  return '#d44a2a'
}

export function cropIcon(type) {
  return { wheat: '🌾', rice: '🌿', corn: '🌽', soybean: '🫘', cotton: '🩶', other: '🌱' }[type] || '🌱'
}

export const DEMO_DATASETS = {
  wheat_india: {
    id: 'demo_wheat', name: 'Wheat — Punjab, India (2023)', cropType: 'wheat',
    location: 'Punjab, India', icon: '🌾',
    timeSeries: [
      { date: new Date('2023-11-01'), ndvi: 0.12 }, { date: new Date('2023-11-15'), ndvi: 0.15 },
      { date: new Date('2023-12-01'), ndvi: 0.22 }, { date: new Date('2023-12-15'), ndvi: 0.31 },
      { date: new Date('2024-01-01'), ndvi: 0.42 }, { date: new Date('2024-01-15'), ndvi: 0.55 },
      { date: new Date('2024-02-01'), ndvi: 0.67 }, { date: new Date('2024-02-15'), ndvi: 0.76 },
      { date: new Date('2024-03-01'), ndvi: 0.82 }, { date: new Date('2024-03-15'), ndvi: 0.85 },
      { date: new Date('2024-04-01'), ndvi: 0.80 }, { date: new Date('2024-04-15'), ndvi: 0.70 },
      { date: new Date('2024-05-01'), ndvi: 0.52 }, { date: new Date('2024-05-15'), ndvi: 0.35 },
      { date: new Date('2024-06-01'), ndvi: 0.18 },
    ]
  },
  rice_kerala: {
    id: 'demo_rice', name: 'Rice — Kerala, India (2023)', cropType: 'rice',
    location: 'Kerala, India', icon: '🌿',
    timeSeries: [
      { date: new Date('2023-06-01'), ndvi: 0.10 }, { date: new Date('2023-06-15'), ndvi: 0.18 },
      { date: new Date('2023-07-01'), ndvi: 0.30 }, { date: new Date('2023-07-15'), ndvi: 0.48 },
      { date: new Date('2023-08-01'), ndvi: 0.62 }, { date: new Date('2023-08-15'), ndvi: 0.74 },
      { date: new Date('2023-09-01'), ndvi: 0.81 }, { date: new Date('2023-09-15'), ndvi: 0.78 },
      { date: new Date('2023-10-01'), ndvi: 0.68 }, { date: new Date('2023-10-15'), ndvi: 0.55 },
      { date: new Date('2023-11-01'), ndvi: 0.38 }, { date: new Date('2023-11-15'), ndvi: 0.22 },
      { date: new Date('2023-12-01'), ndvi: 0.13 },
    ]
  },
  corn_maharashtra: {
    id: 'demo_corn', name: 'Corn — Maharashtra, India (2023)', cropType: 'corn',
    location: 'Maharashtra, India', icon: '🌽',
    timeSeries: [
      { date: new Date('2023-06-15'), ndvi: 0.08 }, { date: new Date('2023-07-01'), ndvi: 0.20 },
      { date: new Date('2023-07-15'), ndvi: 0.38 }, { date: new Date('2023-08-01'), ndvi: 0.58 },
      { date: new Date('2023-08-15'), ndvi: 0.72 }, { date: new Date('2023-09-01'), ndvi: 0.84 },
      { date: new Date('2023-09-15'), ndvi: 0.88 }, { date: new Date('2023-10-01'), ndvi: 0.83 },
      { date: new Date('2023-10-15'), ndvi: 0.71 }, { date: new Date('2023-11-01'), ndvi: 0.55 },
      { date: new Date('2023-11-15'), ndvi: 0.38 }, { date: new Date('2023-12-01'), ndvi: 0.20 },
    ]
  }
}
