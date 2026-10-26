/**
 * Small graph model shared by the graph lectures (9–11, 15, 16). Nodes carry a fixed drawing position
 * (0–100 on both axes) so that every visualizer can draw the same graph the same way.
 */

export interface GNode {
  id: string
  x: number
  y: number
}

export interface GEdge {
  u: string
  v: string
  w?: number
}

export interface Graph {
  directed: boolean
  nodes: GNode[]
  edges: GEdge[]
}

export interface Adj {
  v: string
  w: number
  /** Index of the edge in graph.edges. */
  e: number
}

/** Out-neighbors (both directions for undirected graphs), sorted by node id so traces are deterministic. */
export function adjacency(g: Graph): Record<string, Adj[]> {
  const adj: Record<string, Adj[]> = {}
  for (const n of g.nodes) adj[n.id] = []
  g.edges.forEach((ed, e) => {
    adj[ed.u].push({ v: ed.v, w: ed.w ?? 1, e })
    if (!g.directed) adj[ed.v].push({ v: ed.u, w: ed.w ?? 1, e })
  })
  for (const k of Object.keys(adj)) adj[k].sort((a, b) => a.v.localeCompare(b.v) || a.e - b.e)
  return adj
}

export function reverse(g: Graph): Graph {
  return { ...g, edges: g.edges.map((e) => ({ ...e, u: e.v, v: e.u })) }
}

export const ids = (g: Graph) => g.nodes.map((n) => n.id)

const N = (id: string, x: number, y: number): GNode => ({ id, x, y })
const E = (u: string, v: string, w?: number): GEdge => (w === undefined ? { u, v } : { u, v, w })

/** Lecture 9 notes DFS example: a→b→c→{a,d}, plus e→f in a second piece. Drawn as a directed graph. */
export const DFS_EXAMPLE: Graph = {
  directed: true,
  nodes: [N('a', 12, 20), N('b', 40, 12), N('c', 40, 58), N('d', 12, 82), N('e', 76, 22), N('f', 82, 74)],
  edges: [E('a', 'b'), E('b', 'c'), E('c', 'a'), E('c', 'd'), E('e', 'f')],
}

/** An undirected graph with several BFS layers (our own example). */
export const BFS_EXAMPLE: Graph = {
  directed: false,
  nodes: [N('s', 8, 50), N('a', 30, 18), N('b', 30, 50), N('c', 30, 84), N('d', 56, 18), N('e', 56, 62), N('f', 80, 36), N('g', 92, 80)],
  edges: [E('s', 'a'), E('s', 'b'), E('s', 'c'), E('a', 'd'), E('b', 'd'), E('b', 'e'), E('c', 'e'), E('d', 'f'), E('e', 'f'), E('e', 'g')],
}

/** Two undirected components (our own example for connected components). */
export const COMPONENTS_EXAMPLE: Graph = {
  directed: false,
  nodes: [N('a', 10, 20), N('b', 34, 14), N('c', 22, 52), N('d', 46, 46), N('e', 72, 18), N('f', 90, 44), N('g', 70, 62), N('h', 30, 86)],
  edges: [E('a', 'b'), E('a', 'c'), E('b', 'd'), E('c', 'd'), E('e', 'f'), E('f', 'g'), E('e', 'g')],
}

/** A directed graph with four SCCs (our own example; meta-graph {a,b,c} → {d,e} → {f,g,h}, {a,b,c} → {i}). */
export const SCC_EXAMPLE: Graph = {
  directed: true,
  nodes: [N('a', 8, 22), N('b', 28, 8), N('c', 26, 44), N('d', 52, 28), N('e', 56, 64), N('f', 80, 12), N('g', 94, 44), N('h', 76, 78), N('i', 22, 86)],
  edges: [E('a', 'b'), E('b', 'c'), E('c', 'a'), E('c', 'd'), E('d', 'e'), E('e', 'd'), E('d', 'f'), E('f', 'g'), E('g', 'h'), E('h', 'f'), E('e', 'h'), E('c', 'i')],
}

/** A DAG for topological sort by DFS finishing times (our own example: a morning routine). */
export const DAG_EXAMPLE: Graph = {
  directed: true,
  nodes: [N('a', 8, 20), N('b', 34, 10), N('c', 30, 52), N('d', 58, 30), N('e', 62, 76), N('f', 90, 50)],
  edges: [E('a', 'b'), E('a', 'c'), E('b', 'd'), E('c', 'd'), E('c', 'e'), E('d', 'f'), E('e', 'f')],
}

/** Weighted directed graph with non-negative weights (our own example). */
export const DIJKSTRA_EXAMPLE: Graph = {
  directed: true,
  nodes: [N('s', 6, 50), N('a', 32, 14), N('b', 32, 84), N('c', 62, 14), N('d', 62, 84), N('t', 92, 50)],
  edges: [E('s', 'a', 4), E('s', 'b', 1), E('b', 'a', 2), E('a', 'c', 5), E('b', 'd', 8), E('a', 'd', 6), E('c', 't', 3), E('d', 't', 1), E('c', 'd', 1)],
}

/** A negative edge on which Dijkstra finalizes a vertex too early (our own example). */
export const NEGATIVE_EDGE_EXAMPLE: Graph = {
  directed: true,
  nodes: [N('s', 8, 50), N('a', 46, 14), N('b', 46, 86), N('t', 90, 50)],
  edges: [E('s', 'a', 2), E('s', 'b', 5), E('b', 'a', -4), E('a', 't', 1)],
}

/** A reachable negative cycle a→b→c→a of weight −1 (our own example). */
export const NEGATIVE_CYCLE_EXAMPLE: Graph = {
  directed: true,
  nodes: [N('s', 8, 50), N('a', 40, 20), N('b', 76, 20), N('c', 58, 80), N('t', 94, 66)],
  edges: [E('s', 'a', 1), E('a', 'b', 2), E('b', 'c', -4), E('c', 'a', 1), E('c', 't', 3)],
}

/** Small graph for Floyd–Warshall, nodes named 1…4 as in the notes’ convention (our own weights). */
export const FLOYD_EXAMPLE: Graph = {
  directed: true,
  nodes: [N('1', 12, 18), N('2', 84, 18), N('3', 84, 82), N('4', 12, 82)],
  edges: [E('1', '2', 3), E('2', '3', 2), E('3', '4', 1), E('4', '1', 5), E('1', '3', 8), E('4', '2', -1)],
}

/** The CLRS/Lecture 15 MST example graph (a…i), total MST weight 37. */
export const MST_EXAMPLE: Graph = {
  directed: false,
  nodes: [N('a', 5, 50), N('b', 22, 14), N('c', 46, 14), N('d', 70, 14), N('e', 95, 50), N('f', 70, 86), N('g', 46, 86), N('h', 22, 86), N('i', 34, 50)],
  edges: [
    E('a', 'b', 4),
    E('a', 'h', 8),
    E('b', 'c', 8),
    E('b', 'h', 11),
    E('c', 'd', 7),
    E('c', 'f', 4),
    E('c', 'i', 2),
    E('d', 'e', 9),
    E('d', 'f', 14),
    E('e', 'f', 10),
    E('f', 'g', 2),
    E('g', 'h', 1),
    E('g', 'i', 6),
    E('h', 'i', 7),
  ],
}

/** A small undirected weighted graph (our own example; MST weight 9). */
export const MST_SMALL: Graph = {
  directed: false,
  nodes: [N('a', 10, 20), N('b', 50, 10), N('c', 90, 24), N('d', 20, 80), N('e', 56, 60), N('f', 90, 84)],
  edges: [E('a', 'b', 3), E('a', 'd', 1), E('b', 'd', 4), E('b', 'c', 5), E('b', 'e', 2), E('c', 'e', 6), E('c', 'f', 2), E('d', 'e', 7), E('e', 'f', 1)],
}

/** The classic textbook flow network (CLRS Fig. 26.1 shape); max flow 23. Capacities in w. */
export const FLOW_EXAMPLE: Graph = {
  directed: true,
  nodes: [N('s', 5, 50), N('a', 32, 14), N('b', 32, 86), N('c', 66, 14), N('d', 66, 86), N('t', 95, 50)],
  edges: [E('s', 'a', 16), E('s', 'b', 13), E('a', 'c', 12), E('b', 'a', 4), E('c', 'b', 9), E('b', 'd', 14), E('d', 'c', 7), E('c', 't', 20), E('d', 't', 4)],
}

/** The classic example where a bad augmenting-path order needs many iterations (our own numbers). */
export const FLOW_ZIGZAG: Graph = {
  directed: true,
  nodes: [N('s', 6, 50), N('a', 50, 12), N('b', 50, 88), N('t', 94, 50)],
  edges: [E('s', 'a', 100), E('s', 'b', 100), E('a', 'b', 1), E('a', 't', 100), E('b', 't', 100)],
}

/** Bipartite matching as a flow network: left 1…3, right x…z (our own example). */
export const MATCHING_FLOW: Graph = {
  directed: true,
  nodes: [N('s', 4, 50), N('1', 34, 14), N('2', 34, 50), N('3', 34, 86), N('x', 68, 14), N('y', 68, 50), N('z', 68, 86), N('t', 96, 50)],
  edges: [E('s', '1', 1), E('s', '2', 1), E('s', '3', 1), E('1', 'x', 1), E('1', 'y', 1), E('2', 'x', 1), E('3', 'y', 1), E('3', 'z', 1), E('x', 't', 1), E('y', 't', 1), E('z', 't', 1)],
}
