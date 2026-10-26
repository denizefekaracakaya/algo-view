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
      minutes: 45,
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
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Bölümleme bittikten hemen sonra pivot için hangisi **her zaman** doğrudur?',
              options: [
                'Pivot dizinin ortasındadır.',
                'Pivot sıralı dizideki son konumundadır; solundakiler küçük, sağındakiler büyük ya da eşittir.',
                'Sol ve sağ parçalar sıralıdır.',
                'Sol parça sağ parçadan uzundur.',
              ],
              answer: 1,
              hint: 'Pivotun solunda tam olarak kaç eleman var?',
              explanation: 'Pivotun solunda ondan küçük olanların hepsi var; bu yüzden konumu sıralı dizideki konumuyla aynıdır ve bir daha hareket etmez. Parçaların kendileri henüz sıralı değildir.',
            },
          ],
          label: 'intuition',
          body: `QuickSort, Select’e çok benzer: bir pivot $x$ seç, diziyi $[A_<,\\ x,\\ A_>]$ olarak düzenle. Fark: Select yalnızca bir tarafa özyinelerken QuickSort **iki** tarafı da sıralar. Bölümlemeden sonra pivot **son konumundadır** ve bir daha hareket etmez.

Notlar elemanların farklı olduğunu varsayar (genelliği bozmadan). Buradaki yerinde sürümde pivota eşit elemanlar sağ tarafa gider; tekrarlı anahtarlarla da doğru sıralar.`,
        },
        {
          kind: 'viz',
          title: 'QuickSort görselleştiricisi',
          tasks: [
            '“Sıralı” örneği **Son eleman** kuralıyla çalıştır ve sona git: özyineleme ağacı nasıl görünüyor, kaç karşılaştırma yapıldı?',
            'Aynı girdiyi **Rastgele** ile dene ve **Yeni tohum**’a birkaç kez bas. Karşılaştırma sayısı ne kadar değişiyor?',
            '**Medyan (ideal)** kuralında ağacın şekline bak: neden dengeli?',
            '**Tahmin modu**nda her elemanın hangi bölgeye gideceğini tahmin et.',
          ],
          viz: 'quickSort',
          body: `Pivot kuralını ve (rastgele kural için) tohumu seçin. Aynı tohum aynı çalışmayı birebir tekrarlar; “Yeni tohum” ile farklı pivot seçimlerini karşılaştırın. Alttaki ağaçta her düğüm bir çağrının pivotudur — dengesiz ağaç = derin özyineleme = çok karşılaştırma. “Sıralı” örnekte “Son eleman” kuralını deneyin.`,
        },
        {
          kind: 'pseudocode',
          title: 'Sözde kod (yerinde bölümleme)',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Lomuto bölümlemesi 10 elemanlı bir alt dizide (pivot dahil) kaç anahtar karşılaştırması yapar?',
              answer: 9,
              hint: 'Pivot dışındaki her eleman pivotla bir kez karşılaştırılır.',
              explanation: '$m$ elemanlı alt dizide $m - 1$ karşılaştırma: $10 - 1 = 9$.',
            },
          ],
          code: QUICKSORT_CODE,
          body: `Ders 5 slaytlarındaki “daha iyi bölümleme” fikri: pivotu rastgele seç, alt dizinin sonuna taşı, sonra soldan sağa tarayarak küçükleri öne topla. Notlar yerinde sürümün ayrıntısını CLRS’ye bırakır; buradaki sürüm Lomuto bölümlemesidir.`,
        },
        {
          kind: 'correctness',
          title: 'Doğruluk',
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Bölümlemeden sonra pivotu da özyinelemeli çağrılardan birine dahil edersek (ör. `QuickSort(A, lo, i)`) ne olabilir?',
              options: ['Hiçbir şey; yalnızca biraz yavaşlar.', 'Pivot alt dizinin en büyüğüyse aynı boyutta bir çağrı tekrar tekrar yapılabilir: sonsuz özyineleme.', 'Dizi ters sıralanır.', 'Kararlı hâle gelir.'],
              answer: 1,
              hint: 'Alt problemin boyu küçülüyor mu?',
              explanation: 'Doğruluk kanıtı her çağrının daha kısa bir parçada yapılmasına dayanır. Pivot dahil edilirse parça küçülmeyebilir ve özyineleme sonlanmayabilir.',
            },
          ],
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
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: '“Son eleman” pivotuyla QuickSort, zaten sıralı 10 elemanlı bir dizide toplam kaç karşılaştırma yapar?',
              answer: 45,
              hint: '$9 + 8 + \\dots + 1$.',
              explanation: 'Her çağrıda pivot en büyük eleman olur ve bir eleman eksilir: $\\frac{10 \\cdot 9}{2} = 45$.',
            },
          ],
          body: `Pivot $k$. en küçük eleman ise: $T(n) \\le cn + T(k-1) + T(n-k)$.

- **En kötü pivot (min/maks):** $T(n) = T(n-1) + O(n) = \\Theta(n^2)$. Sıralı girdide “ilk/son eleman” kuralı her seferinde bunu yapar.
- **Medyan pivot (Select ile):** $T(n) \\le cn + 2T(n/2) = O(n\\log n)$ — **deterministik en kötü durum**, ama Select’in sabitleri büyük olduğu için pratik değil.
- **Rastgele pivot:** en kötü durum yine $\\Theta(n^2)$ (her seferinde en kötü seçim), ama **her girdi için beklenen** süre $O(n\\log n)$ — bir sonraki dersin konusu.

Slaytlardaki karşılaştırma: QuickSort (rastgele pivot) yerinde kolayca uygulanır ve kararlı değildir; MergeSort en kötü durumda $O(n\\log n)$ ve kararlıdır.`,
        },
        {
          kind: 'text',
          title: 'Pratikte: kütüphanelerdeki QuickSort',
          body: `- **Introsort** (C++ \`std::sort\` uygulamalarının çoğu): QuickSort ile başlar, özyineleme derinliği yaklaşık $2\\log_2 n$’yi aşarsa **HeapSort**’a geçer (en kötü durumda $O(n\\log n)$ garantisi), küçük parçalarda InsertionSort kullanır.
- **Java:** ilkel türlerin dizileri için **çift pivotlu QuickSort**, nesne dizileri için kararlı olduğu için **Timsort** kullanılır.
- **Neden bu kadar yaygın?** Yerinde çalışır (ek dizi gerekmez) ve belleğe sırayla eriştiği için önbellekle çok uyumludur.
- **Saldırılar:** pivot kuralı sabitse (ör. “ilk eleman” ya da “üçün medyanı”), kuralı bilen biri $\\Theta(n^2)$ süren girdiler üretebilir; bu bir hizmet engelleme (DoS) aracı olarak kullanılmıştır. Rastgele pivot ya da introsort bu riski kaldırır.`,
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'Introsort özyineleme çok derinleşince neden HeapSort’a geçer?',
              options: [
                'HeapSort her zaman daha hızlı olduğu için',
                'En kötü durumda $O(n\\log n)$ garantisi vermek için',
                'Sıralamayı kararlı yapmak için',
                'Bellek kullanımını artırmak için',
              ],
              answer: 1,
              hint: 'Derin özyineleme kötü pivotların işaretidir.',
              explanation: 'Derinlik $O(\\log n)$’yi aşarsa QuickSort kötü pivotlarla $\\Theta(n^2)$’ye gidiyor demektir; HeapSort’a geçmek toplamı $O(n\\log n)$ ile sınırlar.',
            },
            {
              id: 'c6',
              kind: 'mcq',
              prompt: 'Java nesne dizileri için neden QuickSort yerine Timsort kullanır?',
              options: ['Nesneler karşılaştırılamaz.', 'Nesne sıralamada kararlılık istenir ve QuickSort kararlı değildir.', 'QuickSort nesnelerle çalışmaz.', 'Timsort yerinde çalışır.'],
              answer: 1,
              hint: 'Önce isme, sonra bölüme göre sıralamayı düşünün.',
              explanation: 'Eşit anahtarlı nesnelerin önceki sırası korunmalıdır (kararlılık). Timsort kararlıdır; QuickSort değildir. İlkel sayılarda eşit değerler ayırt edilemediği için kararlılık önemsizdir.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Eşit anahtarlar ve üç yollu bölümleme',
          body: `Lomuto bölümlemesi pivota **eşit** elemanları sağ tarafa koyar. Bütün elemanlar eşitse her bölümlemede sol taraf boş kalır, pivot en sola gider ve özyineleme $n - 1$ elemanla sürer: $T(n) = T(n-1) + (n-1)$, yani $\\Theta(n^2)$. Rastgele pivot bunu düzeltmez, çünkü hangi eleman seçilirse seçilsin hepsi aynıdır.

Çözüm **üç yollu bölümleme**dir (Dijkstra’nın “Hollanda bayrağı” problemi): dizi $< p$, $= p$ ve $> p$ olmak üzere üçe ayrılır ve özyineleme yalnızca ilk ve son parçada sürer. Hepsi eşit bir dizi tek geçişte biter: $\\Theta(n)$. Çok tekrarlı anahtarlar (yaş, şehir kodu, not) gerçek veride sık görüldüğü için kütüphane sıralamaları bu fikri kullanır.`,
          check: [
            {
              id: 'c7',
              kind: 'numeric',
              prompt: '10 elemanın hepsi eşitken Lomuto bölümlemeli QuickSort toplam kaç karşılaştırma yapar?',
              answer: 45,
              hint: 'Çağrıların boyları 10, 9, …, 2; boyu $k$ olan çağrı $k - 1$ karşılaştırma yapar.',
              explanation: '$9 + 8 + \\dots + 1 = 45 = \\binom{10}{2}$: sıralı dizideki en kötü durumla aynı.',
            },
          ],
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
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Üç yollu bölümlemeli QuickSort, $n$ elemanın hepsi eşit olan bir dizide ne kadar sürer?',
          options: ['$\\Theta(1)$', '$\\Theta(n)$', '$\\Theta(n\\log n)$', '$\\Theta(n^2)$'],
          answer: 1,
          hint: 'İlk bölümlemeden sonra $< p$ ve $> p$ parçaları ne kadar büyüktür?',
          explanation: 'Tek bir doğrusal bölümleme bütün elemanları $= p$ parçasına koyar; iki taraf da boştur ve özyineleme hemen biter: $\\Theta(n)$.',
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
      minutes: 50,
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
          kind: 'intuition',
          title: 'Sezgi: göstergeçlerle saymak',
          label: 'intuition',
          body: `Bir vestiyerde $n$ kişinin şapkası karışıyor ve herkese rastgele bir şapka veriliyor. Ortalama kaç kişi **kendi** şapkasını alır?

Doğrudan hesaplamak zor, çünkü kimin hangi şapkayı aldığı birbirine bağlı. Ama soruyu parçalara bölebiliriz: $X_i$, $i$. kişi kendi şapkasını alırsa 1, yoksa 0 olsun. Toplam $X = X_1 + \\dots + X_n$ ve her biri için $E[X_i] = P(X_i = 1) = \\frac1n$. Beklentinin doğrusallığıyla
$$E[X] = \\sum_{i=1}^n E[X_i] = n \\cdot \\frac1n = 1.$$
$X_i$’ler bağımsız **değildir**, ama doğrusallık bağımsızlık istemez. QuickSort’un analizi aynı kalıbı izler: karşılaştırma sayısını, her çift için bir göstergeç değişkenin toplamı olarak yazarız.`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: '$n = 100$ kişide ortalama kaç kişi kendi şapkasını alır?',
              answer: 1,
              hint: '$n$ göstergeç, her birinin olasılığı $1/n$.',
              explanation: '$100 \\cdot \\frac{1}{100} = 1$: cevap $n$’ye bağlı değildir.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Kurulum (Ders 5 notları)',
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: '$E[X + Y] = E[X] + E[Y]$ eşitliği için $X$ ile $Y$’nin bağımsız olması gerekir mi?',
              options: ['Evet, her zaman', 'Hayır, beklentinin doğrusallığı her zaman geçerlidir', 'Yalnızca göstergeç değişkenleri için gerekir', 'Yalnızca $X = Y$ ise geçerlidir'],
              answer: 1,
              hint: '$X_{i,j}$’ler bağımsız değil ama analiz yine çalışıyor.',
              explanation: 'Doğrusallık bağımsızlık gerektirmez. Bağımsızlık $E[XY] = E[X]E[Y]$ için gerekir.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `$z_1 < z_2 < \\dots < z_n$ sıralı dizinin elemanları olsun. $X_{i,j}$: $z_i$ ile $z_j$’nin karşılaştırılma sayısı. Her karşılaştırma pivotla yapılır ve pivot sonraki çağrılara dahil edilmez; bu yüzden $X_{i,j} \\in \\{0, 1\\}$ — bir **göstergeç değişkeni**.

$$C = \\sum_{i<j} X_{i,j}, \\qquad E[C] = \\sum_{i<j} E[X_{i,j}] = \\sum_{i<j} P[z_i, z_j \\text{ karşılaştırılır}].$$

İkinci eşitlik **beklentinin doğrusallığıdır**: $X_{i,j}$’ler bağımsız olmasa bile geçerlidir. $C$’nin dağılımını hesaplamak çok zor; beklentisini hesaplamak kolay.`,
        },
        {
          kind: 'viz',
          title: 'Etkileşim: hangi çiftler ne sıklıkla karşılaştırılır?',
          tasks: [
            'Köşegene en yakın hücrelere (komşu çiftler) tıkla: olasılık neden 1?',
            '$z_1$ ile $z_{10}$’u seç: olasılık neden yalnızca $0.2$?',
            'Simülasyon oranını formülle karşılaştır. Fark ne kadar? Neden tam aynı değil?',
          ],
          viz: 'pairProbability',
        },
        {
          kind: 'correctness',
          title: 'Türetme',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: '$n = 10$ için $z_2$ ile $z_9$’un karşılaştırılma olasılığı nedir? (Ondalık.)',
              answer: 0.25,
              tolerance: 0.001,
              hint: 'Pencerede $9 - 2 + 1$ eleman var.',
              explanation: '$\\frac{2}{8} = 0.25$.',
            },
          ],
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
          tasks: [
            '“Sıralı dizi” girdisinde $n = 100$ için rastgele pivotun ölçülen ortalamasını deterministik “son eleman” pivotuyla karşılaştır.',
            'Çalıştırma sayısını 1000 yap: histogram teorik değerin etrafında ne kadar yayılıyor?',
            '$n$’yi büyüt ve ortalamanın $2n\\ln n$ sınırının altında kaldığını kontrol et.',
          ],
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
          kind: 'text',
          title: 'Pratikte: rastgele algoritmalar',
          body: `- **Las Vegas ve Monte Carlo:** rastgele QuickSort her zaman doğru sonucu verir, yalnızca süresi rastgeledir (**Las Vegas**). Bazı rastgele algoritmalar ise her zaman hızlıdır ama küçük bir olasılıkla yanlış cevap verebilir (**Monte Carlo**; ör. asallık testleri).
- **Beklenti ne kadar güvenilir?** QuickSort’un karşılaştırma sayısı beklentisinin çevresinde yoğunlaşır: beklentinin birkaç katından fazla sürme olasılığı $n$ büyüdükçe hızla küçülür. Deney panelindeki histogram bunu gösterir.
- **Rakibi etkisizleştirmek:** rastgelelik, girdiyi seçen kötü niyetli bir rakibe karşı en ucuz savunmadır; Ders 8’deki hash tabloları da aynı fikri kullanır.
- **Tekrarlanabilirlik:** tohumlu (seeded) üreteçler sayesinde rastgele bir çalışma hata ayıklamak için birebir tekrarlanabilir — bu uygulamadaki tüm rastgele görselleştiriciler böyle çalışır.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Rastgele pivotlu QuickSort hangi tür rastgele algoritmadır?',
              options: ['Las Vegas: her zaman doğru, süresi rastgele', 'Monte Carlo: her zaman hızlı, bazen yanlış', 'Deterministik', 'Yaklaşık algoritma'],
              answer: 0,
              hint: 'Pivot ne olursa olsun çıktı sıralı mı?',
              explanation: 'Doğruluk pivottan bağımsızdır; yalnızca karşılaştırma sayısı rastgeledir.',
            },
            {
              id: 'c4',
              kind: 'numeric',
              prompt: '$n = 3$ için rastgele QuickSort’un beklenen karşılaştırma sayısı $E[C] = \\sum_{i<j} \\frac{2}{j-i+1}$ kaçtır? (İki ondalık.)',
              answer: 2.67,
              tolerance: 0.01,
              hint: 'Uzaklığı 1 olan 2 çift, uzaklığı 2 olan 1 çift.',
              explanation: '$2 \\cdot 1 + 1 \\cdot \\frac23 = \\frac83 \\approx 2.67$. Kontrol: $2(n+1)H_n - 4n = 8 \\cdot \\frac{11}{6} - 12 = \\frac83$.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: Rastgele bir permütasyonda, kendinden önceki herkesten büyük olan elemanlara “rekor” diyelim (ilk eleman her zaman rekordur). $n = 4$ için beklenen rekor sayısı kaçtır? Genel $n$ için?`,
          hints: ['$R_i$: $i$. eleman rekorsa 1. $P(R_i = 1)$ nedir?', 'İlk $i$ elemanın en büyüğünün $i$. konumda olma olasılığını düşünün.'],
          solution: `$i$. eleman, ilk $i$ elemanın en büyüğüyse rekordur; simetriden bu olasılık $\\frac1i$. Doğrusallıkla $E[R] = 1 + \\frac12 + \\frac13 + \\frac14 = \\frac{25}{12} \\approx 2{,}08$. Genel olarak $H_n = \\sum_{i=1}^n \\frac1i \\approx \\ln n$: QuickSort analizindeki harmonik toplamın aynısı.`,
        },
      ],
      sources: [SRC.l5.notes, SRC.l5.slides, SRC.l5.concept, SRC.sec.s3, SRC.hw.hw3],
    },
  ],
}
