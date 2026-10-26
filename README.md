# Algo View

**Algoritmaları ezberlemek yerine çalışırken izle.**

Algo View, algoritma analizi dersine çalışanlar için hazırlanmış Türkçe ve İngilizce, etkileşimli bir çalışma uygulaması. Kendi dizini girersin, algoritmayı adım adım ileri geri oynatırsın, her adımda *neden* öyle olduğunu okursun. Sonra elle iz sürerek, soru çözerek, kod yazarak ve deneme sınavlarıyla öğrendiğini pekiştirirsin.

İçerik, Stanford CS161 *Design and Analysis of Algorithms* (Winter 2026) dersinin herkese açık materyallerinin 17 dersini takip ediyor: asimptotik analizden hash tablolarına, grafik algoritmalarından dinamik programlamaya, maksimum akıştan kararlı eşleşmeye kadar.

---

## Neler var?

| | |
|---|---|
| **Etkileşimli dersler** | Her konu sezgiyle başlar, sonra tanım, sözde kod, doğruluk kanıtı ve karmaşıklık analizi gelir. Kanıtlar adım adım açılır, aradaki “Kendini dene” soruları anlayıp anlamadığını yoklar. |
| **Görselleştiriciler** | MergeSort, QuickSort, Select, kırmızı-siyah ağaç (ekleme ve silme), hash tablosu, BFS/DFS, Dijkstra, Bellman–Ford, Floyd–Warshall, LCS ve sırt çantası tabloları, Huffman, Prim/Kruskal, Ford–Fulkerson ve Gale–Shapley gibi algoritmaları kendi girdinle adım adım oynat. Bir sonraki adımı tahmin etmeni isteyen bir *tahmin modu* da var. |
| **Elle iz sürme** | Algoritmanın her kararını sen verirsin: hangi eleman nereye gider, pivot nereye oturur, BFS kuyruğundan sıradaki kim çıkar, Dijkstra hangi düğümü kesinleştirir, Kruskal kenarı alır mı? 14 alıştırma, her seferinde yeni girdiyle. Takılırsan ipucu var. |
| **Soru üreteci** | 36 soru türü, her seferinde yeni sayılarla. Bitmeyen bir alıştırma kaynağı. |
| **Kod alıştırmaları** | MergeSort’tan Dijkstra’ya, LCS’den maksimum akışa 27 algoritmayı JavaScript ile kendin yaz, testler tarayıcıda anında çalışsın. Sonsuz döngüye girsen bile sayfa donmaz. |
| **Deneme sınavı** | Dersleri, soru sayısını ve süreyi seç; sonunda ders ders puanını ve her sorunun çözümünü gör. |
| **Notlar** | Her dersin sonuna kendi özetini yaz, hepsini tek bir Markdown dosyası olarak indir. |
| **Türkçe / English, açık / karanlık tema** | Üst çubuktan tek tıkla değiştirilir. Telefonda da rahatça kullanılır. |

## Hızlı başlangıç

Bilgisayarında [Node.js](https://nodejs.org/) (20.19 veya daha yeni, LTS sürümü yeterli) ve [Git](https://git-scm.com/) kurulu olsun. Sonra bir terminal açıp şunları çalıştır:

```bash
git clone https://github.com/denizefekaracakaya/algo-view.git
cd algo-view
npm install
npm run dev
```

Terminalde çıkan adresi (genellikle **http://localhost:5173**) tarayıcında aç, hepsi bu. Bir dahaki sefere yalnızca `algo-view` klasöründe `npm run dev` demen yeterli.

> İlk `npm install` birkaç dakika sürebilir. Yeni bir sürüm çıktığında klasörde `git pull` ve ardından `npm install` çalıştırarak güncelleyebilirsin.

## Nasıl çalışabilirsin?

Bir konuyu çalışırken şu sıra işe yarıyor:

1. **Dersi oku.** Panelden dersi aç, görselleştiricide kendi örneklerini dene. Tahmin modunu açarsan uygulama her önemli adımdan önce “sence ne olacak?” diye sorar.
2. **Elle iz sür.** *Alıştırma → Elle iz sür* sekmesinde algoritmayı kendin yürüt. Hatasız bitirmek, konuyu gerçekten anladığının iyi bir işareti.
3. **Soru çöz.** *Soru üreteci* her seferinde yeni sayılar verir; bir türü rahatça çözene kadar tekrarlayabilirsin.
4. **Kodla.** *Kod* sekmesinde algoritmayı sıfırdan yaz. Örnek çözüm, kodunu en az bir kez çalıştırdıktan sonra açılır.
5. **Kendini sına.** Sınavdan önce *Sınav* sekmesinden süreli bir deneme yap; puanının düşük kaldığı derslere geri dön.

Ders sonundaki **Notlarım** kutusu, kendi cümlelerinle kısa bir özet yazmak için. Sınavdan önce Notlar sayfasından hepsini birlikte okuyabilirsin.

## Konular

| Ders | Konular |
|---|---|
| 1 | Algoritma nedir, çalışma süresi, Karatsuba çarpımı |
| 2 | InsertionSort ve döngü değişmezi, MergeSort, asimptotik gösterim (O, Ω, Θ) |
| 3 | Özyinelemeli bağıntılar, Master Teoremi, yerine koyma yöntemi |
| 4 | Medyan ve seçim problemi, medyanların medyanı ile Select |
| 5 | Rastgele algoritmalar, QuickSort ve beklenen çalışma süresi |
| 6 | Karşılaştırmalı sıralamanın alt sınırı, CountingSort, RadixSort |
| 7 | İkili arama ağaçları, kırmızı-siyah ağaçlar (ekleme ve silme) |
| 8 | Hash tabloları, evrensel hashing, doğum günü paradoksu |
| 9 | Grafik gösterimi, BFS, DFS, bağlı bileşenler, topolojik sıra |
| 10 | Güçlü bağlı bileşenler |
| 11 | Dijkstra, negatif kenarlar, amortize analiz |
| 12 | Dinamik programlama: Bellman–Ford, Floyd–Warshall |
| 13 | En uzun ortak altdizi, sırt çantası, ağaçta bağımsız küme |
| 14 | Açgözlü algoritmalar: etkinlik seçimi, zamanlama, Huffman kodları |
| 15 | Minimum yayılan ağaçlar: Prim ve Kruskal |
| 16 | Maksimum akış, minimum kesme, Ford–Fulkerson, eşleştirme |
| 17 | Kararlı eşleşme ve Gale–Shapley |

Her dersin sonunda kısa bir quiz ve dersin resmî slayt ve notlarına bağlantılar bulunur.

## Çalışmaların güvende

Hesap açman gerekmiyor. İlerlemen, quiz cevapların, kodların, sınav geçmişin ve notların kendi tarayıcında saklanır ve her değişiklikte otomatik kaydedilir. Sayfayı kapatsan da bilgisayarı yeniden başlatsan da kaldığın yerden devam edersin.

Başka bir bilgisayara geçeceksen ya da tarayıcı verilerini temizleyeceksen **Ayarlar → Çalışmalarını kaydet** bölümünü kullan:

- **Yedeği indir:** Her şeyi tek bir `.json` dosyasına kaydeder.
- **Yedekten geri yükle:** O dosyayı başka bir tarayıcıda açar ve kaldığın yerden devam etmeni sağlar.
- **Kalıcı depolama iste:** Tarayıcıdan, disk dolduğunda verilerini silmemesini ister.

Gizli pencerede tarayıcılar kayıt tutmaz; düzenli çalışmak için normal bir pencere kullan.

## In English

Algo View is an interactive study companion for an algorithms course, available in Turkish and English. It follows 17 lectures of the public Stanford CS161 (Winter 2026) materials: asymptotics and sorting, recurrences, selection, randomized algorithms, BSTs and red-black trees, hashing, graph search, strongly connected components, shortest paths, dynamic programming, greedy algorithms, minimum spanning trees, max flow and stable matching.

You can step through algorithms on your own input, trace them by hand, solve generated questions, write and test code in the browser, and take timed practice exams. Install [Node.js](https://nodejs.org/) and Git, run the four commands from the quick start above, open http://localhost:5173 and switch to English with the **TR | EN** button. Your work is saved in the browser automatically, and **Settings → Save your work** lets you download a backup or move it to another computer.

## Geliştirmek isteyenler için

Uygulama React, TypeScript ve Vite ile yazıldı; sunucu ya da veritabanı yok, her şey tarayıcıda çalışıyor.

```bash
npm run dev          # geliştirme sunucusu
npm test             # birim testleri (Vitest)
npm run test:e2e     # tarayıcı testleri (Playwright; ilk sefer: npx playwright install chromium)
npm run typecheck    # TypeScript denetimi
npm run lint         # kod stili denetimi
npm run build        # yayına hazır sürüm → dist/
npm run preview      # derlenen sürümü yerelde aç
```

`npm run build` ile oluşan `dist/` klasörü düz statik dosyalardan oluşur. Herhangi bir statik barındırma hizmetine konabilir ya da bir arkadaşına klasör olarak verilebilir.

<details>
<summary>Proje yapısı</summary>

```
src/
  engines/      Algoritmaların kendisi ve adım adım iz üreticileri
  trace/        Adım oynatıcı
  components/   Ortak arayüz parçaları (görselleştirici, quiz, formüller…)
  viz/          Derslere özel görselleştiriciler
  content/      Ders metinleri (Türkçe; İngilizcesi content/en/)
  practice/     Elle iz sürme, soru üreteci, kod alıştırmaları, sınav
  state/        İlerleme ve kayıt
  pages/        Sayfalar
e2e/            Tarayıcı testleri
docs/           Kaynak listesi, müfredat haritası, teknik kararlar
```

Tasarım kararlarının ayrıntıları [`docs/technical-decisions.md`](docs/technical-decisions.md) dosyasında.

</details>

## Geri bildirim

Bir hata bulduysan, bir açıklamayı anlaşılmaz bulduysan ya da eklenmesini istediğin bir konu varsa GitHub'da bir *issue* açabilir veya doğrudan bana yazabilirsin. Her öneri uygulamayı daha iyi bir çalışma aracı yapıyor.

## Hakkında

Algo View, öğrenciler için hazırlanmış bağımsız bir projedir. Stanford CS161'in herkese açık ders materyallerinden yola çıkar ama Stanford Üniversitesi ile bir bağı yoktur. Açıklamalar, örnekler ve sorular bu proje için yazıldı; resmî slayt ve notlara yalnızca bağlantı verilir. Ödev çözümleri bulunmaz, çünkü amaç konuyu gerçekten anlamana yardım etmek.

İyi çalışmalar!
