import type { Graph, GEdge } from '../engines/graph'
import { tx } from '../i18n/lang'

/** Visual states shared by the graph visualizers. Colors come from the existing state tokens. */
export type Tone = 'default' | 'active' | 'frontier' | 'done' | 'muted' | 'bad' | 'pivot' | 'g0' | 'g1' | 'g2' | 'g3' | 'g4' | 'g5'

const FILL: Record<Tone, [string, string]> = {
  default: ['var(--surface)', 'var(--border-strong)'],
  active: ['var(--st-compare-bg)', 'var(--st-compare)'],
  frontier: ['var(--st-less-bg)', 'var(--st-less)'],
  done: ['var(--st-sorted-bg)', 'var(--st-sorted)'],
  muted: ['var(--st-elim-bg)', 'var(--st-elim)'],
  bad: ['var(--st-bad-bg)', 'var(--st-bad)'],
  pivot: ['var(--st-pivot-bg)', 'var(--st-pivot)'],
  g0: ['var(--st-less-bg)', 'var(--st-less)'],
  g1: ['var(--st-greater-bg)', 'var(--st-greater)'],
  g2: ['var(--st-sorted-bg)', 'var(--st-sorted)'],
  g3: ['var(--st-pivot-bg)', 'var(--st-pivot)'],
  g4: ['var(--st-compare-bg)', 'var(--st-compare)'],
  g5: ['var(--st-bad-bg)', 'var(--st-bad)'],
}

const toneText = (t: Tone): string =>
  ({
    default: '',
    active: tx('işleniyor', 'being processed'),
    frontier: tx('keşfedildi', 'discovered'),
    done: tx('bitti', 'finished'),
    muted: tx('dışarıda', 'excluded'),
    bad: tx('sorunlu', 'problem'),
    pivot: tx('vurgulu', 'highlighted'),
    g0: tx('grup 1', 'group 1'),
    g1: tx('grup 2', 'group 2'),
    g2: tx('grup 3', 'group 3'),
    g3: tx('grup 4', 'group 4'),
    g4: tx('grup 5', 'group 5'),
    g5: tx('grup 6', 'group 6'),
  })[t]

export interface NodeLook {
  tone?: Tone
  /** Small text under the node (distance, times, key…). */
  sub?: string
  /** Small tag above-right of the node (s, t, x…). */
  tag?: string
}

export interface EdgeLook {
  tone?: 'default' | 'active' | 'tree' | 'muted' | 'bad' | 'pivot'
  /** Replaces the weight label. */
  label?: string
  dashed?: boolean
  hidden?: boolean
  /** Bend the edge (used for antiparallel residual edges). */
  bend?: number
}

const EDGE_COLOR: Record<NonNullable<EdgeLook['tone']>, string> = {
  default: 'var(--border-strong)',
  active: 'var(--st-compare)',
  tree: 'var(--st-sorted)',
  muted: 'var(--surface-3)',
  bad: 'var(--st-bad)',
  pivot: 'var(--st-pivot)',
}

interface Props {
  graph: Graph
  label: string
  node?: (id: string) => NodeLook
  edge?: (e: GEdge, index: number) => EdgeLook
  /** Extra edges drawn on top (e.g. residual back edges), with their own looks. */
  extra?: { e: GEdge; look: EdgeLook }[]
  height?: number
}

const W = 560
const R = 17

/** Draws a small graph with fixed node positions; every visual state is also described in the aria label. */
export function GraphView({ graph, label, node = () => ({}), edge = () => ({}), extra = [], height = 300 }: Props) {
  const padX = 34
  const padY = 34
  const pos = new Map(graph.nodes.map((n) => [n.id, { x: padX + (n.x / 100) * (W - 2 * padX), y: padY + (n.y / 100) * (height - 2 * padY) }]))
  const markerId = `arrow-${label.replace(/[^a-z0-9]/gi, '').slice(0, 20)}`
  const all = [...graph.edges.map((e, i) => ({ e, look: edge(e, i), key: 'e' + i })), ...extra.map((x, i) => ({ ...x, key: 'x' + i }))]
  const describeNode = (id: string) => {
    const l = node(id)
    return [id, l.tag, l.sub, l.tone && l.tone !== 'default' ? toneText(l.tone) : ''].filter(Boolean).join(' ')
  }
  const describeEdge = (e: GEdge, l: EdgeLook) =>
    `${e.u}${graph.directed ? '→' : '–'}${e.v}${l.label ?? (e.w !== undefined ? ' ' + e.w : '')}${l.tone && l.tone !== 'default' ? ' (' + l.tone + ')' : ''}`
  return (
    <svg
      className="graph-svg"
      viewBox={`0 0 ${W} ${height}`}
      role="img"
      aria-label={`${label}. ${tx('Düğümler', 'Nodes')}: ${graph.nodes.map((n) => describeNode(n.id)).join('; ')}. ${tx('Kenarlar', 'Edges')}: ${all
        .filter((a) => !a.look.hidden)
        .map((a) => describeEdge(a.e, a.look))
        .join('; ')}`}
    >
      <defs>
        {(['default', 'active', 'tree', 'muted', 'bad', 'pivot'] as const).map((t) => (
          <marker key={t} id={`${markerId}-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_COLOR[t]} />
          </marker>
        ))}
      </defs>
      {all.map(({ e, look, key }) => {
        if (look.hidden) return null
        const a = pos.get(e.u)!
        const b = pos.get(e.v)!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.hypot(dx, dy) || 1
        const ux = dx / len
        const uy = dy / len
        const bend = look.bend ?? 0
        // Control point perpendicular to the edge for bent edges.
        const mx = (a.x + b.x) / 2 - uy * bend
        const my = (a.y + b.y) / 2 + ux * bend
        const sx = a.x + ux * R
        const sy = a.y + uy * R
        const ex = b.x - ux * (R + (graph.directed ? 3 : 0))
        const ey = b.y - uy * (R + (graph.directed ? 3 : 0))
        const tone = look.tone ?? 'default'
        const d = bend ? `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}` : `M ${sx} ${sy} L ${ex} ${ey}`
        const text = look.label ?? (e.w !== undefined ? String(e.w) : '')
        const lx = bend ? (sx + 2 * mx + ex) / 4 : (sx + ex) / 2
        const ly = bend ? (sy + 2 * my + ey) / 4 : (sy + ey) / 2
        return (
          <g key={key} className={'g-edge g-edge-' + tone}>
            <path
              d={d}
              fill="none"
              stroke={EDGE_COLOR[tone]}
              strokeWidth={tone === 'tree' || tone === 'active' || tone === 'pivot' ? 3.2 : tone === 'muted' ? 1.4 : 2}
              strokeDasharray={look.dashed ? '5 4' : undefined}
              markerEnd={graph.directed ? `url(#${markerId}-${tone})` : undefined}
            />
            {text && (
              <g transform={`translate(${lx - uy * 9}, ${ly + ux * 9})`}>
                <rect x={-(text.length * 3.6 + 5)} y={-9} width={text.length * 7.2 + 10} height={17} rx={5} fill="var(--surface)" stroke={tone === 'default' || tone === 'muted' ? 'var(--border)' : EDGE_COLOR[tone]} />
                <text className="g-weight" textAnchor="middle" dy="4" style={{ fill: tone === 'muted' ? 'var(--muted)' : 'var(--text)' }}>
                  {text}
                </text>
              </g>
            )}
          </g>
        )
      })}
      {graph.nodes.map((n) => {
        const p = pos.get(n.id)!
        const l = node(n.id)
        const [fill, stroke] = FILL[l.tone ?? 'default']
        return (
          <g key={n.id} className="g-node" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
            <circle r={R} fill={fill} stroke={stroke} strokeWidth={l.tone && l.tone !== 'default' ? 2.6 : 1.6} />
            <text className="g-id" textAnchor="middle" dy="5">
              {n.id}
            </text>
            {l.sub && (
              <text className="g-sub" textAnchor="middle" y={R + 14}>
                {l.sub}
              </text>
            )}
            {l.tag && (
              <text className="g-tag" x={R + 2} y={-R + 2}>
                {l.tag}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
