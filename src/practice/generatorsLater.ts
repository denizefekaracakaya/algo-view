/**
 * Question generators for Lectures 8–17. Same contract as generators.ts: every question is built from a seed
 * and its answer is computed with the engines behind the visualizers.
 */
import type { Generator } from './generators'
import { randInt, randomPermutation, type Rng } from '../engines/random'
import type { GEdge, Graph } from '../engines/graph'
import { expectedCollidingPairs } from '../engines/hashing'
import { bfsDistances, dfsTimes } from '../engines/graphSearch'
import { sccByReachability } from '../engines/scc'
import { bellmanFordTrace, dijkstraTrace, floydTrace } from '../engines/shortestPaths'
import { knapsack01, lcs } from '../engines/dp'
import { activityTrace, huffmanTrace, type Activity } from '../engines/greedy'
import { kruskalTrace } from '../engines/mst'
import { fordFulkersonTrace } from '../engines/maxFlow'
import { galeShapleyTrace, type Prefs } from '../engines/stableMatching'
import { tx } from '../i18n/lang'

const pick = <T,>(rng: Rng, xs: readonly T[]): T => xs[randInt(rng, 0, xs.length - 1)]
const names = (n: number) => 'abcdefgh'.slice(0, n).split('')
const shuffle = <T,>(rng: Rng, xs: readonly T[]): T[] => randomPermutation(rng, xs.length).map((i) => xs[i - 1])

/** A random connected graph: a random spanning tree plus `extra` more edges, without parallel edges. */
function randomGraph(rng: Rng, n: number, extra: number, directed: boolean, wLo: number, wHi: number): Graph {
  const v = names(n)
  const order = shuffle(rng, v)
  const edges: GEdge[] = []
  const has = (a: string, b: string) => edges.some((e) => (e.u === a && e.v === b) || (e.u === b && e.v === a))
  for (let i = 1; i < n; i++) {
    const p = order[randInt(rng, 0, i - 1)]
    edges.push(directed ? { u: p, v: order[i], w: randInt(rng, wLo, wHi) } : { u: p, v: order[i], w: randInt(rng, wLo, wHi) })
  }
  for (let tries = 0, added = 0; added < extra && tries < 200; tries++) {
    const a = pick(rng, v)
    const b = pick(rng, v)
    if (a === b || has(a, b)) continue
    edges.push({ u: a, v: b, w: randInt(rng, wLo, wHi) })
    added++
  }
  return { directed, nodes: v.map((id) => ({ id, x: 0, y: 0 })), edges }
}

const edgeText = (g: Graph, weighted: boolean) => g.edges.map((e) => `${e.u}${g.directed ? '→' : '–'}${e.v}${weighted ? ` (${e.w})` : ''}`).join(', ')

export const LATER_GENERATORS: Generator[] = [
  {
    id: 'hash-bucket',
    lessonId: 'l8-hashing',
    title: () => tx('Anahtarın kovası', 'The bucket of a key'),
    make: (rng) => {
      const n = pick(rng, [5, 7, 8, 10, 11])
      const a = randInt(rng, 2, 17)
      const b = randInt(rng, 0, 9)
      const x = randInt(rng, 0, 99)
      const i = (a * x + b) % n
      return {
        id: '',
        kind: 'numeric',
        answer: i,
        prompt: tx(`$h(x) = (${a}x + ${b}) \\bmod ${n}$ ile ${x} anahtarı hangi kovaya düşer?`, `With $h(x) = (${a}x + ${b}) \\bmod ${n}$, which bucket does the key ${x} land in?`),
        hint: tx(`Önce $${a} \\cdot ${x} + ${b}$’yi hesaplayın.`, `First compute $${a} \\cdot ${x} + ${b}$.`),
        explanation: tx(`$${a} \\cdot ${x} + ${b} = ${a * x + b}$ ve $${a * x + b} \\bmod ${n} = ${i}$.`, `$${a} \\cdot ${x} + ${b} = ${a * x + b}$ and $${a * x + b} \\bmod ${n} = ${i}$.`),
      }
    },
  },
  {
    id: 'birthday-pairs',
    lessonId: 'l8-hashing',
    title: () => tx('Beklenen çakışan çiftler', 'Expected colliding pairs'),
    make: (rng) => {
      const m = randInt(rng, 5, 40)
      const n = pick(rng, [50, 100, 200, 365, 1000])
      const e = Math.round(expectedCollidingPairs(m, n) * 1000) / 1000
      return {
        id: '',
        kind: 'numeric',
        answer: e,
        tolerance: 0.01,
        prompt: tx(`${m} anahtar, ${n} kovalı bir tabloya rastgele bir hash fonksiyonuyla yerleştiriliyor. Aynı kovaya düşen anahtar çiftlerinin beklenen sayısı nedir? (İki basamak yeterli.)`, `${m} keys are placed into a table with ${n} buckets by a random hash function. What is the expected number of pairs of keys in the same bucket? (Two decimals are enough.)`),
        hint: tx('$\\binom{m}{2} \\cdot \\frac{1}{n}$.', '$\\binom{m}{2} \\cdot \\frac{1}{n}$.'),
        explanation: tx(`$\\binom{${m}}{2}/${n} = ${(m * (m - 1)) / 2}/${n} \\approx ${e}$.`, `$\\binom{${m}}{2}/${n} = ${(m * (m - 1)) / 2}/${n} \\approx ${e}$.`),
      }
    },
  },
  {
    id: 'bfs-distance',
    lessonId: 'l9-graphs',
    title: () => tx('BFS katmanı', 'BFS layer'),
    make: (rng) => {
      const g = randomGraph(rng, 7, 3, false, 1, 1)
      const d = bfsDistances(g, 'a')
      const target = pick(rng, names(7).slice(1))
      return {
        id: '',
        kind: 'numeric',
        answer: d[target]!,
        prompt: tx(`Yönsüz grafiğin kenarları: ${edgeText(g, false)}. $a$’dan başlayan BFS, ${target} düğümünü hangi katmana ($L_i$) koyar?`, `The edges of an undirected graph: ${edgeText(g, false)}. Which layer ($L_i$) does BFS from $a$ put node ${target} in?`),
        hint: tx(`$a$’dan ${target}’ye en az kenarlı yolu bulun.`, `Find a path from $a$ to ${target} with the fewest edges.`),
        explanation: tx(`$d(a, ${target}) = ${d[target]}$, bu yüzden ${target} $\\in L_{${d[target]}}$.`, `$d(a, ${target}) = ${d[target]}$, so ${target} $\\in L_{${d[target]}}$.`),
      }
    },
  },
  {
    id: 'dfs-finish',
    lessonId: 'l9-dfs',
    title: () => tx('DFS bitiş zamanı', 'DFS finishing time'),
    make: (rng) => {
      const g = randomGraph(rng, 5, 2, true, 1, 1)
      const { d, f } = dfsTimes(g)
      const v = pick(rng, names(5))
      return {
        id: '',
        kind: 'numeric',
        answer: f[v],
        prompt: tx(
          `Yönlü grafiğin kenarları: ${edgeText(g, false)}. DFS($G$) düğümleri alfabetik sırayla dener ve komşuları da alfabetik tarar (notlardaki zaman kuralı: $t$ her keşifte ve her geri dönüşte artar). $f(${v})$ kaçtır?`,
          `The edges of a directed graph: ${edgeText(g, false)}. DFS($G$) tries the nodes in alphabetical order and scans neighbors alphabetically too (the notes’ time rule: $t$ advances at every discovery and every return). What is $f(${v})$?`,
        ),
        hint: tx(`$d(${v}) = ${d[v]}$.`, `$d(${v}) = ${d[v]}$.`),
        explanation: tx(`Zaman damgaları: ${names(5).map((x) => `${x} (${d[x]}, ${f[x]})`).join(', ')}.`, `Timestamps: ${names(5).map((x) => `${x} (${d[x]}, ${f[x]})`).join(', ')}.`),
      }
    },
  },
  {
    id: 'scc-count',
    lessonId: 'l10-scc',
    title: () => tx('SCC sayısı', 'Number of SCCs'),
    make: (rng) => {
      const g = randomGraph(rng, 6, 4, true, 1, 1)
      const comps = sccByReachability(g)
      return {
        id: '',
        kind: 'numeric',
        answer: comps.length,
        prompt: tx(`Yönlü grafiğin kenarları: ${edgeText(g, false)}. Kaç güçlü bağlı bileşen vardır?`, `The edges of a directed graph: ${edgeText(g, false)}. How many strongly connected components are there?`),
        hint: tx('Hangi düğüm grupları birbirine karşılıklı ulaşabiliyor? Döngüleri arayın.', 'Which groups of nodes can reach each other both ways? Look for cycles.'),
        explanation: tx(`SCC’ler: ${comps.map((c) => '{' + c.join(', ') + '}').join(', ')}.`, `SCCs: ${comps.map((c) => '{' + c.join(', ') + '}').join(', ')}.`),
      }
    },
  },
  {
    id: 'dijkstra-distance',
    lessonId: 'l11-dijkstra',
    title: () => tx('Dijkstra uzaklığı', 'Dijkstra distance'),
    make: (rng) => {
      let g = randomGraph(rng, 6, 4, true, 1, 9)
      // Make sure the target is reachable from a.
      let d = dijkstraTrace(g, 'a').d
      let reachable = names(6).filter((v) => v !== 'a' && d[v] < Infinity)
      while (!reachable.length) {
        g = randomGraph(rng, 6, 4, true, 1, 9)
        d = dijkstraTrace(g, 'a').d
        reachable = names(6).filter((v) => v !== 'a' && d[v] < Infinity)
      }
      const t = pick(rng, reachable)
      return {
        id: '',
        kind: 'numeric',
        answer: d[t],
        prompt: tx(`Yönlü ağırlıklı kenarlar: ${edgeText(g, true)}. $d(a, ${t})$ kaçtır?`, `Directed weighted edges: ${edgeText(g, true)}. What is $d(a, ${t})$?`),
        hint: tx('Dijkstra’yı $a$’dan çalıştırın; en küçük tahmini olan düğüm kesinleşir.', 'Run Dijkstra from $a$; the node with the smallest estimate is finalized.'),
        explanation: tx(`Dijkstra’nın sonucu: ${names(6).map((v) => `${v}: ${d[v] === Infinity ? '∞' : d[v]}`).join(', ')}.`, `Dijkstra’s result: ${names(6).map((v) => `${v}: ${d[v] === Infinity ? '∞' : d[v]}`).join(', ')}.`),
      }
    },
  },
  {
    id: 'bellman-ford-row',
    lessonId: 'l12-bellman-ford',
    title: () => tx('Bellman–Ford satırı', 'A Bellman–Ford row'),
    make: (rng) => {
      for (;;) {
        const g = randomGraph(rng, 5, 3, true, -2, 8)
        const r = bellmanFordTrace(g, 'a')
        if (r.negativeCycle) continue
        const rows = r.trace.at(-1)!.state.rows
        const cand = names(5).filter((v) => v !== 'a' && rows[2][v] < Infinity)
        if (!cand.length) continue
        const v = pick(rng, cand)
        return {
          id: '',
          kind: 'numeric',
          answer: rows[2][v],
          prompt: tx(`Yönlü ağırlıklı kenarlar: ${edgeText(g, true)}. Kaynak $a$. Bellman–Ford’da $d^{(2)}[${v}]$ (en fazla 2 kenarlı en kısa yol) kaçtır?`, `Directed weighted edges: ${edgeText(g, true)}. Source $a$. In Bellman–Ford, what is $d^{(2)}[${v}]$ (the shortest path with at most 2 edges)?`),
          hint: tx(`$a$’dan ${v}’ye 1 ya da 2 kenarlı tüm yolları karşılaştırın.`, `Compare every path from $a$ to ${v} with 1 or 2 edges.`),
          explanation: tx(`En fazla 2 kenarla en iyisi ${rows[2][v]}; son değer $d(a, ${v}) = ${r.d[v]}$.`, `The best with at most 2 edges is ${rows[2][v]}; the final value is $d(a, ${v}) = ${r.d[v]}$.`),
        }
      }
    },
  },
  {
    id: 'floyd-cell',
    lessonId: 'l12-floyd',
    title: () => tx('Tüm çiftler arası uzaklık', 'An all-pairs distance'),
    make: (rng) => {
      for (;;) {
        const g = randomGraph(rng, 4, 3, true, 1, 9)
        const m = floydTrace(g).matrix
        const pairs: [number, number][] = []
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i !== j && m[i][j] < Infinity) pairs.push([i, j])
        if (!pairs.length) continue
        const [i, j] = pick(rng, pairs)
        const v = names(4)
        return {
          id: '',
          kind: 'numeric',
          answer: m[i][j],
          prompt: tx(`Yönlü ağırlıklı kenarlar: ${edgeText(g, true)}. Floyd–Warshall bittiğinde $d(${v[i]}, ${v[j]})$ kaçtır?`, `Directed weighted edges: ${edgeText(g, true)}. When Floyd–Warshall finishes, what is $d(${v[i]}, ${v[j]})$?`),
          hint: tx('Doğrudan kenarı ve bir ya da iki ara duraklı yolları karşılaştırın.', 'Compare the direct edge with paths through one or two intermediate stops.'),
          explanation: tx(`En kısa ${v[i]} → ${v[j]} yolunun ağırlığı ${m[i][j]}.`, `The shortest ${v[i]} → ${v[j]} path weighs ${m[i][j]}.`),
        }
      }
    },
  },
  {
    id: 'lcs-length',
    lessonId: 'l13-lcs',
    title: () => tx('LCS uzunluğu', 'LCS length'),
    make: (rng) => {
      const s = (n: number) => Array.from({ length: n }, () => pick(rng, ['A', 'B', 'C', 'D'])).join('')
      const X = s(randInt(rng, 5, 7))
      const Y = s(randInt(rng, 4, 6))
      const z = lcs(X, Y)
      return {
        id: '',
        kind: 'numeric',
        answer: z.length,
        prompt: tx(`X = ${X} ve Y = ${Y} dizilerinin en uzun ortak altdizisinin uzunluğu kaçtır?`, `What is the length of a longest common subsequence of X = ${X} and Y = ${Y}?`),
        hint: tx('Tabloyu doldurun: harfler eşitse çapraz + 1, değilse üst ve solun büyüğü.', 'Fill the table: diagonal + 1 if the letters match, otherwise the larger of up and left.'),
        explanation: tx(`Bir LCS: “${z || '∅'}” (uzunluk ${z.length}).`, `One LCS: “${z || '∅'}” (length ${z.length}).`),
      }
    },
  },
  {
    id: 'knapsack-value',
    lessonId: 'l13-knapsack',
    title: () => tx('0/1 sırt çantası', '0/1 knapsack'),
    make: (rng) => {
      const items = ['A', 'B', 'C', 'D'].map((name) => ({ name, w: randInt(rng, 1, 6), v: randInt(rng, 3, 20) }))
      const W = randInt(rng, 6, 11)
      const r = knapsack01(items, W)
      return {
        id: '',
        kind: 'numeric',
        answer: r.value,
        prompt: tx(`Kapasite $W = ${W}$. Eşyalar (ağırlık, değer): ${items.map((i) => `${i.name} (${i.w}, ${i.v})`).join(', ')}. Her eşyadan en fazla bir tane alınabiliyorsa en büyük toplam değer nedir?`, `Capacity $W = ${W}$. Items (weight, value): ${items.map((i) => `${i.name} (${i.w}, ${i.v})`).join(', ')}. If at most one of each item can be taken, what is the largest total value?`),
        hint: tx('$K(x, j) = \\max(K(x, j-1),\\ K(x - w_j, j-1) + v_j)$.', '$K(x, j) = \\max(K(x, j-1),\\ K(x - w_j, j-1) + v_j)$.'),
        explanation: tx(`En iyi seçim {${r.take.join(', ') || '∅'}}, değer ${r.value}.`, `The best choice is {${r.take.join(', ') || '∅'}}, value ${r.value}.`),
      }
    },
  },
  {
    id: 'activity-count',
    lessonId: 'l14-greedy',
    title: () => tx('Etkinlik seçimi', 'Activity selection'),
    make: (rng) => {
      const acts: Activity[] = 'pqrstuv'.split('').map((name) => {
        const s = randInt(rng, 0, 12)
        return { name, s, f: s + randInt(rng, 1, 5) }
      })
      const r = activityTrace(acts)
      return {
        id: '',
        kind: 'numeric',
        answer: r.chosen.length,
        prompt: tx(`Etkinlikler [başlangıç, bitiş): ${acts.map((a) => `${a.name} [${a.s}, ${a.f})`).join(', ')}. Çakışmayan en çok kaç etkinlik seçilebilir?`, `Activities [start, finish): ${acts.map((a) => `${a.name} [${a.s}, ${a.f})`).join(', ')}. At most how many non-overlapping activities can be chosen?`),
        hint: tx('Bitiş zamanına göre sıralayın ve en erken biteni seçerek ilerleyin.', 'Sort by finish time and keep choosing the one that finishes first.'),
        explanation: tx(`Açgözlü seçim: {${r.chosen.join(', ')}}.`, `The greedy choice: {${r.chosen.join(', ')}}.`),
      }
    },
  },
  {
    id: 'huffman-bits',
    lessonId: 'l14-huffman',
    title: () => tx('Huffman ile toplam bit', 'Total bits with Huffman'),
    make: (rng) => {
      const chars: [string, number][] = ['A', 'B', 'C', 'D', 'E'].slice(0, randInt(rng, 3, 5)).map((c) => [c, randInt(rng, 1, 12)])
      const r = huffmanTrace(chars)
      const total = chars.reduce((s, [c, f]) => s + f * r.codes[c].length, 0)
      return {
        id: '',
        kind: 'numeric',
        answer: total,
        prompt: tx(`Bir metinde karakter sayıları: ${chars.map(([c, f]) => `${c}: ${f}`).join(', ')}. Huffman koduyla metin toplam kaç bit tutar?`, `A text has character counts ${chars.map(([c, f]) => `${c}: ${f}`).join(', ')}. How many bits does the text take with a Huffman code?`),
        hint: tx('En küçük iki sayıyı birleştirmeye devam edin; toplam bit = her birleştirmede oluşan düğümlerin sayılarının toplamı.', 'Keep merging the two smallest counts; total bits = the sum of the counts of all nodes created by merges.'),
        explanation: tx(`Kod uzunlukları: ${chars.map(([c]) => `${c} ${r.codes[c].length}`).join(', ')}; toplam ${total} bit.`, `Code lengths: ${chars.map(([c]) => `${c} ${r.codes[c].length}`).join(', ')}; ${total} bits in total.`),
      }
    },
  },
  {
    id: 'mst-weight',
    lessonId: 'l15-mst',
    title: () => tx('MST ağırlığı', 'MST weight'),
    make: (rng) => {
      const g = randomGraph(rng, 6, 4, false, 1, 9)
      const r = kruskalTrace(g)
      return {
        id: '',
        kind: 'numeric',
        answer: r.weight,
        prompt: tx(`Yönsüz ağırlıklı kenarlar: ${edgeText(g, true)}. Minimum yayılan ağacın toplam ağırlığı kaçtır?`, `Undirected weighted edges: ${edgeText(g, true)}. What is the total weight of a minimum spanning tree?`),
        hint: tx('Kruskal: kenarları hafiften ağıra deneyin, döngü oluşturanları atlayın.', 'Kruskal: try edges from light to heavy and skip those that close a cycle.'),
        explanation: tx(`Ağaç kenarları: ${r.tree.map((i) => `${g.edges[i].u}–${g.edges[i].v} (${g.edges[i].w})`).join(', ')}; toplam ${r.weight}.`, `Tree edges: ${r.tree.map((i) => `${g.edges[i].u}–${g.edges[i].v} (${g.edges[i].w})`).join(', ')}; total ${r.weight}.`),
      }
    },
  },
  {
    id: 'maxflow-value',
    lessonId: 'l16-maxflow',
    title: () => tx('Maksimum akış', 'Maximum flow'),
    make: (rng) => {
      // s → {a, b, c} → t with a few middle edges; no antiparallel pairs.
      const mids = ['a', 'b', 'c']
      const edges: GEdge[] = [...mids.map((m) => ({ u: 's', v: m, w: randInt(rng, 1, 9) })), ...mids.map((m) => ({ u: m, v: 't', w: randInt(rng, 1, 9) }))]
      for (const [u, v] of [
        ['a', 'b'],
        ['b', 'c'],
      ])
        if (rng() < 0.7) edges.push(rng() < 0.5 ? { u, v, w: randInt(rng, 1, 6) } : { u: v, v: u, w: randInt(rng, 1, 6) })
      const g: Graph = { directed: true, nodes: ['s', ...mids, 't'].map((id) => ({ id, x: 0, y: 0 })), edges }
      const r = fordFulkersonTrace(g, 's', 't')
      return {
        id: '',
        kind: 'numeric',
        answer: r.value,
        prompt: tx(`Kapasiteli yönlü kenarlar: ${edgeText(g, true)}. $s$’den $t$’ye maksimum akış kaçtır?`, `Directed edges with capacities: ${edgeText(g, true)}. What is the maximum flow from $s$ to $t$?`),
        hint: tx('Artırıcı yollar bulun; ya da en dar kesmeyi arayın.', 'Find augmenting paths, or look for the narrowest cut.'),
        explanation: tx(`Maksimum akış ${r.value}; minimum kesmenin $S$ tarafı {${r.cut.join(', ')}}.`, `The maximum flow is ${r.value}; the $S$ side of a minimum cut is {${r.cut.join(', ')}}.`),
      }
    },
  },
  {
    id: 'gale-shapley',
    lessonId: 'l17-stable-matching',
    title: () => tx('Kabulü erteleme sonucu', 'Deferred acceptance result'),
    make: (rng) => {
      const D = ['D1', 'D2', 'D3']
      const H = ['A', 'B', 'C']
      const p: Prefs = { doctors: D, hospitals: H, dPref: Object.fromEntries(D.map((d) => [d, shuffle(rng, H)])), hPref: Object.fromEntries(H.map((h) => [h, shuffle(rng, D)])) }
      const r = galeShapleyTrace(p)
      const d = pick(rng, D)
      const h = H.find((x) => r.match[x] === d)!
      return {
        id: '',
        kind: 'mcq',
        options: H,
        answer: H.indexOf(h),
        prompt: tx(
          `Doktorlar: ${D.map((x) => `${x}: ${p.dPref[x].join(' > ')}`).join('; ')}. Hastaneler: ${H.map((x) => `${x}: ${p.hPref[x].join(' > ')}`).join('; ')}. Doktorların teklif ettiği kabulü erteleme algoritmasında ${d} hangi hastaneye yerleşir?`,
          `Doctors: ${D.map((x) => `${x}: ${p.dPref[x].join(' > ')}`).join('; ')}. Hospitals: ${H.map((x) => `${x}: ${p.hPref[x].join(' > ')}`).join('; ')}. In doctor-proposing deferred acceptance, which hospital does ${d} end up at?`,
        ),
        hint: tx('Boştaki doktorlar sırayla listelerindeki bir sonraki hastaneye başvurur; hastane daha çok istediğini tutar.', 'Free doctors apply in turn to the next hospital on their list; a hospital keeps the one it prefers.'),
        explanation: tx(`Sonuç: ${H.map((x) => `${r.match[x]}–${x}`).join(', ')}.`, `Result: ${H.map((x) => `${r.match[x]}–${x}`).join(', ')}.`),
      }
    },
  },
]
