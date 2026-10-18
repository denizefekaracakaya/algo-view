# Algo View

**Algoritmaları görünür kıl.** Algo View, Stanford CS161 *Design and Analysis of Algorithms* (Winter 2026) dersinin kamuya açık materyallerine dayanan, Türkçe ve İngilizce, etkileşimli bir algoritma öğrenme uygulamasıdır. Öğrenci kendi girdisini verir, algoritmayı adım adım (ileri/geri) çalıştırır, her adımın nedenini okur, bir sonraki adımı tahmin eder ve çalışmayı karmaşıklık analizine bağlar.

> Algo View bağımsız bir eğitim projesidir; Stanford Üniversitesi ile bağlantılı ya da onun resmî bir ürünü değildir. Açıklamalar, örnekler ve sorular özgündür; resmî materyallere yalnızca bağlantı verilir. Resmî ödev çözümleri yer almaz.

## Kapsam (Ders 1–7)

| Ders | Algo View dersleri | Ana etkileşimler |
|---|---|---|
| 1 · Why are you here? | Algoritmalar ve çalışma süresi · Karatsuba | Sabit çarpan vs. üs hesaplayıcısı; Mult1/Karatsuba özyineleme ağacı ve işlem sayısı grafiği |
| 2 · Asymptotics, Worst-Case, MergeSort | InsertionSort ve döngü değişmezi · MergeSort · Asimptotik gösterim | InsertionSort ↔ MergeSort görselleştiricisi, adım adım kanıtlar, büyüme gezgini, (c, n₀) tanık denetleyicisi, ampirik sayımlar |
| 3 · Recurrences and the Master Theorem | Master Teoremi · Yerine koyma | a/b/d gezgini + serbest bağıntı oyun alanı (desteklenmeyen biçimleri açıkça reddeder), seviye seviye özyineleme ağacı, adım adım yerine koyma |
| 4 · Median and Selection | Select | İlk eleman / rastgele (tohumlu) / medyanların medyanı pivotlarıyla Select; elenen bölgeler, k güncellemesi, 5’li gruplar |
| 5 · Randomized Algorithms and QuickSort | QuickSort · Beklenen süre | Yerinde QuickSort (4 pivot kuralı, tohum), pivot özyineleme ağacı, P[zᵢ,zⱼ karşılaştırılır] matrisi + simülasyon, çok-tohumlu deney histogramı |
| 6 · BucketSort and Lower Bounds | Alt sınır · CountingSort/RadixSort · Karşılaştırma | Gerçek çalıştırmadan üretilen karar ağaçları (n = 3, 4), kova görselleştiricisi (kararlılık, taban r), senaryo tabanlı algoritma karşılaştırması |
| 7 · BSTs and Red-Black Trees | BST · Kırmızı-siyah ağaç · Karşılaştırma | BST ekle/ara/sil/min/max, RB ekleme (durum 1/2/3, rotasyonlar), canlı değişmez denetleyicisi, renk değiştirme oyun alanı, BST vs RB |

Ders 8 (Hashing) ve sonrası bu sürümün kapsamı dışındadır.

Her ders: öğrenme hedefleri, ön koşullar, sezgi, biçimsel tanım, etkileşimli görselleştirme, sözde kod, doğruluk (adım adım açılan kanıt), karmaşıklık (varsayımlarıyla), sık hatalar, mini quiz (çoktan seçmeli / sayısal / sıralama; ipucu, geri bildirim, çözüm), özgün alıştırmalar, resmî kaynak bağlantıları ve tamamlama düğmesi.

## Dil ve tema

- **Türkçe / English:** Üst çubuktaki **TR | EN** düğmesi (veya Ayarlar → Dil) tüm arayüzü, ders içeriğini, quizleri ve algoritma adım açıklamalarını değiştirir. Seçim `localStorage`’da saklanır. İngilizce içerik `src/content/en/` altındadır; `content.test.ts` iki dilin aynı ders/soru/cevap/görselleştirici yapısına sahip olduğunu denetler.
- **Açık / karanlık mod:** Üst çubuktaki güneş/ay düğmesi açık ve karanlık mod arasında geçiş yapar; Ayarlar’da “sistem ayarını izle” seçeneği de vardır. Tema ilk boyamadan önce uygulanır (yanıp sönme olmaz).

## Teknolojiler

React 19 · TypeScript (strict) · Vite 8 · React Router (HashRouter) · KaTeX · lucide-react · Vitest + Testing Library · Playwright · oxlint. Arka uç, API anahtarı veya hesap yoktur; ilerleme `localStorage`’da tutulur.

## Kurulum ve komutlar

```bash
npm install
npm run dev          # geliştirme sunucusu (http://localhost:5173)
npm run typecheck    # tsc -b (strict)
npm run lint         # oxlint
npm test             # Vitest: algoritma motorları, içerik bütünlüğü, UI davranışı
npm run build        # üretim derlemesi → dist/
npm run preview      # derlemeyi yerelde sun
npx playwright install chromium   # bir kez
npm run test:e2e     # Playwright duman testleri (masaüstü + mobil)
```

`dist/` statik dosyalardan oluşur (`base: './'`, hash tabanlı yönlendirme), herhangi bir statik sunucudan açılabilir.

## Proje yapısı

```
src/
  engines/      Saf TypeScript algoritmalar + iz (trace) üreticileri ve testleri
  trace/        İz modeli (TraceStep) ve oynatıcı durum makinesi (useTracePlayer)
  components/   TraceViewer, ArrayView, TreeView, LineChart, Quiz, Tex/Rich, ProofStepper…
  viz/          Derslere özgü görselleştiriciler ve registry (içerikteki `viz` anahtarları)
  content/      Ders verisi (lecture1..7.ts; İngilizcesi en/), kaynaklar, curriculum + içerik testleri
  i18n/         Etkin dil ve tx(tr, en) yardımcısı
  state/        İlerleme modeli, reducer, localStorage kalıcılığı
  pages/        Panel, Ders, Kaynaklar, Ayarlar
e2e/            Playwright testleri
docs/           Kaynak envanteri, müfredat haritası, teknik kararlar
```

## Bilinen sınırlamalar

- Kırmızı-siyah ağaçta yalnızca **ekleme** görselleştirilir; RB silme Ders 7’de ayrıntılı işlenmediği için uygulanmadı (sıradan BST silme mevcuttur).
- Ders 7 notlarındaki **heap** bölümü (slaytlarda yok) için görselleştirme yoktur.
- Medyanların medyanı pivotu bulunurken yapılan iç `Select(C, …)` çağrısı tek adımda gösterilir.
- Görselleştirmeler okunabilirlik için girdi boyutunu sınırlar (ör. sıralama 16–20, Select 30, ağaç 31 düğüm, Karatsuba 8 basamak); sınırlar arayüzde belirtilir.
- Master Teoremi oyun alanı yalnızca `aT(n/b) + c·n^d·log^k n` ailesini çözer; farklı boyutlu terimleri ve `T(n−c)`’yi tanır ama çözmek yerine nedenini açıklar.
- Ana JS paketi ~675 kB (KaTeX + içerik); ders sayfaları ayrı bir parçada tembel yüklenir.
- Kaynak erişimi ile ilgili sınırlamalar için `docs/source-inventory.md`’ye bakın.
