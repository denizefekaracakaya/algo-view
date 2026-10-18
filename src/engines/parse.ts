/** Input parsing helpers shared by the visualizers. Errors are returned as Turkish messages. */

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string }

export interface NumberListOptions {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  integer?: boolean
  distinct?: boolean
  nonNegative?: boolean
}

export function parseNumberList(text: string, opts: NumberListOptions = {}): ParseResult<number[]> {
  const { minLength = 0, maxLength = 32, integer = true, distinct = false, nonNegative = false } = opts
  const tokens = text
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
  const values: number[] = []
  for (const t of tokens) {
    const v = Number(t)
    if (!Number.isFinite(v)) return { ok: false, error: `"${t}" geçerli bir sayı değil.` }
    if (integer && !Number.isInteger(v)) return { ok: false, error: `"${t}" bir tam sayı değil; bu görselleştirme tam sayılarla çalışır.` }
    if (nonNegative && v < 0) return { ok: false, error: `"${t}" negatif; bu algoritma negatif olmayan anahtarlar varsayar.` }
    if (opts.min !== undefined && v < opts.min) return { ok: false, error: `Değerler en az ${opts.min} olmalı ("${t}").` }
    if (opts.max !== undefined && v > opts.max) return { ok: false, error: `Değerler en fazla ${opts.max} olmalı ("${t}").` }
    values.push(v)
  }
  if (values.length < minLength) return { ok: false, error: `En az ${minLength} değer girin.` }
  if (values.length > maxLength)
    return { ok: false, error: `Animasyonun okunabilir kalması için en fazla ${maxLength} değer girilebilir (şu an ${values.length}).` }
  if (distinct && new Set(values).size !== values.length)
    return { ok: false, error: 'Bu görselleştirme ders notlarındaki gibi farklı (tekrarsız) anahtarlar varsayar; tekrar eden değerleri kaldırın.' }
  return { ok: true, value: values }
}
