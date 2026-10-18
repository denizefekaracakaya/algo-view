/**
 * Minimal i18n: the active language lives in a module variable so pure engines (trace
 * explanations) and content getters can read it without React. The app remounts its
 * page tree when the language changes, so every memoized trace is regenerated.
 */
export type Lang = 'tr' | 'en'

export const LANGS: Lang[] = ['tr', 'en']

let current: Lang = 'tr'

export const getLang = (): Lang => current

export function setCurrentLang(l: Lang): void {
  current = l
}

/** Pick the Turkish or English string for the active language. */
export const tx = (tr: string, en: string): string => (current === 'en' ? en : tr)

/** Locale tag for number formatting and case-insensitive search. */
export const locale = (): string => (current === 'en' ? 'en' : 'tr')
