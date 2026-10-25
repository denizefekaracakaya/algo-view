# Algo View

**Algoritmaları görünür kıl.** Algo View, Stanford CS161 *Design and Analysis of Algorithms* (Winter 2026) dersinin kamuya açık materyallerine dayanan, Türkçe ve İngilizce, etkileşimli bir algoritma öğrenme uygulamasıdır. Öğrenci kendi girdisini verir, algoritmayı adım adım (ileri/geri) çalıştırır, her adımın nedenini okur, bir sonraki adımı tahmin eder ve çalışmayı karmaşıklık analizine bağlar.

> Algo View bağımsız bir eğitim projesidir; Stanford Üniversitesi ile bağlantılı ya da onun resmî bir ürünü değildir. Açıklamalar, örnekler ve sorular özgündür; resmî materyallere yalnızca bağlantı verilir. Resmî ödev çözümleri yer almaz.

## Hızlı başlangıç / Quick start

**Gerekenler:** [Node.js](https://nodejs.org/) 20.19+ veya 22.12+ (npm ile birlikte gelir) ve Git.

```bash
git clone https://github.com/denizefekaracakaya/algo-view.git
cd algo-view
npm install
npm run dev
```

Terminalde yazan adresi (varsayılan **http://localhost:5173**) tarayıcıda aç. Önerilen ilk yol:

1. **Panel**'de Ders 1'i aç; bölümleri oku, görselleştiricide *İleri / Geri* ile adım adım ilerle.
2. Ders sonundaki mini quiz'i çöz ve **Tamamlandı olarak işaretle**.
3. **Alıştırma** sayfasında elle iz sür, üretilen soruları çöz, kod yaz ya da sınav ol.
4. Ders sonundaki **Notlarım** kutusuna kendi özetini yaz.
5. Arada bir **Ayarlar → Çalışmalarını kaydet → Yedeği indir** ile yedek al.

İnternete bağlanmadan kullanmak ya da başka bir bilgisayara kopyalamak için `npm run build` ile `dist/` klasörünü üret ve `npm run preview` ile aç (veya `dist/`'i herhangi bir statik sunucuya koy).

> **English:** install Node.js 20.19+ / 22.12+, then run the four commands above and open http://localhost:5173. Switch the interface to English with the **TR | EN** button in the top bar. Your work is saved automatically in the browser; use **Settings → Save your work → Download backup** to keep a copy.

## Çalışmaların nasıl kaydedilir?

Hesap ya da sunucu yoktur; her şey **bu tarayıcıda, yerelde** (`localStorage`, anahtar `algoview:progress:v1`) saklanır ve her değişiklikte otomatik kaydedilir:

- ders durumları ve okunan bölümler, quiz cevapları,
- elle iz sürme ve soru üreteci istatistikleri, sınav geçmişi (son 20),
- kod alıştırmalarındaki taslak kodlar ve çözülenler,
- kişisel notlar, dil / tema / oynatma tercihleri.

Sayfayı kapatıp açmak ya da bilgisayarı yeniden başlatmak verileri silmez. Aynı anda iki sekme açıksa biri kaydettiğinde diğeri o veriyi alır. Gizli pencerede ya da depolama doluysa tarayıcı kaydetmeye izin vermez; Ayarlar sayfası bunu uyarı olarak gösterir.

**Ayarlar → Çalışmalarını kaydet** bölümünde:

- **Yedeği indir (.json):** tüm ilerlemeyi tek bir dosyaya indirir (`algo-view-yedek-YYYY-AA-GG.json`).
- **Yedekten geri yükle:** bir yedek dosyasını seçince içeriğinin özeti gösterilir; onaylarsan bu tarayıcıdaki ilerlemenin yerine geçer. Böylece çalışmalarını başka bir tarayıcıya veya bilgisayara taşıyabilirsin.
- **Kalıcı depolama iste:** tarayıcıdan, disk dolduğunda bu sitenin verilerini kendiliğinden silmemesini ister (destekleyen tarayıcılarda).

Tarayıcı verilerini (çerezler ve site verileri) temizlemek kayıtları siler; bundan önce yedek indir. Notlar ayrıca **Notlar** sayfasından Markdown olarak indirilebilir.

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

Her ders: öğrenme hedefleri, ön koşullar, bölüm bölüm okuma takibi, bölümlerin arasında puanlanmayan “Kendini dene” soruları (toplam 75) ve ders sonu özeti, görselleştiricilerden önce “Uygulamaya hazırlık” görevleri, “Pratikte” bölümleri, sezgi, biçimsel tanım, etkileşimli görselleştirme, sözde kod, doğruluk (adım adım açılan kanıt), karmaşıklık (varsayımlarıyla), sık hatalar, mini quiz (çoktan seçmeli / sayısal / sıralama; ipucu, geri bildirim, çözüm), özgün alıştırmalar, resmî kaynak bağlantıları ve tamamlama düğmesi.

## Alıştırma laboratuvarı

Üst menüdeki **Alıştırma** sayfası (`#/alistirma`) dört sekmeden oluşur; her dersin sonunda da o derse filtrelenmiş bağlantılar vardır.

- **Elle iz sür:** InsertionSort, Merge, medyanların medyanı, Partition, RadixSort ve BST ekleme için algoritmanın her kararını öğrenci verir. Yanlış seçim ipucu gösterir ve hata sayılır; “Bu adımı göster” adımı açar (`src/practice/drills.ts`).
- **Soru üreteci:** 14 derse yayılmış 21 soru türü; her soru rastgele bir tohumla yeni girdi alır ve cevap motorlarla hesaplanır (`src/practice/generators.ts`). Oturum skoru, seri ve tür başına toplam tutulur.
- **Kod:** 13 JavaScript alıştırması (InsertionSort, Merge, MergeSort, ters çift sayma, Master durumu, Select, Partition, QuickSort, RadixSort, BST ekleme, BST doğrulama, sola rotasyon, Karatsuba). Kod tarayıcıda ayrı bir Web Worker’da çalışır, 5 saniyede bitmezse durdurulur; beklenen çıktılar referans uygulamalarla hesaplanır, `console.log` çıktısı gösterilir, taslak otomatik kaydedilir (`src/practice/coding.ts`, `runner.ts`).
- **Sınav:** Ders seçimi, 5/10/20 soru ve süre sınırı (yok/10/20/30 dk). Quiz, “kendini dene” ve üretilen sorulardan karışık set; sınav boyunca geri bildirim yok, sonunda ders bazında skor ve her sorunun çözümü. Son 20 sınav saklanır (`src/practice/exam.ts`).

## Notlar

Her dersin sonunda **Notlarım** kutusu vardır; yazılanlar otomatik kaydedilir. **Notlar** sayfası (`#/notlar`) tüm notları toplar ve Markdown olarak indirmeye izin verir. Notlar ilerleme sıfırlanınca silinmez.

## Dil ve tema

- **Türkçe / English:** Üst çubuktaki **TR | EN** düğmesi (veya Ayarlar → Dil) tüm arayüzü, ders içeriğini, quizleri ve algoritma adım açıklamalarını değiştirir. Seçim `localStorage`’da saklanır. İngilizce içerik `src/content/en/` altındadır; `content.test.ts` iki dilin aynı ders/soru/cevap/görselleştirici yapısına sahip olduğunu denetler.
- **Açık / karanlık mod:** Üst çubuktaki güneş/ay düğmesi açık ve karanlık mod arasında geçiş yapar; Ayarlar’da “sistem ayarını izle” seçeneği de vardır. Tema ilk boyamadan önce uygulanır (yanıp sönme olmaz).

## Teknolojiler

React 19 · TypeScript (strict) · Vite 8 · React Router (HashRouter) · KaTeX · lucide-react · Vitest + Testing Library · Playwright · oxlint. Arka uç, API anahtarı veya hesap yoktur; ilerleme `localStorage`’da tutulur, JSON yedek dosyası olarak dışa/içe aktarılabilir.

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
  practice/     Elle iz sürme, soru üreteçleri, kod alıştırmaları, sınav modu (+ testleri)
  state/        İlerleme modeli, reducer, localStorage kalıcılığı
  pages/        Panel, Ders, Alıştırma, Notlar, Kaynaklar, Ayarlar
e2e/            Playwright testleri
docs/           Kaynak envanteri, müfredat haritası, teknik kararlar
```
