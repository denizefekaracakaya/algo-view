import type { TNode } from '../engines/tree'
import type { NodeRole } from '../engines/bst'

interface Laid {
  key: number
  x: number
  y: number
  node: TNode
  parent: number | null
}

/** In-order layout: x = in-order rank, y = depth. Keeps BST order visible left→right. */
function layoutTree(root: TNode | null): Laid[] {
  const out: Laid[] = []
  let rank = 0
  const walk = (t: TNode | null, depth: number, parent: number | null) => {
    if (!t) return
    walk(t.left, depth + 1, t.key)
    out.push({ key: t.key, x: rank++, y: depth, node: t, parent })
    walk(t.right, depth + 1, t.key)
  }
  walk(root, 0, null)
  return out
}

const ROLE_TEXT: Record<NodeRole, string> = {
  current: 'şu anki düğüm',
  path: 'arama yolu',
  found: 'bulundu',
  new: 'yeni',
  removed: 'silinecek',
  successor: 'ardıl',
  focus: 'odak',
}

interface Props {
  root: TNode | null
  roles?: Record<number, NodeRole>
  labels?: Record<number, string>
  bad?: number[]
  label: string
  onNodeClick?: (key: number) => void
  probe?: { key: number; at: number | null } | null
  minWidth?: number
}

export function TreeView({ root, roles = {}, labels = {}, bad = [], label, onNodeClick, probe, minWidth = 320 }: Props) {
  const nodes = layoutTree(root)
  if (!root) return <p className="muted">Ağaç boş.</p>
  const gx = 44
  const gy = 58
  const r = 16
  const pad = 30
  const maxDepth = Math.max(...nodes.map((n) => n.y))
  const width = Math.max(minWidth, nodes.length * gx + pad * 2)
  const offset = (width - (nodes.length - 1) * gx) / 2
  const height = (maxDepth + 1) * gy + pad
  const pos = new Map(nodes.map((n) => [n.key, { x: offset + n.x * gx, y: pad + n.y * gy }]))
  const badSet = new Set(bad)
  const desc = (n: Laid) =>
    `${n.key}${n.node.color ? (n.node.color === 'R' ? ', kırmızı' : ', siyah') : ''}${roles[n.key] ? ', ' + ROLE_TEXT[roles[n.key]] : ''}${labels[n.key] ? ', ' + labels[n.key] : ''}${badSet.has(n.key) ? ', ihlal' : ''}`
  return (
    <svg className="tree-svg" viewBox={`0 0 ${width} ${height}`} width={width} role="img" aria-label={`${label}: ${nodes.map(desc).join('; ')}`}>
      {nodes.map((n) => {
        if (n.parent === null) return null
        const a = pos.get(n.parent)!
        const b = pos.get(n.key)!
        const onPath = (roles[n.key] && roles[n.key] !== 'removed') && (roles[n.parent] === 'path' || roles[n.parent] === 'current')
        return <line key={'e' + n.key} className={'edge' + (onPath ? ' path' : '')} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
      })}
      {nodes.map((n) => {
        const p = pos.get(n.key)!
        const role = roles[n.key]
        const cls = ['tree-node', n.node.color ? 'rb-' + n.node.color : '', role ? 'role-' + role : '', badSet.has(n.key) ? 'bad' : '', onNodeClick ? 'clickable' : ''].join(' ')
        return (
          <g
            key={n.key}
            className={cls}
            style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
            onClick={onNodeClick ? () => onNodeClick(n.key) : undefined}
            onKeyDown={onNodeClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onNodeClick(n.key)) : undefined}
            tabIndex={onNodeClick ? 0 : undefined}
            role={onNodeClick ? 'button' : undefined}
            aria-label={onNodeClick ? `Düğüm ${desc(n)}; rengini değiştir` : undefined}
          >
            <circle className="ring" r={r + 5} />
            <circle r={r} />
            <text>{n.key}</text>
            {labels[n.key] && (
              <text className="tag" x={r + 4} y={-r - 2} style={{ textAnchor: 'start' }}>
                {labels[n.key]}
              </text>
            )}
            {badSet.has(n.key) && (
              <text className="tag" x={-r - 4} y={-r - 2} style={{ textAnchor: 'end', fill: 'var(--st-bad)' }}>
                !
              </text>
            )}
          </g>
        )
      })}
      {probe && probe.at !== null && pos.get(probe.at) && (
        <g style={{ transform: `translate(${pos.get(probe.at)!.x + 26}px, ${pos.get(probe.at)!.y - 24}px)` }} className="tree-node">
          <rect x={-18} y={-11} width={36} height={22} rx={6} fill="var(--st-compare-bg)" stroke="var(--st-compare)" />
          <text style={{ fontSize: 12 }}>{probe.key}</text>
        </g>
      )}
    </svg>
  )
}
