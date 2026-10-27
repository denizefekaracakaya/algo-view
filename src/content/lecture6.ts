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
      minutes: 40,
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
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Hangisi karşılaştırma modelinde **izin verilen** bir işlemdir?',
              options: ['$x$’in son basamağını okumak', '“$x < y$ mi?” diye sormak', '$x$’i bir dizinin indeksi olarak kullanmak', '$x$’i 10’a bölmek'],
              answer: 1,
              hint: 'Bu modelde değerlere doğrudan erişim yok.',
              explanation: 'Karşılaştırma modelinde öğeler hakkında yalnızca ikili karşılaştırmalarla bilgi edinilir. Basamak okumak ya da değeri indeks yapmak CountingSort/RadixSort’un kullandığı başka bir modeldir.',
            },
          ],
          label: 'intuition',
          body: `Slaytlardaki şaka: çubukları masaya dikine bırakırsanız uzunluklarına göre “sıralanırlar” — $O(1)$! Bu bize bir şey öğretir: bir alt sınır yalnızca belirli bir **hesaplama modelinde** anlamlıdır.

**Karşılaştırma tabanlı model:** öğelerin değerlerine doğrudan erişemezsiniz; yalnızca bir “cine” (genie) “$x$, $y$’den büyük mü?” diye sorabilirsiniz. InsertionSort, MergeSort ve QuickSort bu modeldedir.`,
        },
        {
          kind: 'formal',
          title: 'Teorem (Ders 6 slaytları)',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Alt sınır teoremi tam olarak ne söyler?',
              options: [
                'Her sıralama algoritması her girdide $\\Omega(n\\log n)$ adım atar.',
                'Karşılaştırma tabanlı her deterministik algoritmanın, $\\Omega(n\\log n)$ karşılaştırma gerektiren **en az bir** girdisi vardır.',
                'MergeSort her girdide tam $n\\log n$ karşılaştırma yapar.',
                'Sıralama $O(n)$’de yapılamaz.',
              ],
              answer: 1,
              hint: 'Bu bir en kötü durum alt sınırıdır ve bir modele bağlıdır.',
              explanation: 'Sınır en kötü durum için ve yalnızca karşılaştırma modelinde geçerlidir. Bazı girdiler (ör. sıralı dizi) daha az karşılaştırmayla sıralanabilir; değer tabanlı algoritmalar da modelin dışındadır.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `- Her **deterministik** karşılaştırma tabanlı sıralama algoritması en kötü durumda $\\Omega(n\\log n)$ adım atar.
- Her **rastgele** karşılaştırma tabanlı sıralama algoritması **beklenti olarak** $\\Omega(n\\log n)$ adım atar. (Kanıtı bu dersin kapsamında değil.)

Sonuç: karşılaştırma modelinde MergeSort **asimptotik olarak optimaldir**.`,
        },
        {
          kind: 'viz',
          title: 'Karar ağacı gezgini',
          tasks: [
            'InsertionSort ve $n = 3$: yaprak sayısını, yüksekliği ve $\\lceil\\log_2 3!\\rceil$’i karşılaştır. InsertionSort bu sınıra ulaşıyor mu?',
            'MergeSort’u $n = 4$ ile seç: yükseklik alt sınıra ($\\lceil\\log_2 24\\rceil = 5$) eşit mi?',
            'Gizli girdiyi değiştirerek en kısa ve en uzun yolları bul. Hangi girdiler kolay, hangileri zor?',
          ],
          viz: 'decisionTree',
          body: `Aşağıdaki ağaçlar, seçilen algoritma gerçekten çalıştırılarak oluşturuldu: her olası girdi sırası bir kahin (oracle) ile çalıştırıldı ve sorulan sorular kaydedildi. Gizli girdiyi değiştirin; vurgulanan yolun uzunluğu o girdideki karşılaştırma sayısıdır. Yaprak sayısını ve yüksekliği $\\lceil\\log_2 n!\\rceil$ ile karşılaştırın.`,
        },
        {
          kind: 'correctness',
          title: 'Kanıt',
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: '6 farklı öğeyi sıralayan bir karşılaştırma algoritmasının en kötü durumda en az kaç karşılaştırma yapması gerekir?',
              answer: 10,
              hint: '$6! = 720$; $2^9 = 512$, $2^{10} = 1024$.',
              explanation: '$\\lceil \\log_2 720 \\rceil = 10$: 9 karşılaştırmalık bir ağacın en fazla 512 yaprağı olur, 720 sıralamayı ayırt edemez.',
            },
          ],
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
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'InsertionSort zaten sıralı $n$ elemanlı bir diziyi $n - 1$ karşılaştırmayla sıralar. Bu, $\\Omega(n\\log n)$ alt sınırıyla çelişir mi?',
              options: ['Evet: alt sınır yanlış olmalı.', 'Hayır: alt sınır en kötü durum içindir; InsertionSort’un da kötü girdileri var.', 'Hayır: InsertionSort karşılaştırma tabanlı değildir.', 'Evet, ama yalnızca küçük $n$ için.'],
              answer: 1,
              hint: 'Alt sınır “her girdide” mi, “bazı girdilerde” mi diyor?',
              explanation: 'Alt sınır, her karşılaştırma algoritmasının **en az bir** girdide $\\Omega(n\\log n)$ karşılaştırma yaptığını söyler. Sıralı dizi kolay bir girdidir; ters sıralı dizide InsertionSort $n(n - 1)/2$ karşılaştırma yapar.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: karar ağacı argümanı başka nerelerde işe yarar?',
          body: `Aynı “olası cevap sayısı ≤ $2^{\\text{soru sayısı}}$” fikri birçok alt sınır verir:

- **Sıralı dizide arama:** $n$ elemanlı sıralı dizide bir anahtarın konumu (ya da yokluğu) $n + 1$ farklı cevaptan biridir; karşılaştırma tabanlı her arama en kötü durumda en az $\\lceil\\log_2(n+1)\\rceil$ karşılaştırma yapar. İkili arama bu sınıra ulaşır.
- **Genel (generic) kütüphaneler:** \`sorted\`, \`std::sort\` gibi fonksiyonlar herhangi bir karşılaştırılabilir türle çalışmak zorunda oldukları için karşılaştırma modelindedir; $\\Omega(n\\log n)$ onlar için gerçek bir sınırdır.
- **Modelin dışına çıkmak:** anahtarlar küçük tam sayılar ya da sabit uzunlukta ise (ör. 32 bitlik sayılar), RadixSort gibi değer tabanlı yöntemler bu sınırın altına inebilir; GPU’lardaki hızlı sıralama kütüphaneleri bu yüzden RadixSort kullanır.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: '1 000 000 elemanlı sıralı bir dizide karşılaştırma tabanlı her arama algoritması en kötü durumda en az kaç karşılaştırma yapar?',
              answer: 20,
              hint: '$n + 1$ olası cevap; $2^{20} = 1\\,048\\,576$.',
              explanation: '$\\lceil\\log_2 1\\,000\\,001\\rceil = 20$, çünkü $2^{19} = 524\\,288 < 1\\,000\\,001 \\le 2^{20}$. İkili arama tam bu kadar yapar.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: $n$ sayının en büyüğünü bulmak için karar ağacı argümanı hangi alt sınırı verir? Bu sınır sıkı mıdır?`,
          hints: ['Kaç farklı çıktı (yaprak) gerekir?', 'Maksimum olmayan her elemanın en az bir karşılaştırmada küçük çıkması gerekir.'],
          solution: `$n$ olası cevap olduğundan ağaçta en az $n$ yaprak vardır: yükseklik $\\ge \\lceil\\log_2 n\\rceil$. Bu sınır **sıkı değildir**. Daha güçlü bir argüman: algoritma cevabından emin olabilmek için maksimum olmayan $n - 1$ elemanın her birini en az bir karşılaştırmada “yenilmiş” görmelidir ve her karşılaştırmada yalnızca bir eleman yenilir. Dolayısıyla en az $n - 1$ karşılaştırma gerekir; basit tarama da tam $n - 1$ yapar. Karar ağacı argümanı her zaman bir alt sınır verir, ama her zaman en iyisini değil.`,
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
      minutes: 50,
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
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: '1000 öğrenciyi doğum ayına göre 12 kovayla sıralayan CountingSort yaklaşık kaç temel işlem yapar ($n + r$)?',
              answer: 1012,
              hint: 'Her öğrenci bir kez kovaya atılır, her kova bir kez taranır.',
              explanation: '$n + r = 1000 + 12 = 1012$: karşılaştırma yok, süre doğrusal.',
            },
          ],
          label: 'intuition',
          body: `Ön alıştırma: $n$ öğrenciyi doğum ayına göre sıralayın. MergeSort $O(n\\log n)$ alır. Ama 12 kutu açıp her öğrenciyi doğum ayının kutusuna atar, sonra kutuları Ocak’tan Aralık’a birleştirirseniz $O(n + 12) = O(n)$! Hiç karşılaştırma yapmadık: **değeri doğrudan indeks olarak** kullandık.

Ders başlığındaki “BucketSort” bu kova fikridir; notlar ve slaytlar onu **CountingSort** ve onun üstüne kurulan **RadixSort** olarak işler.`,
        },
        {
          kind: 'formal',
          title: 'Algoritmalar ve varsayımlar',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: '(anahtar, etiket) çiftleri $[(2, a), (1, b), (2, c), (1, d)]$ anahtara göre **kararlı** sıralanırsa çıktı nedir?',
              options: ['$[(1,b), (1,d), (2,a), (2,c)]$', '$[(1,d), (1,b), (2,c), (2,a)]$', '$[(1,b), (1,d), (2,c), (2,a)]$', '$[(1,d), (1,b), (2,a), (2,c)]$'],
              answer: 0,
              hint: 'Eşit anahtarlılar girdideki sıralarını korur.',
              explanation: 'Anahtarı 1 olanlar girdideki sırayla (b, d), anahtarı 2 olanlar (a, c) gelir.',
            },
          ],
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
          tasks: [
            'CountingSort’ta “Doğum ayı” örneğini çalıştır ve alt simgelere bak: aynı aydaki öğrencilerin sırası korunuyor mu?',
            'RadixSort’ta “Slayt örneği”ni taban 10 ile çalıştır: kaç geçiş yapıldı? Sonra tabanı 2 yap: geçiş sayısı neden arttı?',
            'Taban 16’yı dene: geçiş sayısı ve kova sayısı arasındaki ödünleşimi açıkla.',
            '**Tahmin modu**nda her öğenin gideceği kovayı tahmin et.',
          ],
          viz: 'bucketSort',
          body: `CountingSort ile başlayın, sonra RadixSort’a geçin. Alt simgeler girişteki sırayı gösterir: eşit anahtarlı öğelerin sırasının korunduğunu izleyin. RadixSort’ta tabanı (2, 10, 16…) değiştirerek geçiş sayısının ve kova sayısının nasıl değiştiğine bakın. Tahmin modunda her öğenin kovasını tahmin edin.`,
        },
        {
          kind: 'correctness',
          title: 'RadixSort’un doğruluğu',
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'RadixSort en **anlamlı** basamaktan başlayıp her geçişte tüm diziyi o basamağa göre kararlı biçimde yeniden kovalasa ne olur?',
              options: ['Yine doğru sıralar.', 'Son geçiş yalnızca birler basamağına göre sıralar; önceki geçişlerin düzeni bozulur ve sonuç yanlış olabilir.', 'Daha hızlı olur.', 'Sonsuz döngüye girer.'],
              answer: 1,
              hint: 'Son geçiş hangi basamağa göre sıralıyor?',
              explanation: 'LSD sırası önemlidir: son geçiş en anlamlı basamağa göre olmalıdır ki eşitlikler önceki (daha anlamsız) basamakların düzeniyle çözülsün. Tersi yapılırsa ör. [21, 12] önce onlar basamağına, sonra birlere göre sıralanıp [21, 12] kalır — yanlış.',
            },
          ],
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
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'Değerleri $10^6$’dan küçük olan tam sayılar taban 10 RadixSort ile sıralanıyor. En fazla kaç geçiş gerekir?',
              answer: 6,
              hint: 'En büyük değer 999 999.',
              explanation: '999 999’un 6 basamağı var: $d = 6$ geçiş.',
            },
          ],
          body: `- Taban 10 ile $\\{1..n\\}$ aralığındaki $n$ sayıyı sıralamak: $d = \\lfloor\\log_{10} n\\rfloor + 1$ → $O(n\\log n)$ — MergeSort’tan iyi değil.
- Taban $r = n$: $O\\big((\\log_n M + 1)(n + n)\\big)$. $M \\le n^c$ ($c$ sabit) ise $O(n)$ — MergeSort ve QuickSort’u geçer.
- $M = 2^n$ ise $d \\approx n/\\log n$ → $O(n^2/\\log n)$: bu rejimde RadixSort kullanmayız.
- Büyük $r$ daha çok kova (zaman/bellek), küçük $r$ daha çok basamak demektir: bir **ödünleşim** (trade-off).`,
        },
        {
          kind: 'text',
          title: 'Pratikte: kovalar ve basamaklar',
          body: `- **Sabit genişlikli tam sayılar:** 32 bitlik sayılar taban $2^8 = 256$ ile 4 geçişte sıralanır; her geçiş tek bir sayım/dağıtım taramasıdır. GPU sıralama kütüphaneleri (ör. CUB, Thrust) bu yüzden RadixSort kullanır.
- **Metinler:** sabit uzunlukta anahtarlar (posta kodu, tarih \`YYYYMMDD\`, IP adresi) LSD RadixSort’a çok uygundur; değişken uzunlukta metinler için en anlamlı basamaktan başlayan (MSD) özyinelemeli türü kullanılır.
- **Histogramlar ve notlar:** sınav puanı, yaş, ay gibi küçük aralıklı değerleri sıralamak ya da saymak CountingSort ile tek taramadır.
- **Dizin oluşturma:** sonek dizileri (suffix array) gibi metin dizinleri, karakter sıralarını tekrar tekrar RadixSort ile sıralayarak kurulur.`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: '32 bitlik işaretsiz tam sayılar taban $256$ ($8$ bit) ile LSD RadixSort’ta sıralanıyor. Kaç geçiş gerekir?',
              answer: 4,
              hint: 'Her geçiş 8 bit işler.',
              explanation: '$32 / 8 = 4$ geçiş, her biri $O(n + 256)$: toplam $O(n)$.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: bağlı listesiz CountingSort',
          label: 'formal',
          body: `Notlardaki sürüm her anahtar için bir kova (bağlı liste) tutar. Pratikte aynı işi iki dizi yapar: sayaçlar ve önek toplamları. Kendi örneğimiz: $A = [3, 1, 4, 1, 5, 2, 3]$, anahtarlar $\\{0, \\dots, 5\\}$.`,
          proof: [
            { title: 'Say', body: '$C[k]$ = $k$ anahtarlı eleman sayısı: $C = [0, 2, 1, 2, 1, 1]$ (0’dan 5’e).' },
            { title: 'Önek toplamı', body: '$C[k]$’yı “$k$’den küçük anahtar sayısı”na çevir: $[0, 0, 2, 3, 5, 6]$. Bu, $k$ anahtarlı ilk elemanın çıktıdaki indeksidir (0 tabanlı).' },
            { title: 'Yerleştir', body: '$A$’yı **soldan sağa** dolaş; $x$’i $C[x]$ indeksine yaz ve $C[x]$’i bir artır. 3 → 3, 1 → 0, 4 → 5, 1 → 1, 5 → 6, 2 → 2, 3 → 4. Çıktı $[1, 1, 2, 3, 3, 4, 5]$.' },
            { title: 'Kararlılık', body: 'Eşit anahtarlar girdideki sıralarıyla yerleşir (ilk 3 indeks 3’e, ikinci 3 indeks 4’e): sıralama kararlıdır, RadixSort’un istediği tam da bu. Süre $O(n + r)$, ek bellek $O(n + r)$.' },
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: 'Bu örnekte 4 anahtarı çıktıda hangi indekse (0 tabanlı) yazılır?',
              answer: 5,
              hint: '4’ten küçük kaç anahtar var?',
              explanation: '4’ten küçük anahtarlar 1, 1, 2, 3, 3: beş tane, yani indeks 5.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: $n = 10^6$ tam sayı, hepsi $[0, 10^{12})$ aralığında. Taban 10 ile RadixSort kaç geçiş yapar? Taban $r = n = 10^6$ ile kaç geçiş? Her birinin toplam işi nedir?`,
          hints: ['Geçiş sayısı = $r$ tabanında basamak sayısı = $\\lceil \\log_r 10^{12} \\rceil$.', 'Her geçiş $O(n + r)$.'],
          solution: `Taban 10: 12 basamak, 12 geçiş, her biri $O(10^6 + 10)$: yaklaşık $1{,}2 \\cdot 10^7$ adım. Taban $10^6$: $10^{12} = (10^6)^2$, yani 2 basamak, 2 geçiş, her biri $O(10^6 + 10^6)$: yaklaşık $4 \\cdot 10^6$ adım. Taban $r = n$ seçmek, değerler $n^c$’ye kadarsa $c$ geçiş ve $O(cn)$ süre verir. Karşılaştırmalı sıralama $n \\log_2 n \\approx 2 \\cdot 10^7$ karşılaştırma yapardı.`,
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
      minutes: 30,
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
          tasks: [
            'Her senaryoyu seç ve önerilen algoritmanın “garanti türü” sütununu oku. Hangi senaryolarda model değişiyor?',
            'Ölçüm panelini aç ve $n$’yi 512’ye çıkar: InsertionSort ile MergeSort arasındaki fark kaç kat?',
          ],
          viz: 'sortComparison',
          body: `Bir senaryo seçin; uygun algoritmalar ve gerekçe vurgulanır. Tablodaki “garanti türü” sütununa özellikle dikkat edin.`,
        },
        {
          kind: 'text',
          title: 'Üç farklı garanti türü',
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Bir fren kontrol yazılımı gibi gerçek zamanlı bir sistemde her sıralama belirli bir süreyi **kesinlikle** aşmamalı. Hangisi en uygundur?',
              options: ['Rastgele QuickSort', 'MergeSort (ya da HeapSort)', 'Sabit pivotlu QuickSort', 'InsertionSort'],
              answer: 1,
              hint: 'Beklenen süre garantisi tek bir çalışmayı sınırlamaz.',
              explanation: 'Gerçek zamanlı sistemlerde en kötü durum garantisi gerekir: MergeSort ya da HeapSort $O(n\\log n)$’i her girdide ve her çalıştırmada garanti eder.',
            },
          ],
          body: `- **En kötü durum (deterministik):** her girdi için geçerli (MergeSort $O(n\\log n)$, CountingSort $O(n + r)$).
- **Beklenen (rastgele algoritma):** her girdi için, algoritmanın rastgele seçimleri üzerinden beklenti (rastgele QuickSort $O(n\\log n)$). Tek bir çalışma daha kötü olabilir.
- **Girdi dağılımına bağlı (ortalama durum):** girdilerin rastgele geldiği varsayımı altında (ör. sabit pivotlu QuickSort’un rastgele permütasyonlarda iyi çalışması). Rakip bu varsayımı bozabilir.`,
        },
        {
          kind: 'text',
          title: 'Pratikte: dillerin varsayılan sıralamaları',
          body: `- **Python** \`sorted\` / \`list.sort\`: **Timsort** — kararlı, en kötü durumda $O(n\\log n)$, neredeyse sıralı veride çok hızlı.
- **C++** \`std::sort\`: **introsort** (QuickSort + HeapSort + InsertionSort) — kararlı değil, en kötü durumda $O(n\\log n)$. Kararlılık gerekiyorsa \`std::stable_sort\` (birleştirme tabanlı).
- **Java** \`Arrays.sort\`: ilkel türlerde **çift pivotlu QuickSort**, nesnelerde **Timsort**.
- **Veritabanları:** belleğe sığmayan sıralamalarda **dış bellek MergeSort**’u.
- **GPU’lar ve büyük tam sayı dizileri:** **RadixSort**.

Ortak ders: hiçbir algoritma her durumda en iyisi değildir; model (karşılaştırma mı, değer mi), garanti türü, kararlılık ve bellek birlikte değerlendirilir.`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'C++’ta eşit anahtarlı kayıtların mevcut sırası korunarak sıralanması gerekiyor. Hangisi kullanılmalı?',
              options: ['`std::sort`', '`std::stable_sort`', '`std::nth_element`', 'Hiçbiri; elle yazmak gerekir'],
              answer: 1,
              hint: 'Introsort kararlı değildir.',
              explanation: '`std::stable_sort` kararlılığı garanti eder (birleştirme tabanlıdır); `std::sort` etmez.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: bir milyon tam sayıyı sıralamak',
          label: 'formal',
          body: `Kendi örneğimiz: $n = 10^6$ tane 32 bitlik, negatif olmayan tam sayı. Karşılaştırma tablosundaki soruları sırayla soralım ve adayları kaba bir işlem sayısıyla karşılaştıralım.`,
          proof: [
            { title: 'Model', body: 'Anahtarlar sabit uzunlukta tam sayılar; değerlerine doğrudan bakabiliriz. Yani karşılaştırma tabanlı sıralamanın $\\Omega(n\\log n)$ alt sınırı bizi bağlamaz: RadixSort da bir aday.' },
            { title: 'Karşılaştırma tabanlı', body: 'MergeSort ya da rastgele QuickSort yaklaşık $n\\log_2 n \\approx 10^6 \\cdot 20 = 2 \\cdot 10^7$ karşılaştırma yapar.' },
            { title: 'RadixSort, taban 256', body: '$r = 2^8$: 32 bit dört bayttır, $d = 4$ geçiş. Her geçiş $O(n + r)$: toplam yaklaşık $4(10^6 + 256) \\approx 4 \\cdot 10^6$ işlem.' },
            { title: 'RadixSort, taban 65536', body: '$r = 2^{16}$: $d = 2$ geçiş, toplam $2(10^6 + 65\\,536) \\approx 2.1 \\cdot 10^6$. Tabanı daha da büyütmek işe yaramaz: $r = 2^{32}$ tek geçiş demektir ama 4 milyardan fazla kova ister ve $O(n + r)$’de $r$ hâkim olur.' },
            { title: 'Sonuç', body: 'İşlem sayısında RadixSort 5–10 kat önde. Ama bunlar adım sayıları, saniye değil: RadixSort her geçişte bütün diziyi kopyalar ve $O(n + r)$ ek bellek ister. Bu yüzden GPU’larda RadixSort, genel amaçlı kütüphanelerde ise karşılaştırma tabanlı sıralama yaygındır. Kararlılık gerekiyorsa ikisi de uygundur: MergeSort da RadixSort da kararlıdır.' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Aynı 32 bitlik anahtarlar için taban $r = 2^{11} = 2048$ seçilirse RadixSort kaç geçiş yapar?',
              answer: 3,
              hint: 'Her geçiş 11 bit işler.',
              explanation: '$\\lceil 32/11 \\rceil = 3$ geçiş (11 + 11 + 10 bit). Toplam yaklaşık $3(10^6 + 2048) \\approx 3 \\cdot 10^6$ işlem.',
            },
          ],
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
        {
          id: 'q3',
          kind: 'numeric',
          prompt: '64 bitlik negatif olmayan tam sayıları taban $r = 2^{16}$ ile RadixSort kaç geçişte sıralar?',
          answer: 4,
          hint: 'Her geçiş bir “basamak”, yani 16 bit işler.',
          explanation: '$64 / 16 = 4$ geçiş, her biri $O(n + 2^{16})$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: 10 milyon ürün kaydını, 0–999 arasındaki kategori koduna göre, **aynı kategorideki kayıtların mevcut sırası bozulmadan** sıralamanız gerekiyor. Hangi algoritmayı seçerdiniz? Neden?`,
          hints: ['“Mevcut sıra bozulmadan” hangi özelliği istiyor?', '$r = 1000 \\ll n$.'],
          solution: `CountingSort ($r = 1000$ kova): $O(n + r) = O(n)$ ve kararlı — aynı kategorideki kayıtlar girdi sırasını korur. MergeSort da kararlıdır ama $O(n\\log n)$; QuickSort kararlı değildir.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: bir sunucu günlüğü zaman damgasına göre **neredeyse** sıralı geliyor: ağ gecikmeleri yüzünden her kayıt, sıralı konumundan en fazla $k = 3$ yer uzakta. $n = 10^6$ kayıt için hangi algoritmayı seçerdiniz ve neden?`,
          hints: ['InsertionSort’un süresi $O(n + I)$, $I$ ters çift sayısı.', 'Bir eleman kaç elemanla ters çift oluşturabilir?'],
          solution: `Her eleman en fazla $k$ yer kaydığından yalnızca kendisine $2k$ uzaklıktaki elemanlarla ters çift oluşturabilir: $I \\le 2kn = 6 \\cdot 10^6$. InsertionSort $O(n + I) = O(kn)$, yani birkaç milyon adımda biter; MergeSort ya da HeapSort girdinin bu yapısından yararlanmaz ve $n \\log_2 n \\approx 2 \\cdot 10^7$ karşılaştırma yapar. Timsort da bu durumu fark edip doğrusal zamana yakın çalışır. Zaman damgaları büyük tam sayılar olduğu için RadixSort mümkün ama gereksiz: girdi zaten neredeyse sıralı.`,
        },
      ],
      sources: [SRC.l6.slides, SRC.l5.slides, SRC.l2.notes],
    },
  ],
}
