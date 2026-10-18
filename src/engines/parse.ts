/** Input parsing helpers shared by the visualizers. Errors are returned in the active language. */
import { tx } from '../i18n/lang'

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
    if (!Number.isFinite(v)) return { ok: false, error: tx(`"${t}" geçerli bir sayı değil.`, `"${t}" is not a valid number.`) }
    if (integer && !Number.isInteger(v)) return { ok: false, error: tx(`"${t}" bir tam sayı değil; bu görselleştirme tam sayılarla çalışır.`, `"${t}" is not an integer; this visualization works with integers.`) }
    if (nonNegative && v < 0) return { ok: false, error: tx(`"${t}" negatif; bu algoritma negatif olmayan anahtarlar varsayar.`, `"${t}" is negative; this algorithm assumes non-negative keys.`) }
    if (opts.min !== undefined && v < opts.min) return { ok: false, error: tx(`Değerler en az ${opts.min} olmalı ("${t}").`, `Values must be at least ${opts.min} ("${t}").`) }
    if (opts.max !== undefined && v > opts.max) return { ok: false, error: tx(`Değerler en fazla ${opts.max} olmalı ("${t}").`, `Values must be at most ${opts.max} ("${t}").`) }
    values.push(v)
  }
  if (values.length < minLength) return { ok: false, error: tx(`En az ${minLength} değer girin.`, `Enter at least ${minLength} values.`) }
  if (values.length > maxLength)
    return { ok: false, error: tx(`Animasyonun okunabilir kalması için en fazla ${maxLength} değer girilebilir (şu an ${values.length}).`, `To keep the animation readable, at most ${maxLength} values can be entered (currently ${values.length}).`) }
  if (distinct && new Set(values).size !== values.length)
    return { ok: false, error: tx('Bu görselleştirme ders notlarındaki gibi farklı (tekrarsız) anahtarlar varsayar; tekrar eden değerleri kaldırın.', 'Like the lecture notes, this visualization assumes distinct keys; remove the repeated values.') }
  return { ok: true, value: values }
}
