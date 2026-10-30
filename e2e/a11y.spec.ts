import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// A representative set: every page type, a lesson with math-only options and pseudocode,
// one with clickable red-black nodes and one with DP tables. The full sweep over all lessons
// was done once by hand; this keeps the fixes from regressing.
const ROUTES = ['/', '/alistirma', '/alistirma?mod=soru', '/notlar', '/kaynaklar', '/ayarlar', '/kapanis', '/ders/l1-why', '/ders/l2-asymptotics', '/ders/l4-select', '/ders/l5-quicksort', '/ders/l7-redblack', '/ders/l13-knapsack']

for (const theme of ['light', 'dark'] as const)
  test(`no axe violations (WCAG 2.1 AA + best practices), ${theme} theme`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one viewport is enough; overflow is covered by the smoke tests')
    test.setTimeout(120_000)
    // Without motion, entry animations cannot be caught half-faded (a false contrast failure).
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript((t) => localStorage.setItem('algoview:progress:v1', JSON.stringify({ version: 1, prefs: { theme: t, lang: 'tr', speed: 1, predict: false } })), theme)
    for (const r of ROUTES) {
      await page.goto('/#' + r)
      await page.waitForSelector('h1')
      const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze()
      expect(res.violations.map((v) => `${r}: ${v.id} (${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')})`)).toEqual([])
    }
  })
