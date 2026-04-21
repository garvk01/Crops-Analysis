import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from 'recharts'
import { formatDateShort } from '../utils/analysis'
import styles from './NDVIChart.module.css'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipDate}>{formatDateShort(d.date)}</div>
      <div className={styles.tooltipVal}>NDVI: <strong>{payload[0].value.toFixed(3)}</strong></div>
      {d.phase && <div className={styles.tooltipPhase}>{d.phase}</div>}
    </div>
  )
}

// Custom reference line label — rendered INSIDE the chart area near the top.
// margin.top is 36px so y+14 is always fully visible, never clipped.
function StageLabel({ viewBox, value, color }) {
  if (!viewBox) return null
  const { x, y } = viewBox
  const labelY = y + 14   // 14px below chart top edge — safe inside the 36px top margin
  const labelX = x + 4    // slightly right of the line
  return (
    <g>
      <rect
        x={labelX - 2} y={labelY - 11}
        width={value.length * 6.5 + 6} height={14}
        rx={3} fill={color} opacity={0.15}
      />
      <text
        x={labelX + 1} y={labelY}
        fill={color} fontSize={10} fontWeight={600}
        fontFamily="DM Sans, system-ui, sans-serif"
      >
        {value}
      </text>
    </g>
  )
}

export default function NDVIChart({ timeSeries, stages, phases }) {
  if (!timeSeries?.length) return null

  // Attach phase label to each point
  const data = timeSeries.map(p => {
    const date = new Date(p.date)
    let phase = 'Dormant'
    if (stages) {
      const gs = new Date(stages.growthStart.date)
      const pg = new Date(stages.peakGrowth.date)
      const hv = new Date(stages.harvest.date)
      if (date >= gs && date < pg)                          phase = 'Growing'
      else if (date.toDateString() === pg.toDateString())   phase = 'Peak'
      else if (date > pg && date < hv)                      phase = 'Declining'
      else if (date >= hv)                                  phase = 'Harvest'
    }
    return {
      date: p.date,
      ndvi: +p.ndvi.toFixed(3),
      label: formatDateShort(p.date),
      phase
    }
  })

  // Custom dot — highlight stage points
  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    const date = new Date(payload.date)
    const isGrowthStart = stages && date.toDateString() === new Date(stages.growthStart.date).toDateString()
    const isPeak        = stages && date.toDateString() === new Date(stages.peakGrowth.date).toDateString()
    const isHarvest     = stages && date.toDateString() === new Date(stages.harvest.date).toDateString()

    if (isPeak)         return <circle cx={cx} cy={cy} r={6} fill="#2f7fd4" stroke="white" strokeWidth={2} />
    if (isGrowthStart)  return <circle cx={cx} cy={cy} r={5} fill="#3fa83a" stroke="white" strokeWidth={2} />
    if (isHarvest)      return <circle cx={cx} cy={cy} r={5} fill="#d4920f" stroke="white" strokeWidth={2} />
    return <circle cx={cx} cy={cy} r={3} fill="#3fa83a" stroke="white" strokeWidth={1.5} />
  }

  return (
    <div className={styles.wrap}>
      {/* top: 36 gives enough room so no labels ever clip */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 36, right: 20, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,120,100,0.1)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--text-ter)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: 11, fill: 'var(--text-ter)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.toFixed(1)}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Phase background shading */}
          {stages && (
            <>
              <ReferenceArea
                x1={formatDateShort(stages.growthStart.date)}
                x2={formatDateShort(stages.peakGrowth.date)}
                fill="rgba(74,222,128,0.06)" stroke="none"
              />
              <ReferenceArea
                x1={formatDateShort(stages.peakGrowth.date)}
                x2={formatDateShort(stages.harvest.date)}
                fill="rgba(250,204,21,0.06)" stroke="none"
              />
            </>
          )}

          {/* Stage reference lines — labels rendered inside chart via custom SVG */}
          {stages && <>
            <ReferenceLine
              x={formatDateShort(stages.growthStart.date)}
              stroke="#3fa83a" strokeDasharray="4 3" strokeWidth={1.5}
              label={<StageLabel value="Start" color="#3fa83a" />}
            />
            <ReferenceLine
              x={formatDateShort(stages.peakGrowth.date)}
              stroke="#2f7fd4" strokeDasharray="4 3" strokeWidth={1.5}
              label={<StageLabel value="Peak" color="#2f7fd4" />}
            />
            <ReferenceLine
              x={formatDateShort(stages.harvest.date)}
              stroke="#d4920f" strokeDasharray="4 3" strokeWidth={1.5}
              label={<StageLabel value="Harvest" color="#d4920f" />}
            />
          </>}

          <Line
            type="monotone" dataKey="ndvi"
            stroke="#3fa83a" strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#3fa83a', stroke: 'white', strokeWidth: 2 }}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Phase bar */}
      {phases && (
        <div className={styles.phaseSection}>
          <div className={styles.phaseBar}>
            {phases.map(p => (
              <div key={p.name} className={styles.phaseSeg} style={{ background: p.color, flex: p.flex }} title={p.name} />
            ))}
          </div>
          <div className={styles.phaseLegend}>
            {phases.map(p => (
              <span key={p.name} className={styles.phaseItem}>
                <span className={styles.phaseDot} style={{ background: p.color }} />
                {p.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
