/**
 * Recurrence tools for Lecture 3: Master Theorem (both versions from the notes), a small
 * recurrence parser, recursion-tree level sums and a substitution-method helper.
 */

const EPS = 1e-9

export function approxEq(x: number, y: number): boolean {
  return Math.abs(x - y) <= EPS * Math.max(1, Math.abs(x), Math.abs(y))
}

export function fmt(x: number, digits = 3): string {
  if (approxEq(x, Math.round(x))) return String(Math.round(x))
  return x.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '')
}

/** LaTeX for n^e (with a log factor exponent k). */
export function texPower(e: number, logK = 0): string {
  let base: string
  if (approxEq(e, 0)) base = logK > 0 ? '' : '1'
  else if (approxEq(e, 1)) base = 'n'
  else base = `n^{${fmt(e)}}`
  if (logK > 0) base += (base ? ' ' : '') + (logK === 1 ? '\\log n' : `\\log^{${logK}} n`)
  return base
}

export type MasterCase = 'equal' | 'top' | 'leaves'

export interface MasterResult {
  ok: true
  a: number
  b: number
  d: number
  bd: number
  logba: number
  case: MasterCase
  /** LaTeX of the bound (without O / Θ). */
  bound: string
  comparison: string
  explanation: string
}

export interface MasterError {
  ok: false
  error: string
}

export function validateMaster(a: number, b: number, d: number): string | null {
  if (![a, b, d].every(Number.isFinite)) return 'a, b ve d sayı olmalı.'
  if (a < 1) return 'a ≥ 1 olmalı: en az bir alt problem gerekir.'
  if (!Number.isInteger(a)) return 'a, alt problem sayısıdır; bir tam sayı olmalı.'
  if (b <= 1) return 'b > 1 olmalı: alt problemler girdiden kesin olarak küçük olmalı (b = 1 ise boyut hiç küçülmez).'
  if (d < 0) return 'd ≥ 0 olmalı (O(n^d) iş terimi).'
  return null
}

/** Master Theorem as stated in Lecture 3: T(n) = a·T(n/b) + O(n^d), a ≥ 1, b > 1. */
export function masterTheorem(a: number, b: number, d: number): MasterResult | MasterError {
  const err = validateMaster(a, b, d)
  if (err) return { ok: false, error: err }
  const bd = b ** d
  const logba = Math.log(a) / Math.log(b)
  if (approxEq(a, bd)) {
    return {
      ok: true, a, b, d, bd, logba, case: 'equal',
      bound: texPower(d, 1),
      comparison: `a = ${fmt(a)} = b^d = ${fmt(bd)}`,
      explanation: `a = b^d olduğundan her seviyedeki toplam iş aynıdır (c·n^d). log_b n + 1 seviye olduğu için toplam O(n^d log n).`,
    }
  }
  if (a < bd) {
    return {
      ok: true, a, b, d, bd, logba, case: 'top',
      bound: texPower(d),
      comparison: `a = ${fmt(a)} < b^d = ${fmt(bd)}`,
      explanation: `a < b^d: seviye toplamları (a/b^d)^j oranıyla geometrik olarak azalır; toplamı kök seviyesindeki iş belirler: O(n^d).`,
    }
  }
  return {
    ok: true, a, b, d, bd, logba, case: 'leaves',
    bound: texPower(logba),
    comparison: `a = ${fmt(a)} > b^d = ${fmt(bd)}`,
    explanation: `a > b^d: seviye toplamları geometrik olarak artar; toplamı yapraklar belirler. Yaprak sayısı a^{log_b n} = n^{log_b a}, yani O(n^{log_b a}) ≈ O(n^${fmt(logba)}).`,
  }
}

/** Work term f(n) = coef · n^d · log^k n. */
export interface Work {
  d: number
  k: number
  coef: number
  tex: string
}

export interface RecTerm {
  coef: number
  /** Subproblem size as a fraction of n (size = frac·n), or null for subtractive forms like T(n−1). */
  frac: number | null
  sub: number | null
  tex: string
}

export interface ParsedRecurrence {
  terms: RecTerm[]
  work: Work
}

export type Analysis =
  | { kind: 'master'; a: number; b: number; work: Work; result: MasterResult; tight: boolean; general: GeneralResult }
  | { kind: 'general'; a: number; b: number; work: Work; general: GeneralResult }
  | { kind: 'unsupported'; reason: string; suggestion: string }
  | { kind: 'error'; error: string }

export interface GeneralResult {
  applies: boolean
  caseNo: 1 | 2 | 3 | null
  bound: string
  reason: string
}

function parseNumber(s: string): number | null {
  if (s === '') return 1
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s)
  return null
}

function parseWork(raw: string): Work | string {
  let s = raw.replace(/^(o|θ|theta|Θ|big-o|ω)\((.*)\)$/i, '$2').trim()
  // Coefficient
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(.*)$/)
  let coef = 1
  if (m) {
    coef = Number(m[1])
    s = m[2].trim()
  }
  if (s === '') return { d: 0, k: 0, coef, tex: fmt(coef) }
  let k = 0
  const logm = s.match(/^(.*?)\s*(log\s*\^?\s*(\d+)?\s*\(?n\)?|lg\s*n)$/)
  if (logm) {
    k = logm[3] ? Number(logm[3]) : 1
    s = logm[1].trim()
  }
  let d: number | null = null
  if (s === '') d = 0
  else if (s === 'n') d = 1
  else if (/^(sqrt\(n\)|√n|n\^\(?1\/2\)?)$/.test(s)) d = 0.5
  else {
    const pm = s.match(/^n\s*\^\s*\(?\s*(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+))?\s*\)?$/)
    if (pm) d = pm[2] ? Number(pm[1]) / Number(pm[2]) : Number(pm[1])
  }
  if (d === null) return `İş terimi "${raw}" tanınmadı. Örnekler: n, n^2, 5n, sqrt(n), 1, n log n, O(n^1.5).`
  const tex = (coef !== 1 ? fmt(coef) + ' ' : '') + (texPower(d, k) || '1')
  return { d, k, coef, tex }
}

function parseTerm(raw: string): RecTerm | null | string {
  const m = raw.match(/^(\d+(?:\.\d+)?)?\s*\*?\s*t\s*\((.*)\)$/)
  if (!m) return null
  const coef = m[1] ? Number(m[1]) : 1
  const inner = m[2].replace(/\s+/g, '')
  // n/b, (c n)/b, cn/b, n·c/b
  let frac: number | null = null
  let sub: number | null = null
  let mm: RegExpMatchArray | null
  if ((mm = inner.match(/^(\d*(?:\.\d+)?)\*?n\/(\d+(?:\.\d+)?)$/)) || (mm = inner.match(/^\((\d*(?:\.\d+)?)\*?n\)\/(\d+(?:\.\d+)?)$/))) {
    const num = parseNumber(mm[1])
    if (num === null) return `"${raw}" çözümlenemedi.`
    frac = num / Number(mm[2])
  } else if ((mm = inner.match(/^n-(\d+)$/))) {
    sub = Number(mm[1])
  } else if (inner === 'n') {
    return 'T(n) sağ tarafta T(n) olarak geçemez: alt problemler kesin olarak daha küçük olmalı.'
  } else return `"${raw}" içindeki alt problem boyutu tanınmadı. Örnekler: T(n/2), T(7n/10), T(n-1).`
  if (frac !== null && frac >= 1) return `T(${inner}): alt problem boyutu n'den küçük değil; özyineleme sonlanmaz.`
  if (frac !== null && frac <= 0) return `T(${inner}): geçersiz alt problem boyutu.`
  return { coef, frac, sub, tex: (coef !== 1 ? fmt(coef) : '') + `T(${inner.replace(/\*/g, '')})` }
}

export function parseRecurrence(text: string): ParsedRecurrence | string {
  let s = text
    .toLowerCase()
    .replace(/[·×]/g, '*')
    .replace(/≤/g, '<=')
    .replace(/\s+/g, ' ')
    .trim()
  s = s.replace(/^t\s*\(\s*n\s*\)\s*(=|<=)\s*/, '')
  if (!s) return 'Bir özyineleme bağıntısı girin, örn. T(n) = 2T(n/2) + n.'
  // split on top-level '+'
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === '+' && depth === 0) {
      parts.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  parts.push(cur.trim())
  const terms: RecTerm[] = []
  const works: Work[] = []
  for (const p of parts) {
    if (!p) return 'Boş terim: "+" işaretlerini kontrol edin.'
    const t = parseTerm(p)
    if (typeof t === 'string') return t
    if (t) {
      terms.push(t)
      continue
    }
    const w = parseWork(p)
    if (typeof w === 'string') return w
    works.push(w)
  }
  if (terms.length === 0) return 'En az bir özyinelemeli terim (örn. 2T(n/2)) gerekli.'
  if (works.length > 1) return 'Lütfen özyinelemesiz işi tek bir terim olarak yazın (örn. O(n^2)).'
  const work = works[0] ?? { d: 0, k: 0, coef: 0, tex: '0' }
  return { terms, work }
}

/** General Master Theorem (Theorem 3 in the Lecture 3 notes) for f(n) = Θ(n^d log^k n). */
export function generalMaster(a: number, b: number, work: Work): GeneralResult {
  const e = Math.log(a) / Math.log(b)
  const { d, k } = work
  if (work.coef === 0) return { applies: true, caseNo: 1, bound: texPower(e), reason: 'Özyinelemesiz iş yok; yalnızca yapraklar sayılır.' }
  if (d < e - EPS)
    return { applies: true, caseNo: 1, bound: texPower(e), reason: `f(n) = O(n^{log_b a − ε}) (ör. ε = ${fmt((e - d) / 2)}): 1. durum, T(n) = Θ(n^{log_b a}).` }
  if (d > e + EPS)
    return {
      applies: true,
      caseNo: 3,
      bound: texPower(d, k),
      reason: `f(n) = Ω(n^{log_b a + ε}) ve düzenlilik koşulu a·f(n/b) ≤ c·f(n) (c = a/b^d = ${fmt(a / b ** d)} < 1) sağlanıyor: 3. durum, T(n) = Θ(f(n)).`,
    }
  if (k === 0) return { applies: true, caseNo: 2, bound: texPower(e, 1), reason: 'f(n) = Θ(n^{log_b a}): 2. durum, T(n) = Θ(n^{log_b a} log n).' }
  return {
    applies: false,
    caseNo: null,
    bound: '',
    reason: `f(n) = n^{log_b a}·log^${k} n: f, n^{log_b a}'dan büyük ama polinom olarak (n^ε kadar) büyük değil. Notlardaki üç durumdan hiçbiri uygulanamaz; bu boşluk durumu için başka bir yöntem (ör. özyineleme ağacı) gerekir.`,
  }
}

export function analyzeRecurrence(text: string): Analysis {
  const parsed = parseRecurrence(text)
  if (typeof parsed === 'string') return { kind: 'error', error: parsed }
  const { terms, work } = parsed
  if (terms.some((t) => t.sub !== null))
    return {
      kind: 'unsupported',
      reason: 'T(n − c) biçimindeki terimler boyutu sabit bir miktar azaltır; Master Teoremi ise boyutun sabit bir b > 1 çarpanıyla bölünmesini (n/b) gerektirir.',
      suggestion: 'Bağıntıyı açarak toplayın: ör. T(n) = T(n−1) + cn ⇒ T(n) = c(n + (n−1) + … + 1) = Θ(n²) (Ders 4’teki en kötü pivot analizi).',
    }
  const fracs = [...new Set(terms.map((t) => t.frac!.toFixed(12)))]
  if (fracs.length > 1)
    return {
      kind: 'unsupported',
      reason: 'Alt problemler farklı boyutlarda. Master Teoremi yalnızca tüm alt problemler aynı boyutta (n/b) olduğunda uygulanabilir.',
      suggestion: 'Yerine koyma (substitution) yöntemini kullanın: bir sınır tahmin edin ve tümevarımla doğrulayın. Bu dersteki “Yerine koyma” aracı bu biçimi destekler.',
    }
  const a = terms.reduce((s, t) => s + t.coef, 0)
  const b = 1 / terms[0].frac!
  const err = validateMaster(a, b, Math.max(0, work.d))
  if (err) return { kind: 'error', error: err }
  const general = generalMaster(a, b, work)
  if (work.k > 0) return { kind: 'general', a, b, work, general }
  const result = masterTheorem(a, b, work.d) as MasterResult
  return { kind: 'master', a, b, work, result, tight: true, general }
}

export interface LevelInfo {
  level: number
  count: number
  size: number
  perNode: number
  total: number
}

/** Recursion-tree level sums for T(n) = a T(n/b) + c n^d, levels 0..⌊log_b n⌋. */
export function recursionLevels(a: number, b: number, d: number, n: number, c = 1): LevelInfo[] {
  const L = Math.floor(Math.log(n) / Math.log(b) + EPS)
  const out: LevelInfo[] = []
  for (let j = 0; j <= L; j++) {
    const count = a ** j
    const size = n / b ** j
    const perNode = c * size ** d
    out.push({ level: j, count, size, perNode, total: count * perNode })
  }
  return out
}

/* ------------------------- Substitution method ------------------------- */

export class Frac {
  readonly n: number
  readonly d: number
  constructor(n: number, d = 1) {
    if (d === 0) throw new Error('division by zero')
    const g = gcd(Math.abs(n), Math.abs(d)) || 1
    const s = d < 0 ? -1 : 1
    this.n = (s * n) / g
    this.d = (s * d) / g
  }
  add(o: Frac) {
    return new Frac(this.n * o.d + o.n * this.d, this.d * o.d)
  }
  sub(o: Frac) {
    return new Frac(this.n * o.d - o.n * this.d, this.d * o.d)
  }
  mul(o: Frac) {
    return new Frac(this.n * o.n, this.d * o.d)
  }
  div(o: Frac) {
    return new Frac(this.n * o.d, this.d * o.n)
  }
  pow(p: number) {
    return new Frac(this.n ** p, this.d ** p)
  }
  cmp(o: Frac) {
    return Math.sign(this.n * o.d - o.n * this.d)
  }
  value() {
    return this.n / this.d
  }
  tex() {
    if (this.d === 1) return String(this.n)
    return `${this.n < 0 ? '-' : ''}\\tfrac{${Math.abs(this.n)}}{${this.d}}`
  }
}

function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b]
  return a
}

export interface SubTerm {
  k: number // number of copies
  num: number // size = num/den · n
  den: number
}

export interface SubstitutionResult {
  s: Frac
  works: boolean
  D: Frac | null
  steps: { title: string; tex: string; note?: string }[]
}

/**
 * Substitution method for T(n) ≤ Σ k_i T(num_i/den_i · n) + c·n^p with guess T(n) ≤ D·n^p.
 * Floors/ceilings are ignored, as in the Lecture 3/4 notes.
 */
export function substitution(terms: SubTerm[], p: number, c: number, t1: number): SubstitutionResult {
  const steps: SubstitutionResult['steps'] = []
  const cn = (c === 1 ? '' : String(c)) + (p === 1 ? 'n' : `n^{${p}}`)
  const pw = (base: string) => (p === 1 ? base : `${base}^{${p}}`)
  const np = p === 1 ? 'n' : `n^{${p}}`
  const rhs = terms.map((t) => `${t.k === 1 ? '' : t.k}T\\!\\left(\\tfrac{${t.num === 1 ? '' : t.num}n}{${t.den}}\\right)`).join(' + ')
  const alphaP = terms.map((t) => new Frac(t.k).mul(new Frac(t.num, t.den).pow(p)))
  const s = alphaP.reduce((acc, x) => acc.add(x), new Frac(0))
  const C = new Frac(c)
  steps.push({ title: '1. Tahmin', tex: `T(n) \\le D\\cdot ${np} \\quad (\\text{tüm } n \\ge 1 \\text{ için; } D \\text{ sabit, henüz bilinmiyor})` })
  steps.push({ title: '2. Taban durumu', tex: `T(1) = ${t1} \\le D\\cdot 1 \\iff D \\ge ${t1}` })
  steps.push({ title: '3. Tümevarım hipotezi', tex: `T(m) \\le D\\cdot ${pw('m')} \\quad \\text{tüm } m < n \\text{ için}` })
  const subst = terms
    .map((t) => `${t.k === 1 ? '' : t.k + '\\cdot '}D\\left(\\tfrac{${t.num}}{${t.den}}n\\right)^{${p}}`)
    .join(' + ')
  steps.push({ title: '4. Yerine koy', tex: `T(n) \\le ${rhs} + ${cn} \\le ${subst} + ${cn}` })
  steps.push({
    title: '5. Sadeleştir',
    tex: `T(n) \\le \\Big(${alphaP.map((x) => x.tex()).join(' + ')}\\Big) D\\, ${np} + ${cn} = \\big(${s.tex()}\\,D + ${c}\\big)\\, ${np}`,
    note: `Σ k·αᵖ = ${s.tex().replace(/\\tfrac\{(\d+)\}\{(\d+)\}/, '$1/$2')}`,
  })
  steps.push({ title: '6. Gereken koşul', tex: `\\big(${s.tex()}\\,D + ${c}\\big)${np} \\le D\\,${np} \\iff ${c} \\le \\big(1 - ${s.tex()}\\big) D` })
  if (s.cmp(new Frac(1)) < 0) {
    const need = C.div(new Frac(1).sub(s))
    const D = need.cmp(new Frac(t1)) >= 0 ? need : new Frac(t1)
    steps.push({
      title: '7. D’yi seç',
      tex: `D \\ge \\frac{${c}}{1 - ${s.tex()}} = ${need.tex()} \\;\\text{ ve }\\; D \\ge ${t1} \\;\\Rightarrow\\; D = ${D.tex()}`,
      note: 'Taban durumu ve tümevarım adımı aynı D ile sağlandı.',
    })
    steps.push({ title: 'Sonuç', tex: `T(n) \\le ${D.tex()}\\,${np} \\;\\Rightarrow\\; T(n) = O(${np})` })
    return { s, works: true, D, steps }
  }
  steps.push({
    title: '7. Çelişki',
    tex: `1 - ${s.tex()} ${s.cmp(new Frac(1)) === 0 ? '= 0' : '< 0'} \\;\\Rightarrow\\; ${c} \\le \\big(1-${s.tex()}\\big)D \\text{ hiçbir } D > 0 \\text{ için sağlanamaz}`,
    note:
      s.cmp(new Frac(1)) === 0
        ? `Σ k·αᵖ = 1: her seviye aynı işi yapar, yaklaşık log n seviye vardır. Daha büyük bir tahmin deneyin: T(n) ≤ D·${p === 1 ? 'n' : 'n^' + p} log n.`
        : `Σ k·αᵖ > 1: alt problemlerin toplam işi büyüyor; tahmin fazla küçük. Daha büyük bir üs deneyin.`,
  })
  return { s, works: false, D: null, steps }
}
