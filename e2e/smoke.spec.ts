import { expect, test, type Page } from '@playwright/test'

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

test('dashboard lists lectures 1–7 and nothing beyond', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Algoritmaları görünür kıl.' })).toBeVisible()
  for (let n = 1; n <= 7; n++) await expect(page.getByText(new RegExp(`^Ders ${n} ·`)).first()).toBeVisible()
  await expect(page.getByText(/^Ders 8 ·/)).toHaveCount(0)
  await noHorizontalOverflow(page)
})

test('search filter narrows lessons', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder(/Konu ara/).fill('kırmızı')
  await expect(page.getByRole('link', { name: /Kırmızı-siyah ağaçlar/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Karatsuba/ })).toHaveCount(0)
})

test('lesson navigation and step controls (next / prev / reset)', async ({ page }) => {
  await page.goto('/#/ders/l2-insertion')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('InsertionSort')
  const viz = page.getByRole('region', { name: 'InsertionSort görselleştirmesi' })
  const counter = viz.locator('.step-count')
  await expect(counter).toHaveText(/^1 \//)
  const explain = viz.locator('.explain')
  const first = await explain.textContent()
  await viz.getByRole('button', { name: 'Sonraki adım' }).click()
  await viz.getByRole('button', { name: 'Sonraki adım' }).click()
  await expect(counter).toHaveText(/^3 \//)
  const third = await explain.textContent()
  expect(third).not.toBe(first)
  await viz.getByRole('button', { name: 'Önceki adım' }).click()
  await viz.getByRole('button', { name: 'Sonraki adım' }).click()
  await expect(explain).toHaveText(third!)
  await viz.getByRole('button', { name: 'Başa sar' }).click()
  await expect(counter).toHaveText(/^1 \//)
  await expect(explain).toHaveText(first!)
  // next lesson link
  await page.getByRole('link', { name: /MergeSort ve özyineleme ağacı/ }).last().click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('MergeSort')
})

test('invalid input shows an error message', async ({ page }) => {
  await page.goto('/#/ders/l2-insertion')
  const input = page.getByLabel('Girdi dizisi').first()
  await input.fill('3, x, 5')
  await page.getByRole('button', { name: 'Uygula' }).first().click()
  await expect(page.getByRole('alert').first()).toContainText('geçerli bir sayı değil')
})

test('quiz feedback and progress persist across reload', async ({ page }) => {
  await page.goto('/#/ders/l6-lower-bound')
  const q = page.locator('.quiz-q').filter({ hasText: 'karar ağacının yüksekliği en az kaçtır' })
  await q.getByLabel('Cevabınız').fill('4')
  await q.getByRole('button', { name: 'Kontrol et' }).click()
  await expect(q.getByRole('status')).toContainText('Yanlış')
  await q.getByLabel('Cevabınız').fill('5')
  await q.getByRole('button', { name: 'Kontrol et' }).click()
  await expect(q.getByRole('status')).toContainText('Doğru')
  await page.getByRole('button', { name: /Dersi tamamlandı olarak işaretle/ }).click()
  await expect(page.getByText('Bu dersi tamamladınız.')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Bu dersi tamamladınız.')).toBeVisible()
  await expect(q.getByText('çözüldü')).toBeVisible()
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Kaldığın yerden devam et/ })).toBeVisible()
})

test('progress reset asks for confirmation', async ({ page }) => {
  await page.goto('/#/ders/l1-why')
  await page.getByRole('button', { name: /Dersi tamamlandı olarak işaretle/ }).click()
  await page.goto('/#/ayarlar')
  await page.getByRole('button', { name: 'İlerlemeyi sıfırla' }).click()
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.getByRole('button', { name: 'Vazgeç' }).click()
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
  await expect(page.getByText(/1 derse girildi/)).toBeVisible()
  await page.getByRole('button', { name: 'İlerlemeyi sıfırla' }).click()
  await page.getByRole('button', { name: 'Evet, sıfırla' }).click()
  await expect(page.getByText(/0 derse girildi/)).toBeVisible()
})

test('red-black tree: insert runs and invariants hold at the end', async ({ page }) => {
  await page.goto('/#/ders/l7-redblack')
  const viz = page.getByRole('region', { name: 'Kırmızı-siyah ağaç ekleme görselleştirmesi' })
  await viz.getByLabel('Anahtar ekle').fill('12')
  await viz.getByRole('button', { name: 'insert_rb' }).click()
  await viz.getByRole('button', { name: 'Sona git' }).click()
  await expect(viz.locator('.explain')).toContainText('12 eklendi')
  await expect(viz.getByText('— BOZUK')).toHaveCount(0)
})

for (const id of ['l1-karatsuba', 'l2-asymptotics', 'l3-master', 'l3-substitution', 'l4-select', 'l5-quicksort', 'l5-expected', 'l6-bucketsort', 'l6-compare', 'l7-bst', 'l7-compare']) {
  test(`lesson ${id} renders without errors or overflow`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(`/#/ders/${id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.waitForTimeout(150)
    expect(errors).toEqual([])
    await noHorizontalOverflow(page)
  })
}

test('English mode: header switch translates the app; every lesson renders without errors or overflow', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto('/#/')
  await page.getByRole('button', { name: 'EN' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Make algorithms visible.')
  for (const id of ['l1-why', 'l1-karatsuba', 'l2-insertion', 'l2-mergesort', 'l2-asymptotics', 'l3-master', 'l3-substitution', 'l4-select', 'l5-quicksort', 'l5-expected', 'l6-lower-bound', 'l6-bucketsort', 'l6-compare', 'l7-bst', 'l7-redblack', 'l7-compare']) {
    await page.goto(`/#/ders/${id}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText('Learning objectives')).toBeVisible()
    await noHorizontalOverflow(page)
  }
  expect(errors).toEqual([])
})

test('theme toggle switches to dark mode and survives reload', async ({ page }) => {
  await page.goto('/#/')
  const toggle = page.getByRole('button', { name: /moda geç/ })
  const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  await toggle.click()
  const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  expect(after).not.toBe(before)
  await page.reload()
  expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe(after)
})

test('Select lesson: in-text check question feeds the summary; sections get marked as read', async ({ page }) => {
  await page.goto('/#/ders/l4-select')
  const check = page.locator('.check-block').first()
  await check.getByLabel('$8$').or(check.getByRole('radio').first()).first().check()
  await check.getByRole('button', { name: 'Kontrol et' }).click()
  await expect(check.getByText('Doğru!')).toBeVisible()
  await expect(page.locator('.check-summary')).toContainText('1 / 10')
  await page.locator('.check-summary').scrollIntoViewIfNeeded()
  await expect(page.locator('.toc-meter')).not.toContainText('0 / 14')
  await expect(page.locator('.mom-grid')).toBeVisible()
})

test('practice lab: every hand-tracing drill can be completed, and the generator keeps producing questions', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto('/#/alistirma')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Elle iz sür')
  const cards = page.locator('.drill-card')
  await expect(cards).toHaveCount(6)
  for (let c = 0; c < 6; c++) {
    await cards.nth(c).click()
    const show = page.getByRole('button', { name: 'Bu adımı göster' })
    for (let i = 0; i < 40 && (await show.count()); i++) await show.click()
    await expect(page.locator('.drill-done')).toBeVisible()
    await noHorizontalOverflow(page)
  }
  await page.getByRole('tab', { name: /Soru üreteci/ }).click()
  for (let i = 0; i < 12; i++) {
    await expect(page.locator('.quiz-q')).toBeVisible()
    await page.getByRole('button', { name: /Yeni soru/ }).click()
  }
  await expect(page.locator('.quiz-q .katex-error')).toHaveCount(0)
  await noHorizontalOverflow(page)
  expect(errors).toEqual([])
})

test('code exercises run in a worker: an infinite loop is stopped, a correct solution passes', async ({ page }) => {
  await page.goto('/#/alistirma?mod=kod&ders=l5-quicksort')
  const editor = page.getByRole('textbox', { name: /partition fonksiyonunun kodu/ })
  await editor.fill('function partition(A, lo, hi) {\n  while (true) {}\n}\n')
  await page.getByRole('button', { name: /Çalıştır ve test et/ }).click()
  await expect(page.getByText(/Süre sınırı \(5 sn\) aşıldı/)).toBeVisible({ timeout: 10_000 })
  await editor.fill(
    'function partition(A, lo, hi) {\n  const pivot = A[hi]\n  let i = lo\n  for (let j = lo; j < hi; j++) {\n    if (A[j] < pivot) { [A[i], A[j]] = [A[j], A[i]]; i++ }\n  }\n  [A[i], A[hi]] = [A[hi], A[i]]\n  return i\n}\n',
  )
  await page.getByRole('button', { name: /Çalıştır ve test et/ }).click()
  await expect(page.getByText(/^(\d+) \/ \1 test geçti\./)).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: /Partition/ }).getByLabel('çözüldü')).toBeVisible()
  await noHorizontalOverflow(page)
})

test('exam mode and notes', async ({ page }) => {
  await page.goto('/#/alistirma?mod=sinav')
  await page.getByRole('button', { name: 'Hiçbiri' }).click()
  await page.getByRole('checkbox', { name: /MergeSort/ }).first().check()
  await page.getByRole('group', { name: 'Soru sayısı' }).getByRole('button', { name: '5' }).click()
  await page.getByRole('button', { name: /Sınavı başlat/ }).click()
  await expect(page.getByRole('timer')).toContainText(/19:5\d|20:00/)
  await noHorizontalOverflow(page)
  await page.getByRole('button', { name: /Sınavı bitir/ }).click()
  await page.getByRole('button', { name: 'Bitir', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Sonuç: 0 \/ 5/ })).toBeVisible()
  await expect(page.locator('.katex-error')).toHaveCount(0)

  await page.goto('/#/ders/l7-bst')
  await page.getByRole('textbox', { name: /Bu ders için notların/ }).fill('BST: inorder = sıralı')
  await expect(page.getByText(/Kaydedildi/)).toBeVisible()
  await page.goto('/#/notlar')
  await expect(page.getByRole('textbox')).toHaveValue('BST: inorder = sıralı')
  await noHorizontalOverflow(page)
})
