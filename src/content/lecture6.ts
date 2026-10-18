import type { Lecture } from './types'
import { SRC } from './sources'

export const lecture6: Lecture = {
  n: 6,
  title: 'BucketSort ve sıralama için alt sınırlar',
  titleEn: 'BucketSort and Lower Bounds for Sorting',
  date: '26 Ocak 2026',
  blurb: 'Karşılaştırma modelinde Ω(n log n) alt sınırı — ve değerleri kullanarak bu sınırın ötesine geçmek: CountingSort ve RadixSort.',
  lessons: [
    {
      id: 'l6-lower-bound',
      lecture: 6,
      title: 'Karşılaştırma tabanlı sıralama için alt sınır',
      titleEn: 'Lower bound for comparison-based sorting',
      summary: 'Her karşılaştırma tabanlı algoritma bir karar ağacıdır; $n!$ yaprak $\\Rightarrow$ yükseklik $\\Omega(n\\log n)$.',
      minutes: 30,
      objectives: [
        'Hesaplama modelinin (model of computation) önemini açıklamak: hangi işlemlere izin var?',
        'Karşılaştırma tabanlı her deterministik algoritmanın bir karar ağacı (decision tree) olarak gösterilebileceğini görmek.',
        'En kötü durum çalışma süresinin ağaç yüksekliğiyle, yüksekliğin $\\log_2(n!) = \\Omega(n\\log n)$ ile sınırlandığını kanıtlamak.',
        'Alt sınırın hangi algoritmalara uygulandığını, hangilerine uygulanmadığını ayırt etmek.',
      ],
      prerequisites: ['MergeSort ve QuickSort', 'İkili ağaçlar', 'Logaritma'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: “StickSort” ve hesaplama modeli',
          label: 'intuition',
          body: `Slaytlardaki şaka: çubukları masaya dikine bırakırsanız uzunluklarına göre “sıralanırlar” — $O(1)$! Bu bize bir şey öğretir: bir alt sınır yalnızca belirli bir **hesaplama modelinde** anlamlıdır.

**Karşılaştırma tabanlı model:** öğelerin değerlerine doğrudan erişemezsiniz; yalnızca bir “cine” (genie) “$x$, $y$’den büyük mü?” diye sorabilirsiniz. InsertionSort, MergeSort ve QuickSort bu modeldedir.`,
        },
        {
          kind: 'formal',
          title: 'Teorem (Ders 6 slaytları)',
          box: 'formal',
          label: 'formal',
          body: `- Her **deterministik** karşılaştırma tabanlı sıralama algoritması en kötü durumda $\\Omega(n\\log n)$ adım atar.
- Her **rastgele** karşılaştırma tabanlı sıralama algoritması **beklenti olarak** $\\Omega(n\\log n)$ adım atar. (Kanıtı bu dersin kapsamında değil.)

Sonuç: karşılaştırma modelinde MergeSort **asimptotik olarak optimaldir**.`,
        },
        {
          kind: 'viz',
          title: 'Karar ağacı gezgini',
          viz: 'decisionTree',
          body: `Aşağıdaki ağaçlar, seçilen algoritma gerçekten çalıştırılarak oluşturuldu: her olası girdi sırası bir kahin (oracle) ile çalıştırıldı ve sorulan sorular kaydedildi. Gizli girdiyi değiştirin; vurgulanan yolun uzunluğu o girdideki karşılaştırma sayısıdır. Yaprak sayısını ve yüksekliği $\\lceil\\log_2 n!\\rceil$ ile karşılaştırın.`,
        },
        {
          kind: 'correctness',
          title: 'Kanıt',
          label: 'formalProof',
          proof: [
            { title: 'Algoritma = karar ağacı', body: 'Deterministik bir algoritma, şimdiye kadarki cevaplara göre bir sonraki soruyu seçer. İç düğümler sorular, iki çocuk EVET/HAYIR cevapları, yapraklar çıktılardır. Bir girdide çalışmak, kökten bir yaprağa giden bir yoldur.' },
            { title: 'Çalışma süresi ≥ yol uzunluğu', body: 'Her soru en az bir adımdır; dolayısıyla en kötü durum çalışma süresi ≥ en uzun yol = ağacın yüksekliği $h$.' },
            { title: 'En az n! yaprak', body: '$n$ farklı öğenin $n!$ sırası var; her biri farklı bir çıktı gerektirir. İki farklı sıra aynı yaprağa düşerse algoritma birinde yanlış çıktı verir.' },
            { title: 'Yükseklik', body: 'Yüksekliği $h$ olan ikili ağacın en fazla $2^h$ yaprağı vardır: $2^h \\ge n!$, yani $h \\ge \\log_2(n!)$.' },
            { title: 'Stirling', body: '$\\log_2(n!) \\ge \\log_2\\big((n/2)^{n/2}\\big) = \\frac n2\\log_2\\frac n2 = \\Omega(n\\log n)$. (Slaytlar: $n! \\approx (n/e)^n$.)' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Alt sınır neyi söyler, neyi söylemez?',
          body: `- Yalnızca **karşılaştırma modelindeki** algoritmalar için geçerlidir. Değerleri doğrudan kullanan (ör. kova indeksi olarak) algoritmalar bu modelin dışındadır — bir sonraki ders.
- Bir **alt sınırdır** (Ω): “hiçbir karşılaştırma algoritması daha hızlı olamaz” der; belirli bir algoritmanın hızlı olduğunu söylemez.
- En kötü durum içindir: bazı girdilerde (ör. sıralı dizide InsertionSort) çok daha az karşılaştırma yapılabilir; ama her algoritmanın en az bir “kötü” girdisi vardır.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- “Her sıralama algoritması $\\Omega(n\\log n)$ gerektirir.” — Yanlış: CountingSort/RadixSort farklı bir modelde $O(n)$’de çalışabilir.
- $\\log_2(n!)$’ı $n\\log n$’den çok küçük sanmak: $\\log_2(n!) = \\Theta(n\\log n)$.
- Kanıtta “her yaprak farklı bir sıralama” ile “en az $n!$ yaprak” arasındaki bağı atlamak.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'numeric',
          prompt: '$n = 4$ öğeyi sıralayan bir karşılaştırma algoritmasının karar ağacının yüksekliği en az kaçtır?',
          answer: 5,
          hint: '$\\lceil \\log_2 24 \\rceil$.',
          explanation: '$4! = 24$, $2^4 = 16 < 24 \\le 32 = 2^5$: yükseklik en az 5.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Yalnızca 3 öğeyi sıralayan bir “3-sort” fonksiyonunu kullanarak $n$ öğeyi sıralamak için en az kaç çağrı gerekir (asimptotik olarak en büyük alt sınır)?',
          options: ['$\\Omega(\\log n)$', '$\\Omega(\\sqrt n)$', '$\\Omega(n)$', '$\\Omega(n\\log n)$'],
          answer: 3,
          hint: 'Her çağrının en fazla kaç farklı sonucu var? Karar ağacı artık $6$-lidir.',
          explanation: 'Her çağrı $3! = 6$ sonuçtan birini verir: $6^h \\ge n!$ ⇒ $h \\ge \\log_6 n! = \\Omega(n\\log n)$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Hangisi karşılaştırma tabanlı alt sınırdan **etkilenmez**?',
          options: ['MergeSort', 'Rastgele QuickSort', 'RadixSort', 'InsertionSort'],
          answer: 2,
          hint: 'Hangisi anahtarın değerini (basamaklarını) doğrudan kullanıyor?',
          explanation: 'RadixSort basamak değerlerini kova indeksi olarak kullanır; karşılaştırma modelinde değildir.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: '$O(1)$ ekleme, $O(1)$ silme ve $O(1)$ “en küçüğü döndür” işlemlerini destekleyen, yalnızca karşılaştırma kullanan bir veri yapısı mümkün müdür?',
          options: ['Mümkün', 'İmkânsız'],
          answer: 1,
          hint: 'Böyle bir yapıyla $n$ öğeyi nasıl sıralardınız?',
          explanation: 'Mümkün olsaydı: $n$ ekleme, sonra $n$ kez “en küçüğü döndür + sil” ile $O(n)$’de karşılaştırma tabanlı sıralama yapardık — alt sınırla çelişki.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Bir öğrenci “ilk iki elemanı karşılaştır, sonra kalanları ikili aramayla yerleştir” algoritmasının $n = 5$ için en kötü durumda 6 karşılaştırma yaptığını iddia ediyor. Bu mümkün mü?`,
          hints: ['$5! = 120$ ve $2^6 = 64$.'],
          solution: `Hayır. 6 karşılaştırmalık bir karar ağacının en fazla $2^6 = 64$ yaprağı olur, ama $5! = 120$ farklı sıra ayırt edilmelidir. En az $\\lceil\\log_2 120\\rceil = 7$ karşılaştırma gerekir.`,
        },
      ],
      sources: [SRC.l6.pre, SRC.l6.slides, SRC.l6.notes, SRC.l6.blum, SRC.l6.concept, SRC.sec.s4],
    },
    {
      id: 'l6-bucketsort',
      lecture: 6,
      title: 'BucketSort: CountingSort ve RadixSort',
      titleEn: 'BucketSort: CountingSort and RadixSort',
      summary: 'Değerleri kova indeksi olarak kullan: $O(n + r)$ ve $O(d(n + r))$.',
      minutes: 35,
      objectives: [
        'CountingSort’u (anahtar başına bir FIFO kova) çalıştırmak ve $O(n + r)$ süresini açıklamak.',
        'Kararlılığı (stability) tanımlamak ve neden önemli olduğunu göstermek.',
        'LSD RadixSort’un doğruluğunu “ilk $k$ basamağa göre sıralı” değişmeziyle kanıtlamak.',
        'Taban $r$ seçiminin $O(d(n + r))$ süresine etkisini ve varsayımları değerlendirmek.',
      ],
      prerequisites: ['Alt sınır dersi', 'Bağlı listeler', 'Sayı tabanları'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: doğum ayına göre sıralamak',
          label: 'intuition',
          body: `Ön alıştırma: $n$ öğrenciyi doğum ayına göre sıralayın. MergeSort $O(n\\log n)$ alır. Ama 12 kutu açıp her öğrenciyi doğum ayının kutusuna atar, sonra kutuları Ocak’tan Aralık’a birleştirirseniz $O(n + 12) = O(n)$! Hiç karşılaştırma yapmadık: **değeri doğrudan indeks olarak** kullandık.

Ders başlığındaki “BucketSort” bu kova fikridir; notlar ve slaytlar onu **CountingSort** ve onun üstüne kurulan **RadixSort** olarak işler.`,
        },
        {
          kind: 'formal',
          title: 'Algoritmalar ve varsayımlar',
          box: 'formal',
          label: 'formal',
          body: `**CountingSort** (anahtarlar $\\{0, \\dots, r-1\\}$): $r$ boş FIFO kova (bağlı liste) oluştur; her öğeyi anahtarının kovasının **sonuna** ekle; kovaları $0, 1, \\dots, r-1$ sırasıyla birleştir. **En kötü durum** $O(n + r)$.

**Kararlılık:** aynı anahtarlı $x$ girdide $y$’den önceyse çıktıda da önce gelir. FIFO kovalar bunu garanti eder.

**RadixSort** ($d$ basamaklı, taban $r$): $t = 1, \\dots, d$ için (en anlamsız basamaktan başlayarak) $t$. basamağı anahtar alan CountingSort uygula. **En kötü durum** $O(d(n + r))$; en büyük değer $M$ ise $d = \\lfloor\\log_r M\\rfloor + 1$.

**Varsayımlar (slaytlar):** değerlere doğrudan erişebiliriz; olası değerler önceden bilinir; çok fazla olası değer yoktur.`,
        },
        {
          kind: 'viz',
          title: 'Kova görselleştiricisi',
          viz: 'bucketSort',
          body: `CountingSort ile başlayın, sonra RadixSort’a geçin. Alt simgeler girişteki sırayı gösterir: eşit anahtarlı öğelerin sırasının korunduğunu izleyin. RadixSort’ta tabanı (2, 10, 16…) değiştirerek geçiş sayısının ve kova sayısının nasıl değiştiğine bakın. Tahmin modunda her öğenin kovasını tahmin edin.`,
        },
        {
          kind: 'correctness',
          title: 'RadixSort’un doğruluğu',
          label: 'formalProof',
          proof: [
            { title: 'Hipotez', body: '$k$. iterasyondan sonra dizi, en anlamsız $k$ basamağa göre sıralıdır.' },
            { title: 'Taban', body: '$k = 0$: “0 basamağa göre sıralı” her dizi için doğrudur.' },
            { title: 'Adım: farklı k. basamak', body: '$x$ ve $y$’nin son $k$ basamağı için $x < y$ olsun. $x_k < y_k$ ise $x$ daha önceki bir kovaya düşer ve çıktıda önce gelir.' },
            { title: 'Adım: aynı k. basamak', body: '$x_k = y_k$ ise son $k-1$ basamakta $x < y$; hipotezle $x$, $y$’den önce gelir. Aynı kovaya girerler ve CountingSort **kararlı** olduğundan $x$ yine önde kalır.' },
            { title: 'Sonuç', body: '$d$ iterasyondan sonra dizi tüm basamaklara göre, yani tamamen sıralıdır. Kararlılık olmasaydı ikinci durum çökerdi!' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Taban seçimi',
          body: `- Taban 10 ile $\\{1..n\\}$ aralığındaki $n$ sayıyı sıralamak: $d = \\lfloor\\log_{10} n\\rfloor + 1$ → $O(n\\log n)$ — MergeSort’tan iyi değil.
- Taban $r = n$: $O\\big((\\log_n M + 1)(n + n)\\big)$. $M \\le n^c$ ($c$ sabit) ise $O(n)$ — MergeSort ve QuickSort’u geçer.
- $M = 2^n$ ise $d \\approx n/\\log n$ → $O(n^2/\\log n)$: bu rejimde RadixSort kullanmayız.
- Büyük $r$ daha çok kova (zaman/bellek), küçük $r$ daha çok basamak demektir: bir **ödünleşim** (trade-off).`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- RadixSort’u en anlamlı basamaktan başlatıp her geçişte tüm diziyi yeniden kovalamak: yanlış sonuç verir.
- Kovaları LIFO (yığın) gibi kullanmak: kararlılık bozulur ve RadixSort yanlış sıralar.
- CountingSort’u $r \\gg n$ iken kullanmak: $O(n + r)$ hâkim terim $r$ olur.
- Negatif sayılar: bu sürüm negatif olmayan anahtar varsayar (bir öteleme ile genişletilebilir).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '$[21, 345, 13, 101, 50, 234, 1]$ dizisine taban 10 RadixSort’un **ilk** geçişi uygulandıktan sonra dizi nedir?',
          options: ['$[50, 21, 101, 1, 13, 234, 345]$', '$[1, 13, 21, 50, 101, 234, 345]$', '$[101, 1, 13, 21, 234, 345, 50]$', '$[21, 101, 1, 50, 13, 234, 345]$'],
          answer: 0,
          hint: 'Birler basamağı: 1, 5, 3, 1, 0, 4, 1. Kova sırası korunur.',
          explanation: 'Kova 0: 50; kova 1: 21, 101, 1 (giriş sırasıyla); kova 3: 13; kova 4: 234; kova 5: 345.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Değerleri $[1, n^3)$ aralığında olan $n$ tam sayıyı sıralamak için RadixSort’ta en iyi taban hangisidir?',
          options: ['2', '10', '$n$', '$n^2$'],
          answer: 2,
          hint: '$O(d(n + r))$ ve $d = \\lfloor\\log_r M\\rfloor + 1$.',
          explanation: '$r = n$: $d \\le 3$ (ya da 4), süre $O(n)$. $r = n^2$ ise $O(n^2)$ kova; $r = 2$ veya $10$ ise $d = \\Theta(\\log n)$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: '$[1, n^3)$ aralığındaki $n$ tam sayı için CountingSort’un çalışma süresi nedir?',
          options: ['$\\Theta(n)$', '$\\Theta(n\\log n)$', '$\\Theta(n^2)$', '$\\Theta(n^3)$'],
          answer: 3,
          hint: '$r = n^3$.',
          explanation: '$O(n + r) = O(n + n^3) = \\Theta(n^3)$ — kovaları oluşturup taramak baskın.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'RadixSort’un doğruluk kanıtı CountingSort’un hangi özelliğine dayanır?',
          options: ['Yerinde (in-place) olmasına', 'Kararlı (stable) olmasına', 'Rastgele olmasına', 'Karşılaştırma kullanmasına'],
          answer: 1,
          hint: 'Aynı basamağa sahip iki sayının göreli sırası ne olmalı?',
          explanation: 'Aynı $k$. basamaklı öğeler bir önceki geçişin sırasını korumalı; bu kararlılıktır.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: $[170, 45, 75, 90, 802, 24, 2, 66]$ dizisine taban 10 LSD RadixSort uygulayın; her geçişten sonraki diziyi yazın.`,
          hints: ['Üç basamak var (802); 45 gibi sayıların yüzler basamağı 0’dır.'],
          solution: `Geçiş 1 (birler): $[170, 90, 802, 2, 24, 45, 75, 66]$. Geçiş 2 (onlar): $[802, 2, 24, 45, 66, 170, 75, 90]$. Geçiş 3 (yüzler): $[2, 24, 45, 66, 75, 90, 170, 802]$. Görselleştiricideki “Tekrarlı” örnekle karşılaştırın.`,
        },
      ],
      sources: [SRC.l6.pre, SRC.l6.notes, SRC.l6.slides, SRC.l6.notebook, SRC.l6.concept],
    },
    {
      id: 'l6-compare',
      lecture: 6,
      title: 'Sıralama algoritmalarını karşılaştırmak',
      titleEn: 'Comparing the sorting algorithms so far',
      summary: 'Model, garanti türü ve varsayımlar: hangi durumda hangisi?',
      minutes: 15,
      objectives: [
        'Ders 2–6’daki sıralama algoritmalarını model, en kötü durum, beklenen süre ve varsayımlara göre karşılaştırmak.',
        'En kötü durum, beklenen ve girdi dağılımına bağlı performansı ayırt etmek.',
        'Bir senaryo için uygun algoritmayı gerekçesiyle seçmek.',
      ],
      prerequisites: ['Ders 2–6’daki sıralama dersleri'],
      sections: [
        {
          kind: 'viz',
          title: 'Karşılaştırma tablosu ve senaryolar',
          viz: 'sortComparison',
          body: `Bir senaryo seçin; uygun algoritmalar ve gerekçe vurgulanır. Tablodaki “garanti türü” sütununa özellikle dikkat edin.`,
        },
        {
          kind: 'text',
          title: 'Üç farklı garanti türü',
          body: `- **En kötü durum (deterministik):** her girdi için geçerli (MergeSort $O(n\\log n)$, CountingSort $O(n + r)$).
- **Beklenen (rastgele algoritma):** her girdi için, algoritmanın rastgele seçimleri üzerinden beklenti (rastgele QuickSort $O(n\\log n)$). Tek bir çalışma daha kötü olabilir.
- **Girdi dağılımına bağlı (ortalama durum):** girdilerin rastgele geldiği varsayımı altında (ör. sabit pivotlu QuickSort’un rastgele permütasyonlarda iyi çalışması). Rakip bu varsayımı bozabilir.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Girdileri bir rakibin seçtiği ve yalnızca karşılaştırma yapılabilen bir ortamda **en kötü durum** $O(n\\log n)$ garantisi veren algoritma hangisidir?',
          options: ['Rastgele QuickSort', 'MergeSort', 'InsertionSort', 'CountingSort'],
          answer: 1,
          hint: 'Rastgele QuickSort’un garantisi hangi türdendir?',
          explanation: 'MergeSort deterministik ve en kötü durumda $O(n\\log n)$. Rastgele QuickSort’un garantisi beklenen süre içindir.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Sabit pivotlu (ilk eleman) QuickSort için “rastgele permütasyonlarda ortalama $O(n\\log n)$” iddiası hangi tür garantidir?',
          options: ['En kötü durum', 'Algoritmanın rastgeleliği üzerinden beklenen', 'Girdi dağılımına bağlı (ortalama durum)', 'Alt sınır'],
          answer: 2,
          hint: 'Rastgelelik algoritmadan mı, girdiden mi geliyor?',
          explanation: 'Algoritmada rastgelelik yok; iddia girdilerin rastgele olduğu varsayımına dayanıyor. Sıralı girdide $\\Theta(n^2)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: 10 milyon ürün kaydını, 0–999 arasındaki kategori koduna göre, **aynı kategorideki kayıtların mevcut sırası bozulmadan** sıralamanız gerekiyor. Hangi algoritmayı seçerdiniz? Neden?`,
          hints: ['“Mevcut sıra bozulmadan” hangi özelliği istiyor?', '$r = 1000 \\ll n$.'],
          solution: `CountingSort ($r = 1000$ kova): $O(n + r) = O(n)$ ve kararlı — aynı kategorideki kayıtlar girdi sırasını korur. MergeSort da kararlıdır ama $O(n\\log n)$; QuickSort kararlı değildir.`,
        },
      ],
      sources: [SRC.l6.slides, SRC.l5.slides, SRC.l2.notes],
    },
  ],
}
