import { useState } from 'react'
import { tx } from '../i18n/lang'

export interface Series {
  name: string
  color: string
  points: { x: number; y: number }[]
  dashed?: boolean
  /** Draw as dots only (used for empirical measurements). */
  dots?: boolean
}

interface Props {
  series: Series[]
  logY?: boolean
  xLabel: string
  yLabel: string
  title: string
  height?: number
}

const fmtNum = (v: number) => {
  if (!Number.isFinite(v)) return '∞'
  if (Math.abs(v) >= 1e6) return v.toExponential(1).replace('e+', 'e')
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString('tr-TR')
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

/** Minimal SVG line chart with one y-axis, optional log scale, legend and hover read-out. */
export function LineChart({ series, logY = false, xLabel, yLabel, title, height = 280 }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const W = 640
  const H = height
  const m = { l: 56, r: 14, t: 12, b: 40 }
  const xs = series.flatMap((s) => s.points.map((p) => p.x))
  const ys = series.flatMap((s) => s.points.map((p) => p.y)).filter((y) => Number.isFinite(y) && (!logY || y > 0))
  if (!xs.length || !ys.length) return <p className="muted">{tx('Gösterilecek veri yok.', 'No data to show.')}</p>
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const tY = (y: number) => (logY ? Math.log10(Math.max(y, 1e-9)) : y)
  const yMin = logY ? Math.floor(Math.min(...ys.map(tY))) : 0
  const yMax = logY ? Math.ceil(Math.max(...ys.map(tY))) : Math.max(...ys) * 1.05
  const sx = (x: number) => m.l + ((x - x0) / Math.max(1e-9, x1 - x0)) * (W - m.l - m.r)
  const sy = (y: number) => H - m.b - ((tY(y) - yMin) / Math.max(1e-9, yMax - yMin)) * (H - m.t - m.b)
  const ticksY = logY
    ? Array.from({ length: yMax - yMin + 1 }, (_, i) => 10 ** (yMin + i))
    : Array.from({ length: 5 }, (_, i) => (yMax * i) / 4)
  const ticksX = Array.from({ length: 6 }, (_, i) => x0 + ((x1 - x0) * i) / 5)
  const allX = [...new Set(xs)].sort((a, b) => a - b)
  const hx = hover !== null ? allX[hover] : null

  return (
    <figure style={{ margin: 0, position: 'relative' }}>
      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={title}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          const px = ((e.clientX - rect.left) / rect.width) * W
          let best = 0
          allX.forEach((x, i) => {
            if (Math.abs(sx(x) - px) < Math.abs(sx(allX[best]) - px)) best = i
          })
          setHover(best)
        }}
      >
        {ticksY.map((t, i) => (
          <g key={i}>
            <line className="grid" x1={m.l} x2={W - m.r} y1={sy(t)} y2={sy(t)} />
            <text className="axis" x={m.l - 6} y={sy(t)} textAnchor="end" dominantBaseline="central">
              {fmtNum(t)}
            </text>
          </g>
        ))}
        {ticksX.map((t, i) => (
          <text key={i} className="axis" x={sx(t)} y={H - m.b + 16} textAnchor="middle">
            {fmtNum(Math.round(t))}
          </text>
        ))}
        <text className="axis" x={(m.l + W - m.r) / 2} y={H - 4} textAnchor="middle">
          {xLabel}
        </text>
        <text className="axis" transform={`translate(12 ${(m.t + H - m.b) / 2}) rotate(-90)`} textAnchor="middle">
          {yLabel}
        </text>
        {series.map((s) => {
          const pts = s.points.filter((p) => Number.isFinite(p.y) && (!logY || p.y > 0) && tY(p.y) <= yMax + 1e-9)
          if (s.dots)
            return (
              <g key={s.name}>
                {pts.map((p, i) => (
                  <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
                ))}
              </g>
            )
          return (
            <polyline
              key={s.name}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '6 4' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={pts.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}
            />
          )
        })}
        {hx !== null && <line x1={sx(hx)} x2={sx(hx)} y1={m.t} y2={H - m.b} stroke="var(--muted)" strokeDasharray="3 3" />}
      </svg>
      {hx !== null && (
        <div className="chart-tip" style={{ left: `${(sx(hx) / W) * 100}%`, top: 8, transform: sx(hx) > W * 0.6 ? 'translateX(-105%)' : 'translateX(8px)' }}>
          <strong>n = {fmtNum(hx)}</strong>
          {series.map((s) => {
            const p = s.points.find((q) => q.x === hx)
            return p ? (
              <div key={s.name}>
                <span style={{ color: s.color }}>■</span> {s.name}: {fmtNum(p.y)}
              </div>
            ) : null
          })}
        </div>
      )}
      <figcaption className="legend">
        {series.map((s) => (
          <span key={s.name}>
            <svg width="22" height="10" aria-hidden>
              {s.dots ? <circle cx="11" cy="5" r="4" fill={s.color} /> : <line x1="1" x2="21" y1="5" y2="5" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dashed ? '5 3' : undefined} />}
            </svg>
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}
