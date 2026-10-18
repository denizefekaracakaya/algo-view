import type { Lecture } from './types'
import { SRC } from './sources'
import { QUICKSORT_CODE } from '../engines/quickSort'

export const lecture5: Lecture = {
  n: 5,
  title: 'Rastgele algoritmalar ve QuickSort',
  titleEn: 'Randomized Algorithms and QuickSort',
  date: '21 Ocak 2026',
  blurb: 'Rastgele pivot, en kötü durum ile beklenen süre arasındaki fark ve göstergeç değişkenleriyle 2n ln n sınırı.',
  lessons: [
    {
      id: 'l5-quicksort',
      lecture: 5,
      title: 'QuickSort ve pivot seçimi',
      titleEn: 'QuickSort and pivot selection',
      summary: 'Bölümle, pivotu yerine koy, iki tarafa özyinele.',
      minutes: 30,
      objectives: [
        'QuickSort’un bölümleme (partition) adımını ve yerinde (in-place) gerçekleştirimi izlemek.',
        'Pivot seçiminin çalışma süresini nasıl belirlediğini görmek: $T(n) \\le cn + T(k-1) + T(n-k)$.',
        'Deterministik pivotun en kötü durumda $\\Theta(n^2)$, medyan pivotun $O(n\\log n)$ verdiğini açıklamak.',
        'Rastgele algoritmaların tohumla (seed) tekrarlanabilir şekilde çalıştırılabileceğini görmek.',
      ],
      prerequisites: ['Select dersi', 'MergeSort', 'Master Teoremi'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi',
          label: 'intuition',
          body: `QuickSort, Select’e çok benzer: bir pivot $x$ seç, diziyi $[A_<,\\ x,\\ A_>]$ olarak düzenle. Fark: Select yalnızca bir tarafa özyinelerken QuickSort **iki** tarafı da sıralar. Bölümlemeden sonra pivot **son konumundadır** ve bir daha hareket etmez.

Notlar elemanların farklı olduğunu varsayar (genelliği bozmadan). Buradaki yerinde sürümde pivota eşit elemanlar sağ tarafa gider; tekrarlı anahtarlarla da doğru sıralar.`,
        },
        {
          kind: 'viz',
          title: 'QuickSort görselleştiricisi',
          viz: 'quickSort',
          body: `Pivot kuralını ve (rastgele kural için) tohumu seçin. Aynı tohum aynı çalışmayı birebir tekrarlar; “Yeni tohum” ile farklı pivot seçimlerini karşılaştırın. Alttaki ağaçta her düğüm bir çağrının pivotudur — dengesiz ağaç = derin özyineleme = çok karşılaştırma. “Sıralı” örnekte “Son eleman” kuralını deneyin.`,
        },
        {
          kind: 'pseudocode',
          title: 'Sözde kod (yerinde bölümleme)',
          code: QUICKSORT_CODE,
          body: `Ders 5 slaytlarındaki “daha iyi bölümleme” fikri: pivotu rastgele seç, alt dizinin sonuna taşı, sonra soldan sağa tarayarak küçükleri öne topla. Notlar yerinde sürümün ayrıntısını CLRS’ye bırakır; buradaki sürüm Lomuto bölümlemesidir.`,
        },
        {
          kind: 'correctness',
          title: 'Doğruluk',
          label: 'proofIdea',
          proof: [
            { title: 'Bölümleme değişmezi', body: 'Döngünün her adımında $A[lo..i-1] <$ pivot $\\le A[i..j-1]$. Başta iki bölge de boş; her adım bir elemanı doğru bölgeye ekler.' },
            { title: 'Pivot yerinde', body: 'Döngü bitince pivotu $A[i]$ ile takas ederiz: solundakilerin hepsi küçük, sağındakilerin hepsi büyük ya da eşit. Pivot, sıralı dizideki konumundadır.' },
            { title: 'Güçlü tümevarım', body: 'İki parça daha kısadır; hipotezle özyinelemeli çağrılar onları sıralar. Sol parça < pivot ≤ sağ parça olduğundan birleşim sıralıdır. Taban: uzunluk ≤ 1.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Pivot seçimi ve çalışma süresi',
          body: `Pivot $k$. en küçük eleman ise: $T(n) \\le cn + T(k-1) + T(n-k)$.

- **En kötü pivot (min/maks):** $T(n) = T(n-1) + O(n) = \\Theta(n^2)$. Sıralı girdide “ilk/son eleman” kuralı her seferinde bunu yapar.
- **Medyan pivot (Select ile):** $T(n) \\le cn + 2T(n/2) = O(n\\log n)$ — **deterministik en kötü durum**, ama Select’in sabitleri büyük olduğu için pratik değil.
- **Rastgele pivot:** en kötü durum yine $\\Theta(n^2)$ (her seferinde en kötü seçim), ama **her girdi için beklenen** süre $O(n\\log n)$ — bir sonraki dersin konusu.

Slaytlardaki karşılaştırma: QuickSort (rastgele pivot) yerinde kolayca uygulanır ve kararlı değildir; MergeSort en kötü durumda $O(n\\log n)$ ve kararlıdır.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- “Rastgele QuickSort her zaman $O(n\\log n)$.” — Hayır: garanti **beklenen** süre içindir; tek bir çalışma kötü olabilir.
- “Beklenen süre rastgele girdiler üzerinden ortalamadır.” — Hayır: girdi en kötü durum olarak seçilir; ortalama yalnızca algoritmanın kendi rastgele seçimleri üzerindendir.
- Pivotu bölümlemeden sonra özyinelemeli çağrılara dahil etmek (sonsuz döngüye ya da gereksiz işe yol açar).
- Çok sayıda eşit anahtarı unutmak: bu sürümde hepsi aynı olan bir dizi her seferinde dengesiz bölünür (bkz. Ödev 3’teki tekrarlı anahtar sorusu — burada çözümünü vermiyoruz).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '$[8, 7, 1, 3, 5, 6, 4]$ üzerinde pivot 4 ile bölümleme yapıldıktan sonra pivotun indeksi (0 tabanlı) kaçtır?',
          options: ['2', '3', '4', '6'],
          answer: 0,
          hint: '4’ten küçük kaç eleman var?',
          explanation: '4’ten küçük yalnızca iki eleman var (1 ve 3). Bölümlemeden sonra bunlar indeks 0 ve 1’i kaplar, pivot indeks 2’ye yerleşir — hangi bölümleme yöntemi kullanılırsa kullanılsın, pivotun son konumu ondan küçük eleman sayısına eşittir.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Deterministik “son eleman” pivotuyla QuickSort, zaten sıralı $n$ elemanlı bir dizide kaç karşılaştırma yapar?',
          options: ['$n - 1$', '$n\\log_2 n$', '$n(n-1)/2$', '$2n\\ln n$'],
          answer: 2,
          hint: 'Her çağrıda pivot alt dizinin en büyüğüdür.',
          explanation: 'Her seviyede bölümleme $m - 1$ karşılaştırma yapar ve sağ parça boştur: $(n-1) + (n-2) + \\dots + 1 = n(n-1)/2$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Rastgele pivotlu QuickSort için “beklenen çalışma süresi $O(n\\log n)$” ifadesindeki beklenti neyin üzerindendir?',
          options: [
            'Tüm olası girdiler üzerinden (girdi rastgeledir).',
            'Sabit (en kötü durum) bir girdi için algoritmanın rastgele pivot seçimleri üzerinden.',
            'Farklı bilgisayarlardaki ölçümler üzerinden.',
            'Hem girdi hem pivotlar üzerinden; ikisi de gerekir.',
          ],
          answer: 1,
          hint: 'Notlar: “We still consider the running time for a worst-case input…”',
          explanation: 'Garanti her girdi için geçerlidir; rastgelelik yalnızca algoritmanın kendi yazı-turalarından gelir.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Pivot her zaman alt dizinin “%10’luk diliminden” (yani $k \\approx n/10$) seçilseydi çalışma süresi ne olurdu? Bağıntıyı yazın ve özyineleme ağacıyla tahmin edin.`,
          hints: ['$T(n) \\le cn + T(n/10) + T(9n/10)$.', 'Her seviyenin toplam işi en fazla $cn$; en uzun dal kaç seviye?'],
          solution: `Her seviyede toplam iş en fazla $cn$’dir (parçaların boyutları toplamı $\\le n$). En derin dal boyutu her seferinde $9/10$ ile çarpar: $\\log_{10/9} n = O(\\log n)$ seviye. Toplam $O(n\\log n)$. Sabit oranlı herhangi bir bölünme — ne kadar dengesiz olursa olsun — $O(n\\log n)$ verir; sorun yalnızca $k = O(1)$ gibi “sabit kayıklık”tadır.`,
        },
      ],
      sources: [SRC.l5.pre, SRC.l5.notes, SRC.l5.slides, SRC.l5.notebook, SRC.hw.hw3],
    },
    {
      id: 'l5-expected',
      lecture: 5,
      title: 'Beklenen çalışma süresi: göstergeç değişkenleri',
      titleEn: 'Expected running time via indicator variables',
      summary: 'Her çift kaç kez karşılaştırılır? Beklentinin doğrusallığı ile $E[C] \\le 2n\\ln n$.',
      minutes: 35,
      objectives: [
        'Rastgele değişken, beklenti ve göstergeç (indicator) değişkeni kavramlarını QuickSort’a uygulamak.',
        'Her $(z_i, z_j)$ çiftinin en fazla bir kez karşılaştırıldığını açıklamak.',
        '$P[z_i, z_j\\ \\text{karşılaştırılır}] = \\frac{2}{j-i+1}$ sonucunu türetmek.',
        'Beklentinin doğrusallığı ile $E[C] \\le 2n\\ln n$ sınırına ulaşmak.',
        'Bir deneyin (ölçümün) beklenen süre teoremini kanıtlamadığını ayırt etmek.',
      ],
      prerequisites: ['QuickSort dersi', 'Temel olasılık: beklenti', 'Harmonik seri $\\sum 1/k \\approx \\ln n$'],
      sections: [
        {
          kind: 'formal',
          title: 'Kurulum (Ders 5 notları)',
          box: 'formal',
          label: 'formal',
          body: `$z_1 < z_2 < \\dots < z_n$ sıralı dizinin elemanları olsun. $X_{i,j}$: $z_i$ ile $z_j$’nin karşılaştırılma sayısı. Her karşılaştırma pivotla yapılır ve pivot sonraki çağrılara dahil edilmez; bu yüzden $X_{i,j} \\in \\{0, 1\\}$ — bir **göstergeç değişkeni**.

$$C = \\sum_{i<j} X_{i,j}, \\qquad E[C] = \\sum_{i<j} E[X_{i,j}] = \\sum_{i<j} P[z_i, z_j \\text{ karşılaştırılır}].$$

İkinci eşitlik **beklentinin doğrusallığıdır**: $X_{i,j}$’ler bağımsız olmasa bile geçerlidir. $C$’nin dağılımını hesaplamak çok zor; beklentisini hesaplamak kolay.`,
        },
        {
          kind: 'viz',
          title: 'Etkileşim: hangi çiftler ne sıklıkla karşılaştırılır?',
          viz: 'pairProbability',
        },
        {
          kind: 'correctness',
          title: 'Türetme',
          label: 'formalProof',
          proof: [
            { title: 'Pencere fikri', body: '$\\{z_i, \\dots, z_j\\}$ penceresine bakın. Bu penceredeki bir eleman pivot seçilene kadar, hepsi aynı alt dizide kalır.' },
            { title: 'İlk pivot karar verir', body: 'Pencereden ilk seçilen pivot $z_i$ ya da $z_j$ ise ikisi karşılaştırılır. Aradaki bir $z_k$ ise ($i<k<j$) $z_i$ ile $z_j$ farklı taraflara ayrılır ve asla karşılaştırılmaz.' },
            { title: 'Olasılık', body: 'Pencerede $j - i + 1$ eleman var ve ilk seçilen her biri eşit olasılıklı: $P = \\frac{1}{j-i+1} + \\frac{1}{j-i+1} = \\frac{2}{j-i+1}$.' },
            { title: 'Toplam', body: '$E[C] = \\sum_{i=1}^{n}\\sum_{j=i+1}^{n}\\frac{2}{j-i+1} \\le \\sum_{i=1}^{n} 2\\left(\\frac12 + \\frac13 + \\dots + \\frac1n\\right) \\le 2n\\ln n$.' },
            { title: 'Çalışma süresi', body: 'Boyutu $k$ olan her çağrı $k-1$ karşılaştırma ve $O(k)$ iş yapar; tek elemanlı çağrılar en fazla $n$ tane. Toplam süre $O(C + n)$, beklenen süre $O(n\\log n)$ — **her girdi için**.' },
          ],
        },
        {
          kind: 'viz',
          title: 'Deney: farklı tohumlarla karşılaştırma sayısı',
          viz: 'quickExperiment',
        },
        {
          kind: 'text',
          title: 'Alternatif kanıt (özet)',
          body: `Notlar ikinci bir yol da gösterir: $T(n)$ beklenen karşılaştırma sayısı ise
$$T(n) = n - 1 + \\frac{2}{n}\\sum_{i=1}^{n-1} T(i)$$
ve güçlü tümevarımla $T(n) \\le 2n\\ln n$ kanıtlanır (toplamı $\\int 2x\\ln x\\,dx$ ile üstten sınırlayarak).`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- $E[C]$’yi “$C$’nin en olası değeri” sanmak.
- Doğrusallığın bağımsızlık gerektirdiğini düşünmek — gerektirmez.
- $P[z_i, z_j\\ \\text{karşılaştırılır}]$’ı orijinal dizideki **konumlara** göre düşünmek; önemli olan **sıralı** sıradaki uzaklıktır ($j - i$).
- Histogramdaki ortalama teorik değere yakın diye teoremi “kanıtlanmış” saymak.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'numeric',
          prompt: '$n = 10$ için $z_3$ ile $z_7$’nin karşılaştırılma olasılığı nedir? (Ondalık, ör. 0.4)',
          answer: 0.4,
          tolerance: 0.001,
          hint: '$\\frac{2}{j - i + 1}$.',
          explanation: '$\\frac{2}{7 - 3 + 1} = \\frac{2}{5} = 0.4$. Sonuç $n$’ye bağlı değildir.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Komşu sıradaki iki eleman ($z_i$ ve $z_{i+1}$) için karşılaştırılma olasılığı nedir?',
          options: ['$1/2$', '$1$', '$2/n$', '$1/n$'],
          answer: 1,
          hint: 'Pencerede yalnızca iki eleman var.',
          explanation: '$\\frac{2}{2} = 1$: aralarında onları ayırabilecek bir eleman olmadığından mutlaka karşılaştırılırlar (aksi hâlde algoritma sıralarını bilemezdi).',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Neden $X_{i,j} \\in \\{0, 1\\}$, yani bir çift en fazla bir kez karşılaştırılır?',
          options: [
            'Çünkü QuickSort her elemana yalnızca bir kez bakar.',
            'Çünkü karşılaştırmalar hep pivotla yapılır ve pivot sonraki özyinelemeli çağrılara dahil edilmez.',
            'Çünkü elemanlar farklıdır.',
            'Çünkü rastgele pivot seçilir.',
          ],
          answer: 1,
          hint: 'İlk karşılaştırma anında ikisinden biri pivottur.',
          explanation: 'İlk karşılaşmada biri pivottur; pivot alt dizilere girmez, dolayısıyla ikisi bir daha karşılaşamaz.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Bir öğrenci 1000 tohumla QuickSort’u çalıştırıp ortalamanın $2n\\ln n$’nin altında olduğunu gözlemliyor. Hangisi doğru bir yorumdur?',
          options: [
            'Beklenen süre teoremi kanıtlanmıştır.',
            'Gözlem teoremle tutarlıdır; kanıt ise göstergeç değişkenleri argümanından gelir.',
            'Artık en kötü durum $O(n \\log n)$’dir.',
            'Başka girdilerde de aynı sayılar çıkacaktır.',
          ],
          answer: 1,
          hint: 'Sonlu sayıda deney ile matematiksel garanti arasındaki fark.',
          explanation: 'Deney yalnızca o girdi ve o tohumlar içindir. Teorem her girdi için geçerli bir beklenti ifadesidir ve kanıt gerektirir.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: $n = 4$ için $E[C] = \\sum_{i<j} \\frac{2}{j-i+1}$’i tam olarak hesaplayın ve deney panelinde $n = 4$ ile karşılaştırın.`,
          hints: ['Uzaklık 1 olan 3 çift, uzaklık 2 olan 2 çift, uzaklık 3 olan 1 çift var.'],
          solution: `$3\\cdot\\frac22 + 2\\cdot\\frac23 + 1\\cdot\\frac24 = 3 + \\frac43 + \\frac12 = \\frac{29}{6} \\approx 4.83$. Formül $2(n+1)H_n - 4n$ ile: $H_4 = \\frac{25}{12}$, $2\\cdot5\\cdot\\frac{25}{12} - 16 = \\frac{125}{6} - 16 = \\frac{29}{6}$ ✓.`,
        },
      ],
      sources: [SRC.l5.notes, SRC.l5.slides, SRC.l5.concept, SRC.sec.s3, SRC.hw.hw3],
    },
  ],
}
