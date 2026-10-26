import type { Lecture } from './types'
import { SRC } from './sources'
import { BELLMAN_FORD_CODE, FLOYD_CODE } from '../engines/shortestPaths'

export const lecture12: Lecture = {
  n: 12,
  title: 'Dinamik programlama: Bellman–Ford ve Floyd–Warshall',
  titleEn: 'Dynamic Programming: Bellman-Ford and Floyd-Warshall',
  date: '18 Şubat 2026',
  blurb: 'Küçük alt problemlerin cevaplarını bir tabloda saklamak: negatif kenarlı en kısa yollar ve tüm çiftler arası en kısa yollar.',
  lessons: [
    {
      id: 'l12-bellman-ford',
      lecture: 12,
      title: 'Bellman–Ford ve dinamik programlama fikri',
      titleEn: 'Bellman–Ford and the idea of dynamic programming',
      summary: '$d^{(k)}[v]$: en fazla $k$ kenarlı en kısa yol. Tabloyu satır satır doldurmak.',
      minutes: 45,
      objectives: [
        '$d^{(k)}[v]$’nin anlamını ve $d^{(k)}[v] = \\min_u (d^{(k-1)}[u] + w(u, v))$ bağıntısını açıklamak.',
        'Bellman–Ford’un neden $n - 1$ tur yaptığını ve negatif döngüyü nasıl tespit ettiğini göstermek.',
        'Dinamik programlamanın iki koşulunu (optimal alt yapı, örtüşen alt problemler) tanımak.',
        'Aşağıdan yukarı ve yukarıdan aşağı (memoization) uygulamaları ayırt etmek.',
      ],
      prerequisites: ['Dijkstra (Ders 11)', 'Tümevarım'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: kenar bütçesini birer birer artırmak',
          label: 'intuition',
          body: `Dijkstra negatif kenarlarda yanılıyordu çünkü bir düğümü “artık daha kısası yok” diye erken kesinleştiriyordu. Bellman–Ford hiçbir şeyi erken kesinleştirmez; bunun yerine sorulan soruyu küçültür:

> En fazla $k$ kenar kullanarak $s$’den $v$’ye en ucuz nasıl gidilir?

$k = 0$ için cevap açık: yalnızca $s$’ye (maliyet 0). $k$ kenarlık en iyi yol, son kenarı $(u, v)$ olan **en fazla $k - 1$ kenarlık en iyi yol + bir kenar** biçimindedir. Böylece her satır bir öncekinden hesaplanır. Negatif döngü yoksa en kısa yollar basittir (tekrar eden düğüm yoktur) ve en fazla $n - 1$ kenar içerir: $n - 1$ satır yeter.`,
        },
        {
          kind: 'pseudocode',
          title: 'Bellman–Ford (Ders 12 notları, Algoritma 1)',
          code: BELLMAN_FORD_CODE,
          body: `$d^{(k)}[v]$: $s$’den $v$’ye **en fazla $k$ kenarlı** en kısa yolun maliyeti. Her satırı yalnızca bir önceki satır belirlediği için bellekte iki satır tutmak yeterlidir. Son döngü bir tur daha dener: hâlâ iyileşen bir kenar varsa ulaşılabilir bir negatif döngü vardır.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Görselleştiricinin “Negatif olmayan ağırlıklar” grafiğinde $d^{(1)}[a]$ kaçtır? (Doğrudan $s \\to a$ kenarının ağırlığı 4, $s \\to b \\to a$ ise $1 + 2$.)',
              answer: 4,
              hint: '$k = 1$: yalnızca tek kenarlı yollar.',
              explanation: 'Tek kenarla $a$’ya yalnızca $s \\to a$ (4) ile gidilir. $d^{(2)}[a] = 3$ olur, çünkü iki kenarlı $s \\to b \\to a$ yolu artık sayılır.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Bellman–Ford görselleştiricisi',
          viz: 'bellmanFord',
          tasks: [
            '“Negatif olmayan ağırlıklar” grafiğinde tabloyu satır satır doldurun. Hangi turdan sonra hiçbir değer değişmiyor?',
            '“Bir negatif kenar” grafiğinde $t$’nin son değeri Dijkstra’nın bulduğu 3 mü, yoksa 2 mi?',
            '“Negatif döngü” grafiğine geçin: son kontrolde hangi kenar hâlâ iyileşiyor?',
          ],
          body: `Altta $d^{(k)}[v]$ tablosu büyür: satır $k$, en fazla $k$ kenarlı yollarla ulaşılan en iyi değerlerdir. Sarı hücreler o turda iyileşenlerdir. Üstteki grafikte her düğümün o anki değeri ve incelenen kenar gösterilir.`,
        },
        {
          kind: 'correctness',
          title: 'Doğruluk (Ders 11 notları, Claim 3 ve 4)',
          label: 'formalProof',
          proof: [
            { title: 'Hipotez', body: '$d^{(k)}[v]$, $s$’den $v$’ye en fazla $k$ kenarlı yolların en küçük maliyetidir. Taban $k = 0$: $d^{(0)}[s] = 0$, diğerleri $\\infty$.' },
            { title: 'Adım', body: '$P$, en fazla $k$ kenarlı en ucuz $s \\to v$ yolu, $u$ ondan önceki düğüm olsun. $P$’nin $s \\to u$ kısmı en fazla $k - 1$ kenarlıdır ve hipoteze göre maliyeti $\\ge d^{(k-1)}[u]$. Tur $k$’da $d^{(k)}[v] \\le d^{(k-1)}[u] + w(u, v) \\le w(P)$. Algoritma yalnızca gerçek yolların değerlerini yazdığı için eşitsizlik eşitliktir.' },
            { title: 'n − 1 tur yeter', body: 'Negatif döngü yoksa her en kısa yoldaki döngü atılabilir (pozitifse yolu kısaltır, sıfırsa değiştirmez): en kısa yollar basittir, en fazla $n - 1$ kenarlıdır. Demek ki $d^{(n-1)}[v] = d(s, v)$.' },
            { title: 'Negatif döngü tespit edilir', body: 'Ulaşılabilir bir $v_1 \\to \\dots \\to v_k \\to v_1$ negatif döngüsü olsun ve son kontrol hiçbir şey bulmasın: her $i$ için $d[v_{i+1}] \\le d[v_i] + w(v_i, v_{i+1})$. Döngü boyunca toplayınca $d$ terimleri sadeleşir ve $0 \\le \\sum w(v_i, v_{i+1})$ çıkar — döngünün negatif olmasıyla çelişki.' },
          ],
        },
        {
          kind: 'formal',
          title: 'Dinamik programlama tarifi',
          box: 'info',
          label: 'formal',
          body: `Bir problem dinamik programlamaya iki özellik sayesinde uyar:

- **Optimal alt yapı:** optimal çözüm, daha küçük alt problemlerin optimal çözümlerinden kurulur. (Bir en kısa yolun her parçası da en kısa yoldur.)
- **Örtüşen alt problemler:** aynı alt problem defalarca gerekir; cevabı bir **tabloda** saklarsak her biri yalnızca bir kez hesaplanır. (Böl ve fethette ise alt problemler bağımsızdır, her biri bir kez çözülür.)

İki uygulama biçimi eşdeğerdir: **aşağıdan yukarı** (tabloyu küçük alt problemlerden başlayıp bir sırayla doldur) ve **yukarıdan aşağı** (özyinelemeli yaz, her sonucu tabloya kaydet ve tekrar gerekince oradan oku — memoization).

Ad hakkında: “programming” burada bilgisayar programı değil, **plan** demektir; Richard Bellman adı, araştırmayı sevmeyen bir yöneticiden çalışmasını gizlemek için seçtiğini anlatır.`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Bellman–Ford’daki bağıntı doğrudan özyinelemeli bir fonksiyon olarak yazılsa (tablo olmadan) ne olurdu?',
              options: [
                'Aynı $d^{(k-1)}[u]$ değeri her kenar için yeniden hesaplanır; süre üstel olabilir.',
                'Sonuç yanlış çıkar.',
                'Daha hızlı çalışır.',
                'Negatif kenarlarla çalışmaz.',
              ],
              answer: 0,
              hint: 'Örtüşen alt problemler.',
              explanation: 'Her $d^{(k)}[v]$, birçok $d^{(k-1)}[u]$’ya, onlar da tekrar aynı alt problemlere başvurur. Tablo, her alt problemi bir kez çözmeyi sağlar: toplam $O(nm)$.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Çalışma süresi ve bellek',
          body: `$n - 1$ tur, her turda $m$ kenar: **$O(nm)$**. Son kontrol $O(m)$. Dijkstra’dan yavaştır ama negatif kenarlarla çalışır, negatif döngüyü bulur ve uygulaması çok basittir.

Bellek: tablo $n \\times n$ olsa da yalnızca son iki satır gerekir: $O(n)$. Bir tur hiçbir değeri değiştirmediyse algoritma erken durabilir.`,
        },
        {
          kind: 'text',
          title: 'Pratikte: Bellman–Ford nerede?',
          body: `- **Mesafe vektörü yönlendirme (RIP):** her yönlendirici yalnızca komşularından gelen uzaklık tablolarıyla kendi tablosunu günceller — dağıtık bir Bellman–Ford. Merkezi bir harita gerekmez; bir kenar ağırlığı değişince yerel güncellemeler yayılır.
- **Arbitraj tespiti:** kurlar $r$ ise $-\\log r$ ağırlıklarıyla bir negatif döngü, başladığınızdan fazla parayla dönebileceğiniz bir döviz döngüsüdür.
- **Kısıt sistemleri:** $x_j - x_i \\le c$ biçimindeki eşitsizlik sistemlerinin çözülebilirliği, bir grafikte negatif döngü olmamasına denktir.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- $n - 1$ yerine $n$ ya da $m$ tur yapmak gerektiğini sanmak: basit bir yol en fazla $n - 1$ kenarlıdır.
- Negatif döngü ile negatif kenarı karıştırmak: negatif kenarlar sorun değildir, ulaşılabilir negatif döngüler en kısa yolu tanımsız yapar.
- $s$’den ulaşılamayan bir negatif döngünün tespit edileceğini sanmak: o düğümlerin değerleri $\\infty$ kalır, kontrol onları yakalamaz (ve sonuçları etkilemez).
- Dinamik programlamayı yalnızca “özyineleme + tablo” sanmak: önce alt problemi ve bağıntıyı doğru tanımlamak gerekir.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Bellman–Ford’un çalışma süresi nedir?',
          options: ['$O(n + m)$', '$O(m \\log n)$', '$O(nm)$', '$O(n^3)$'],
          answer: 2,
          hint: 'Kaç tur, her turda kaç kenar?',
          explanation: '$n - 1$ tur × $m$ kenar = $O(nm)$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Son kontrol turunda bir $(u, v)$ kenarı için hâlâ $d[v] > d[u] + w(u, v)$ çıktı. Sonuç nedir?',
          options: ['Bir tur daha yapmak gerekir.', '$s$’den ulaşılabilen bir negatif döngü vardır.', '$v$, $s$’den ulaşılamaz.', 'Grafik yönsüzdür.'],
          answer: 1,
          hint: 'Claim 3.',
          explanation: 'Negatif döngü yoksa $n - 1$ turdan sonra tüm değerler doğrudur ve hiçbir kenar iyileşemez. İyileşme varsa bir negatif döngü vardır.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Dinamik programlamayı böl ve fethetten ayıran özellik hangisidir?',
          options: ['Özyineleme kullanması', 'Alt problemlerin örtüşmesi ve her birinin bir kez çözülüp saklanması', 'Rastgelelik kullanması', 'Her zaman $O(n^2)$ sürmesi'],
          answer: 1,
          hint: 'MergeSort’un alt problemleri hiç tekrar eder mi?',
          explanation: 'Böl ve fethet bağımsız alt problemleri birer kez çözer; DP’de aynı alt problemler tekrar tekrar gerekir ve tablo bu tekrarı ortadan kaldırır.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: '5 düğümlü bir grafikte negatif döngü yoksa Bellman–Ford’un ana döngüsü en fazla kaç tur yapar?',
          answer: 4,
          hint: 'Basit bir yolda en fazla kaç kenar olur?',
          explanation: '$n - 1 = 4$. Daha uzun her yol bir düğümü tekrar eder ve negatif döngü yoksa kısalmaz.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: düğümler $s, a, b, c$ ve kenarlar s→a (4), s→b (3), a→b (−2), b→c (2), a→c (5). Kenarları bu sırayla işleyerek $d^{(0)}, d^{(1)}, d^{(2)}, d^{(3)}$ satırlarını yazın. Dijkstra bu grafikte $b$ ve $c$ için ne bulurdu?`,
          hints: ['$d^{(1)}$: yalnızca $s$’den çıkan kenarlar.', '$d^{(2)}[b] = \\min(3, d^{(1)}[a] - 2)$.'],
          solution: `$d^{(0)} = (s{:}\\,0, a{:}\\,\\infty, b{:}\\,\\infty, c{:}\\,\\infty)$. $d^{(1)} = (0, 4, 3, \\infty)$. $d^{(2)}$: $b = \\min(3, 4 - 2) = 2$, $c = \\min(\\infty, 3 + 2, 4 + 5) = 5$ → $(0, 4, 2, 5)$. $d^{(3)}$: $c = \\min(5, 2 + 2) = 4$ → $(0, 4, 2, 4)$. Son kontrolde iyileşme yok: negatif döngü yok. Dijkstra önce $b$’yi 3 ile kesinleştirir ve $c = 5$ yapar; ardından $a$ işlenince $b$’nin değeri 2’ye iner, ama $b$ zaten bittiği için $c$ yeniden gevşetilmez: $c = 5$ kalır (doğrusu 4).`,
        },
      ],
      sources: [SRC.l12.notes, SRC.l12.slides, SRC.l12.pre, SRC.l11.notes, SRC.l12.notebook, SRC.l12.concept],
    },
    {
      id: 'l12-floyd',
      lecture: 12,
      title: 'Floyd–Warshall: tüm çiftler arası en kısa yollar',
      titleEn: 'Floyd–Warshall: all-pairs shortest paths',
      summary: '$d_k(u, v)$: ara düğümleri $\\{1, \\dots, k\\}$ ile sınırlı en kısa yol. $O(n^3)$, üç iç içe döngü.',
      minutes: 35,
      objectives: [
        'Tüm çiftler arası en kısa yol (APSP) problemini ifade etmek.',
        '$d_k(u, v) = \\min(d_{k-1}(u, v),\\ d_{k-1}(u, k) + d_{k-1}(k, v))$ bağıntısının iki durumunu açıklamak.',
        'Köşegendeki negatif değerlerle negatif döngüyü tespit etmek.',
        'Floyd–Warshall’ı $n$ kez Dijkstra çalıştırmakla karşılaştırmak.',
      ],
      prerequisites: ['Bellman–Ford ve dinamik programlama'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: ara durakları tek tek açmak',
          label: 'intuition',
          body: `Şimdi **her** düğüm çifti arasındaki en kısa yolu istiyoruz. Düğümleri $1, \\dots, n$ diye numaralayalım ve şu kısıtlı soruyu soralım:

> Yalnızca $\\{1, \\dots, k\\}$ düğümlerini **ara durak** olarak kullanarak $u$’dan $v$’ye en ucuz nasıl gidilir?

$k = 0$’da hiç ara durak yok: yalnızca doğrudan kenarlar. Her adımda bir düğümü daha “ara durak olarak serbest” bırakırız. $k$’nın açılması iki şey getirebilir: en iyi yol $k$’dan geçmez (eski değer kalır) ya da geçer — o zaman yol, $u \\to k$ ve $k \\to v$ parçalarına ayrılır ve iki parçanın da ara durakları $\\{1, \\dots, k - 1\\}$ içindedir.`,
        },
        {
          kind: 'pseudocode',
          title: 'Floyd–Warshall (notlar, Algoritma 2)',
          code: FLOYD_CODE,
          body: `$k$’ıncı turda $d_k(u, v)$, ara düğümleri $\\{1, \\dots, k\\}$ olan en kısa $u \\to v$ yolunun ağırlığıdır. **Durum 1:** yol $k$’dan geçer → $d_{k-1}(u, k) + d_{k-1}(k, v)$. **Durum 2:** geçmez → $d_{k-1}(u, v)$. Negatif döngü yoksa en kısa yollar basit olduğundan $k$ yolda en fazla bir kez görünür.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Görselleştiricideki grafikte (1→2: 3, 2→3: 2, 3→4: 1, 4→1: 5, 1→3: 8, 4→2: −1) Floyd–Warshall bittiğinde $d(1, 3)$ kaçtır?',
              answer: 5,
              hint: 'Doğrudan kenar 8; 2 üzerinden?',
              explanation: '$1 \\to 2 \\to 3 = 3 + 2 = 5 < 8$. Bu değer $k = 2$ turunda bulunur.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Floyd–Warshall görselleştiricisi',
          viz: 'floyd',
          tasks: [
            'Her turda (mor $k$) hangi hücrelerin iyileştiğini izleyin. Neden yalnızca $k$ satırı ve sütunu kullanılıyor?',
            '$d(3, 2)$ hangi turda ve neden 0’a iniyor?',
            'Son matriste köşegene bakın: negatif döngü var mı?',
          ],
          body: `Altta $d_k$ matrisi, üstte grafik. Mor düğüm o turda ara durak olarak açılan $k$’dır. Mavi hücreler $k$ satırı ve sütunudur: yeni değerler yalnızca bunlardan hesaplanır. Sarı hücre iyileşen değerdir.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Aynı grafikte $d(3, 2)$ kaçtır?',
              answer: 0,
              hint: '$3 \\to 4 \\to 2$.',
              explanation: '$1 + (-1) = 0$. Negatif bir kenar var ama negatif döngü yok: köşegen 0 kalır.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Süre, bellek ve karşılaştırma',
          body: `Tabloda $n \\cdot n \\cdot n$ hücre var ve her biri en fazla iki önceki hücreden $O(1)$’de hesaplanır: **$O(n^3)$**. Her tur yalnızca bir önceki matrisi kullandığından iki matris (hatta yerinde tek matris) yeter: $O(n^2)$ bellek.

**Negatif döngü:** bir $u$ için $d_n(u, u) < 0$ ise $u$’dan geçen negatif bir döngü vardır.

**$n$ kez Dijkstra ile karşılaştırma:** ağırlıklar negatif değilse $n$ kez Dijkstra $O(nm + n^2\\log n)$ sürer; seyrek grafiklerde bu $O(n^3)$’ten iyidir. Floyd–Warshall’ın üstünlükleri: üç satırlık uygulama ve negatif kenarlarla çalışması. (Johnson yöntemi, ağırlıkları yeniden düzenleyerek negatif kenarlarda da $n$ kez Dijkstra kullanmayı sağlar.)

**En uzun basit yol neden DP ile çözülmez?** $s \\to k \\to t$ en uzun yolunun parçaları en uzun yollar olmak zorunda değildir ve iki parça ortak düğüm kullanamaz: alt problemler bağımsız değildir. Problem NP-zordur.`,
        },
        {
          kind: 'text',
          title: 'Pratikte',
          body: `- **Uzaklık tabloları:** bir şehir haritasındaki tüm kavşaklar arası uzaklıklar, oyunlarda yol bulma için önceden hesaplanan tablolar, ağ gecikme matrisleri.
- **Geçişli kapanış (Warshall):** ağırlık yerine “ulaşılabilir mi?” sorulursa aynı üç döngü, $\\min$/$+$ yerine “veya”/“ve” ile çalışır.
- **En dar darboğaz yolu** ya da **en güvenilir yol** gibi problemler de aynı kalıba, farklı işlemlerle uyar.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Döngülerin sırasını karıştırmak: $k$ **en dışta** olmalıdır. $u, v$ dışta olursa $d_{k-1}$ değerleri henüz hazır olmayabilir.
- $d_0(u, u)$’yu $\\infty$ bırakmak: kendine uzaklık 0’dır.
- Floyd–Warshall’ın negatif döngüler varken doğru uzaklıklar verdiğini sanmak: yalnızca döngüyü tespit eder.
- Seyrek ve negatif olmayan büyük grafiklerde de Floyd–Warshall’ı en hızlı seçenek sanmak.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Floyd–Warshall’ın çalışma süresi nedir?',
          options: ['$O(n^2)$', '$O(nm)$', '$O(n^3)$', '$O(n^2 \\log n)$'],
          answer: 2,
          hint: 'Üç iç içe döngü.',
          explanation: '$k$, $u$, $v$ üzerinden üç döngü, her adım $O(1)$: $O(n^3)$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Floyd–Warshall bittiğinde $d(4, 4) = -2$ bulundu. Ne anlama gelir?',
          options: ['4’ten kendine en kısa yol −2’dir; her şey yolunda.', '4’ten geçen bir negatif döngü vardır.', 'Algoritmada hata vardır.', '4 hiçbir düğüme ulaşamaz.'],
          answer: 1,
          hint: 'Kendine uzaklık normalde kaçtır?',
          explanation: '$d(u, u) < 0$ ancak $u$’dan geçen negatif bir döngü varsa olur.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Ağırlıkları negatif olmayan seyrek bir grafikte ($m = O(n)$) tüm çiftler arası en kısa yollar için asimptotik olarak daha hızlı olan hangisidir?',
          options: ['Floyd–Warshall: $O(n^3)$', '$n$ kez Dijkstra: $O(nm + n^2 \\log n) = O(n^2 \\log n)$', 'İkisi aynı', '$n$ kez Bellman–Ford: $O(n^2 m)$'],
          answer: 1,
          hint: '$m = O(n)$ koyun.',
          explanation: '$O(n^2 \\log n) \\ll O(n^3)$. Floyd–Warshall basitliği ve negatif kenar desteği için seçilir.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: '$n = 100$ düğümlü bir grafikte Floyd–Warshall kaç kez $\\min(d(u, v), d(u, k) + d(k, v))$ hesaplar?',
          answer: 1000000,
          hint: '$k$, $u$, $v$ her biri $n$ değer alır.',
          explanation: '$100^3 = 10^6$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: 3 düğüm, kenarlar 1→2 (4), 2→3 (−1), 1→3 (5), 3→1 (2). $d_0, d_1, d_2, d_3$ matrislerini yazın. Negatif döngü var mı?`,
          hints: ['$d_0$: doğrudan kenarlar, köşegen 0.', '$k = 2$’de $d(1, 3) = \\min(5, 4 - 1)$.'],
          solution: `$d_0$: satırlar (0, 4, 5), (∞, 0, −1), (2, ∞, 0). $k = 1$: $d(3, 2) = 2 + 4 = 6$ → (2, 6, 0). $k = 2$: $d(1, 3) = \\min(5, 3) = 3$. $k = 3$: $d(2, 1) = -1 + 2 = 1$; diğerleri değişmez. $d_3$: (0, 4, 3), (1, 0, −1), (2, 6, 0). Köşegen 0: negatif döngü yok (döngü 1→2→3→1’in ağırlığı $4 - 1 + 2 = 5$).`,
        },
      ],
      sources: [SRC.l12.notes, SRC.l12.slides, SRC.l12.notebook, SRC.l12.concept],
    },
  ],
}
