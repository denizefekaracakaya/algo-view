import type { ReactElement } from 'react'
/** Small decorative illustration for a lesson (dashboard cards). Purely visual: hidden from screen readers. */
const A = 'var(--accent)'
const S = 'var(--accent-soft)'
const M = 'var(--border-strong)'
const R = 'var(--rb-red)'
const B = 'var(--rb-black)'

function Bars({ hs, hl = [], lift }: { hs: number[]; hl?: number[]; lift?: number }) {
  return (
    <>
      {hs.map((h, i) => (
        <rect key={i} x={6 + i * 10} y={(lift === i ? 30 : 40) - h} width={7} height={h} rx={1.5} fill={hl.includes(i) ? A : S} stroke={hl.includes(i) ? A : M} strokeWidth={0.8} />
      ))}
    </>
  )
}

function Tree({ colors }: { colors?: string[] }) {
  const pts = [
    [44, 8],
    [26, 22],
    [62, 22],
    [16, 36],
    [36, 36],
    [72, 36],
  ]
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
  ]
  return (
    <>
      {edges.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={M} strokeWidth={1.2} />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill={colors ? colors[i] : i === 0 ? A : S} stroke={colors ? colors[i] : A} strokeWidth={1} />
      ))}
    </>
  )
}


/** Tiny graph: nodes as [x, y], edges as index pairs; `hl` nodes and `he` edges use the accent color. */
function Mini({ pts, edges, hl = [], he = [], fills }: { pts: number[][]; edges: number[][]; hl?: number[]; he?: number[]; fills?: string[] }) {
  return (
    <>
      {edges.map(([a, b], i) => (
        <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={he.includes(i) ? A : M} strokeWidth={he.includes(i) ? 2 : 1.1} />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4.5} fill={fills ? fills[i] : hl.includes(i) ? A : S} stroke={A} strokeWidth={0.9} />
      ))}
    </>
  )
}

const GP = [
  [10, 23],
  [30, 8],
  [30, 38],
  [56, 8],
  [56, 38],
  [78, 23],
]
const GE = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
]

const DRAW: Record<string, () => ReactElement> = {
  'l1-why': () => (
    <>
      <path d="M6 42 Q 40 40 82 6" fill="none" stroke={A} strokeWidth={2} />
      <path d="M6 30 Q 50 26 82 16" fill="none" stroke={M} strokeWidth={2} strokeDasharray="3 3" />
    </>
  ),
  'l1-karatsuba': () => (
    <>
      <rect x={30} y={4} width={28} height={10} rx={3} fill={A} />
      {[8, 34, 60].map((x) => (
        <g key={x}>
          <line x1={44} y1={14} x2={x + 10} y2={28} stroke={M} />
          <rect x={x} y={28} width={20} height={10} rx={3} fill={S} stroke={A} strokeWidth={0.8} />
        </g>
      ))}
    </>
  ),
  'l2-insertion': () => <Bars hs={[8, 14, 22, 12, 28, 18, 32]} hl={[3]} lift={3} />,
  'l2-mergesort': () => (
    <>
      {[[30, 4, 28], [12, 18, 24], [52, 18, 24], [6, 32, 14], [26, 32, 14], [46, 32, 14], [66, 32, 14]].map(([x, y, w], i) => (
        <rect key={i} x={x} y={y} width={w} height={8} rx={2} fill={i === 0 ? A : S} stroke={A} strokeWidth={0.8} />
      ))}
    </>
  ),
  'l2-asymptotics': () => (
    <>
      <path d="M6 40 Q 40 34 82 8" fill="none" stroke={M} strokeWidth={1.5} strokeDasharray="4 3" />
      <path d="M6 42 Q 45 40 82 18" fill="none" stroke={A} strokeWidth={2} />
      <line x1={30} y1={4} x2={30} y2={44} stroke={M} strokeDasharray="2 2" />
    </>
  ),
  'l3-master': () => (
    <>
      {[0, 1, 2].map((l) =>
        Array.from({ length: 2 ** l }, (_, i) => <rect key={l + '-' + i} x={8 + (i * 72) / 2 ** l} y={6 + l * 13} width={72 / 2 ** l - 3} height={9} rx={2} fill={l === 0 ? A : S} stroke={A} strokeWidth={0.7} />),
      )}
    </>
  ),
  'l3-substitution': () => (
    <text x={44} y={30} textAnchor="middle" fontFamily="var(--mono)" fontSize={13} fontWeight={700} fill={A}>
      T(n) ≤ Cn
    </text>
  ),
  'l4-select': () => (
    <>
      <Bars hs={[14, 26, 8, 20, 32, 11, 23]} hl={[3]} />
      <text x={41} y={10} fontSize={8} fontFamily="var(--mono)" fill={A} textAnchor="middle">
        k
      </text>
    </>
  ),
  'l5-quicksort': () => (
    <>
      <Bars hs={[10, 14, 8, 22, 30, 26, 34]} hl={[3]} />
    </>
  ),
  'l5-expected': () => (
    <>
      {[4, 9, 16, 22, 18, 10, 5].map((h, i) => (
        <rect key={i} x={10 + i * 10} y={40 - h} width={8} height={h} rx={1} fill={S} stroke={A} strokeWidth={0.8} />
      ))}
      <line x1={44} y1={6} x2={44} y2={42} stroke={A} strokeWidth={1.5} strokeDasharray="3 2" />
    </>
  ),
  'l6-lower-bound': () => <Tree />,
  'l6-bucketsort': () => (
    <>
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${8 + i * 19} 18 v20 h15 v-20`} fill="none" stroke={A} strokeWidth={1.4} />
      ))}
      {[[11, 30], [30, 30], [30, 23], [49, 30], [68, 30], [68, 23], [68, 16]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={9} height={6} rx={1} fill={S} stroke={A} strokeWidth={0.7} />
      ))}
    </>
  ),
  'l6-compare': () => (
    <>
      {[0, 1, 2, 3].map((r) => (
        <rect key={r} x={8} y={6 + r * 9} width={72} height={7} rx={1.5} fill={r === 2 ? S : 'transparent'} stroke={M} strokeWidth={0.7} />
      ))}
    </>
  ),
  'l7-bst': () => <Tree />,
  'l7-redblack': () => <Tree colors={[B, R, B, B, B, R]} />,
  'l7-compare': () => (
    <>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={10 + i * 8} cy={8 + i * 9} r={3.5} fill={S} stroke={A} />
      ))}
      {[[64, 10], [54, 24], [74, 24], [48, 38], [60, 38]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={i === 0 ? B : S} stroke={A} />
      ))}
    </>
  ),
  'l8-hashing': () => (
    <>
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x={6} y={4 + r * 10} width={12} height={8} rx={1.5} fill={S} stroke={A} strokeWidth={0.8} />
          {Array.from({ length: [2, 0, 3, 1][r] }, (_, k) => (
            <rect key={k} x={24 + k * 18} y={4 + r * 10} width={14} height={8} rx={2} fill={r === 2 && k === 2 ? A : 'transparent'} stroke={M} strokeWidth={0.8} />
          ))}
        </g>
      ))}
    </>
  ),
  'l9-graphs': () => <Mini pts={GP} edges={GE} fills={[A, S, S, 'transparent', 'transparent', 'transparent']} />,
  'l9-dfs': () => <Mini pts={GP} edges={GE} hl={[0, 1, 3, 5]} he={[0, 2, 5]} />,
  'l10-scc': () => <Mini pts={GP} edges={GE} fills={[A, A, A, R, R, R]} />,
  'l11-dijkstra': () => <Mini pts={GP} edges={GE} hl={[0, 2, 3, 5]} he={[1, 3, 5]} />,
  'l12-bellman-ford': () => (
    <>
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          {[0, 1, 2, 3, 4].map((c) => (
            <rect key={c} x={8 + c * 15} y={4 + r * 10} width={13} height={8} rx={1.5} fill={c <= r ? S : 'transparent'} stroke={M} strokeWidth={0.7} />
          ))}
        </g>
      ))}
    </>
  ),
  'l12-floyd': () => (
    <>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3].map((c) => <rect key={r * 4 + c} x={22 + c * 11} y={4 + r * 10} width={9} height={8} rx={1.5} fill={r === 1 || c === 1 ? S : 'transparent'} stroke={r === 2 && c === 3 ? A : M} strokeWidth={r === 2 && c === 3 ? 1.6 : 0.7} />),
      )}
    </>
  ),
  'l13-lcs': () => (
    <>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => <rect key={r * 5 + c} x={14 + c * 12} y={4 + r * 10} width={10} height={8} rx={1.5} fill={r === c || r === c - 1 ? S : 'transparent'} stroke={M} strokeWidth={0.7} />),
      )}
    </>
  ),
  'l13-knapsack': () => (
    <>
      <path d="M24 16 Q24 6 44 6 Q64 6 64 16" fill="none" stroke={A} strokeWidth={1.6} />
      <rect x={18} y={16} width={52} height={26} rx={6} fill={S} stroke={A} strokeWidth={1} />
      <rect x={26} y={24} width={12} height={12} rx={2} fill={A} />
      <rect x={42} y={28} width={18} height={8} rx={2} fill="transparent" stroke={A} />
    </>
  ),
  'l14-greedy': () => (
    <>
      {[
        [6, 30, 1],
        [22, 44, 0],
        [34, 52, 1],
        [48, 82, 0],
        [58, 80, 1],
      ].map(([x1, x2, on], i) => (
        <rect key={i} x={x1} y={6 + i * 8} width={x2 - x1} height={6} rx={2} fill={on ? A : 'transparent'} stroke={on ? A : M} strokeWidth={0.8} />
      ))}
    </>
  ),
  'l14-huffman': () => (
    <Mini
      pts={[
        [44, 6],
        [24, 22],
        [64, 22],
        [12, 38],
        [36, 38],
      ]}
      edges={[
        [0, 1],
        [0, 2],
        [1, 3],
        [1, 4],
      ]}
      fills={['transparent', 'transparent', A, S, S]}
    />
  ),
  'l15-mst': () => <Mini pts={GP} edges={GE} he={[0, 1, 3, 5, 6]} />,
  'l16-maxflow': () => <Mini pts={GP} edges={GE} hl={[0, 5]} he={[1, 3, 5]} />,
  'l17-stable-matching': () => (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx={20} cy={8 + i * 15} r={4.5} fill={S} stroke={A} />
          <circle cx={68} cy={8 + i * 15} r={4.5} fill={S} stroke={A} />
        </g>
      ))}
      <line x1={25} y1={8} x2={63} y2={23} stroke={A} strokeWidth={2} />
      <line x1={25} y1={23} x2={63} y2={38} stroke={A} strokeWidth={2} />
      <line x1={25} y1={38} x2={63} y2={8} stroke={A} strokeWidth={2} />
    </>
  ),
}

export function LessonThumb({ id }: { id: string }) {
  const draw = DRAW[id]
  return (
    <svg className="lesson-thumb" viewBox="0 0 88 46" aria-hidden focusable="false">
      {draw ? draw() : null}
    </svg>
  )
}
