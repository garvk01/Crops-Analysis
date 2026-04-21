import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { CROP_INFO } from './CropBanner'
import styles from './RainChart.module.css'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map(p => (
        <div key={p.name} className={styles.tooltipRow}>
          <span style={{ color: p.color }}>■</span>
          <span>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(p.name === 'NDVI' ? 2 : 0) : p.value}{p.name === 'Rainfall' ? ' mm' : ''}</strong></span>
        </div>
      ))}
    </div>
  )
}

export default function RainChart({ cropType = 'wheat' }) {
  const info = CROP_INFO[cropType] || CROP_INFO.other

  // Build bell-curve NDVI approximation to match rainfall months
  const n = info.rainfall.length
  const data = info.rainfallMonths.map((month, i) => {
    const t = i / (n - 1)
    // peak at ~55% of season
    const ndvi = Math.max(0.08, +(Math.sin(t * Math.PI * 0.95 + 0.05) * 0.76 + 0.1).toFixed(2))
    return { month, rainfall: info.rainfall[i], ndvi }
  })

  return (
    <div className={styles.wrap}>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.barIcon} />
          Rainfall (mm)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.lineIcon} />
          NDVI response
        </span>
      </div>
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={data} margin={{ top: 8, right: 40, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,120,100,0.09)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--text-ter)' }}
              tickLine={false} axisLine={false}
            />
            <YAxis
              yAxisId="rain"
              orientation="left"
              tick={{ fontSize: 10.5, fill: 'var(--text-ter)' }}
              tickLine={false} axisLine={false}
              label={{ value: 'mm', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--text-ter)', offset: 8 }}
              width={36}
            />
            <YAxis
              yAxisId="ndvi"
              orientation="right"
              domain={[0, 1]}
              tick={{ fontSize: 10.5, fill: 'var(--text-ter)' }}
              tickLine={false} axisLine={false}
              tickFormatter={v => v.toFixed(1)}
              label={{ value: 'NDVI', angle: 90, position: 'insideRight', fontSize: 10, fill: 'var(--text-ter)', offset: 8 }}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="rain" dataKey="rainfall" name="Rainfall"
              fill="rgba(47,127,212,0.22)" stroke="#2f7fd4" strokeWidth={1.5}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="ndvi" dataKey="ndvi" name="NDVI"
              stroke="#3fa83a" strokeWidth={2.5}
              dot={{ r: 3.5, fill: '#3fa83a', stroke: 'white', strokeWidth: 2 }}
              activeDot={{ r: 5.5 }}
              type="monotone"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
