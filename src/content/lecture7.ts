import type { Lecture } from './types'
import { SRC } from './sources'
import { BST_SEARCH_CODE } from '../engines/bst'

export const lecture7: Lecture = {
  n: 7,
  title: 'İkili arama ağaçları ve kırmızı-siyah ağaçlar',
  titleEn: 'Binary Search Trees and Red-Black Trees',
  date: '28 Ocak 2026',
  blurb: 'BST işlemleri O(yükseklik) sürer; kırmızı-siyah ağaçlar yüksekliği 2 log(n+1) ile sınırlar.',
  lessons: [
    {
      id: 'l7-bst',
      lecture: 7,
      title: 'İkili arama ağaçları',
      titleEn: 'Binary search trees',
      summary: 'Arama, ekleme, silme — hepsi bir arama yolunu izler: $O(h)$.',
      minutes: 45,
      objectives: [
        'BST özelliğini tanımlamak ve bir ağacın BST olup olmadığını kontrol etmek.',
        'search, insert, delete (üç durum), min/max işlemlerini adım adım izlemek.',
        'Sıralı dolaşımın (in-order traversal) anahtarları sıralı verdiğini açıklamak.',
        'İşlem maliyetinin ağaç yüksekliğine bağlı olduğunu ve sıradan bir BST’nin $\\Theta(n)$ yüksekliğe sahip olabileceğini göstermek.',
      ],
      prerequisites: ['Özyineleme', 'QuickSort (pivot = alt ağaç kökü benzetmesi)'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: sıralı dizi ile bağlı listenin en iyi yanları',
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: '1 000 000 anahtarlı **tam dengeli** bir BST’de en kötü durumda bir arama kaç düğüme bakar? ($\\lfloor\\log_2 n\\rfloor + 1$)',
              answer: 20,
              hint: '$2^{19} = 524\\,288$, $2^{20} = 1\\,048\\,576$.',
              explanation: 'Yükseklik $\\lfloor\\log_2 10^6\\rfloor = 19$, yol üzerinde en fazla 20 düğüm. Dejenere bir BST’de ise 1 000 000 olabilir.',
            },
          ],
          label: 'intuition',
          body: `Sıralı dizide arama $O(\\log n)$ ama ekleme/silme $O(n)$; bağlı listede ekleme $O(1)$ ama arama $O(n)$. **Dengeli** bir ikili arama ağacı üçünü de $O(\\log n)$’de yapar.

BST’deki her düğüm, kendi alt ağacı için bir QuickSort pivotu gibidir: sol alt ağaç $A_<$, sağ alt ağaç $A_>$.`,
        },
        {
          kind: 'formal',
          title: 'Tanım (Ders 7 notları)',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Kök 10; kökün sol çocuğu 5, 5’in sağ çocuğu 12; kökün sağ çocuğu 15. Bu bir BST midir?',
              options: ['Evet, her düğüm çocuklarıyla doğru sırada.', 'Hayır: 12, 10’un sol alt ağacında ama 10’dan büyük.', 'Hayır: 15, 12’den büyük.', 'Evet, çünkü in-order dolaşım sıralı.'],
              answer: 1,
              hint: 'Özellik yalnızca doğrudan çocuklar için değil, tüm alt ağaç için geçerli olmalı.',
              explanation: 'Sol alt ağaçtaki **tüm** anahtarlar 10’dan küçük olmalı. In-order dolaşım 5, 12, 10, 15 verir — sıralı değil.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `Her $x$ düğümünün bir anahtarı $key(x)$, ebeveyni $p(x)$ ve çocukları $left(x)$, $right(x)$ vardır (yoksa NIL). **BST özelliği:** her $x$ için $left(x)$ altındaki tüm anahtarlar $< key(x)$, $right(x)$ altındakiler $> key(x)$. Bu derste anahtarlar farklıdır.

**Yükseklik:** kökten bir yaprağa en uzun yolun kenar sayısı (slaytlardaki tanım).`,
        },
        {
          kind: 'viz',
          title: 'BST görselleştiricisi',
          tasks: [
            'Ön alıştırma ağacında **Ara** ile 4.5’i ara: arama hangi düğümde duruyor? Bu düğüm, 4.5 eklenseydi ne olurdu?',
            'Ekleme sırasını “Sıralı (dejenere)” yap: yükseklik kaç oldu? Aynı anahtarları “Dengeli sıra” ile kur ve karşılaştır.',
            'Ön alıştırma ağacında 3’ü **Sil**: hangi durum uygulandı, ardıl kim?',
            '**Tahmin modu**nu aç ve her karşılaştırmada aramanın yönünü tahmin et.',
          ],
          viz: 'bst',
          body: `Bir ekleme sırası girin (ağaç baştan, adım adım kurulur) ya da hazır ağaçta işlem çalıştırın. Ondalıklı bir anahtar arayarak (ör. 4.5) aramanın nerede durduğunu görün. “Sıralı” ekleme sırasının nasıl bir ağaç ürettiğine ve yüksekliğe dikkat edin. Tahmin modunda her karşılaştırmada yönü tahmin edin.`,
        },
        {
          kind: 'pseudocode',
          title: 'search (notlardaki Algoritma 4)',
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Ön alıştırma ağacında (kök 5; 3 ve 9; 1, 4, 6) 7 aranırken search kaç düğüme bakar?',
              answer: 3,
              hint: '5 → 9 → 6, sonra 6’nın sağı NIL.',
              explanation: '5, 9 ve 6’ya bakılır; 6’nın sağ çocuğu NIL olduğu için search 6’yı döndürür — 7 eklenseydi ebeveyni olacak düğüm.',
            },
          ],
          code: BST_SEARCH_CODE,
          body: `Bu search, anahtar ağaçta yoksa **eklenseydi ebeveyni olacak** düğümü döndürür (Claim 7). insert bunu kullanır; delete önce search ile düğümü bulur.`,
        },
        {
          kind: 'steps',
          title: 'Silme: üç durum',
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'İki çocuklu bir düğüm silinirken kullanılan ardılın (successor) neden **sol çocuğu yoktur**?',
              options: [
                'Ardıl her zaman bir yapraktır.',
                'Ardıl, sağ alt ağacın en küçüğüdür; sol çocuğu olsaydı o daha küçük olurdu.',
                'Silinen düğümün sol çocuğu ardılın yerine geçer.',
                'BST’de hiçbir düğümün sol çocuğu olmaz.',
              ],
              answer: 1,
              hint: 'Sağ alt ağaçta en küçüğü bulmak için hep sola inilir.',
              explanation: 'En küçük elemana sola inerek ulaşılır ve sola inemediğimiz yerde dururuz; bu yüzden ardılın en fazla bir (sağ) çocuğu vardır ve kolayca yerinden çıkarılır.',
            },
          ],
          body: `1. **Çocuk yok:** düğümü kaldır (ebeveyndeki işaretçi NIL).
2. **Tek çocuk:** çocuğu düğümün yerine yükselt.
3. **İki çocuk:** ardılı (successor) $z$’yi bul — sağ alt ağacın en küçüğü, sol çocuğu yoktur. $z$’nin sağ çocuğunu $z$’nin yerine bağla, sonra $z$’yi silinen düğümün yerine koy. (Simetrik olarak öncül/predecessor da kullanılabilir.)

Ön alıştırmadaki ağaçta 3’ü silmek iki çocuklu durumdur: ardıl 4, 3’ün yerine geçer.`,
        },
        {
          kind: 'complexity',
          title: 'Çalışma süresi: her şey yüksekliğe bağlı',
          body: `search en fazla $h + 1$ düğüme bakar: $O(h)$. insert ve delete, search’ü sabit sayıda çağırıp $O(1)$ ek iş yapar: $O(h)$.

- En iyi durumda (tam dengeli ağaç) $h = \\lfloor\\log_2 n\\rfloor$ → $O(\\log n)$.
- En kötü durumda (ör. $1, 2, \\dots, n$ sırasıyla ekleme) ağaç bir zincire döner: $h = n - 1$ → $\\Theta(n)$.

Yani sıradan bir BST için **$O(\\log n)$ garantisi yoktur**. Logaritmik yükseklik için ağacı yeniden dengelemek gerekir (AVL, kırmızı-siyah, splay…).`,
        },
        {
          kind: 'text',
          title: 'Pratikte: ağaçlar nerede kullanılır?',
          body: `- **Sıralı sözlükler:** Java \`TreeMap\`, C++ \`std::map\` / \`std::set\` dengeli BST’lerdir (çoğunlukla kırmızı-siyah). Hash tablolarından farkları: anahtarları **sıralı** tutarlar.
- **Aralık sorguları:** “$a$ ile $b$ arasındaki tüm anahtarlar” sorgusu, $a$’yı aradıktan sonra in-order dolaşımla $O(h + k)$’de cevaplanır ($k$: dönen anahtar sayısı). Tarih aralığındaki kayıtlar, fiyat aralığındaki ürünler gibi.
- **Veritabanları ve dosya sistemleri:** disk üzerinde her düğümü yüzlerce anahtar tutan **B-ağaçları** kullanılır; böylece ağaç çok sığ olur ve az disk okuması yapılır.
- **Diğer dengeli ağaçlar:** AVL (daha sıkı denge), treap (rastgele öncelikler), splay ağaçları (sık erişilenler köke yakın).`,
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: '$n$ anahtarlı dengeli bir BST’de “$[a, b]$ aralığındaki tüm anahtarları listele” sorgusu, $k$ anahtar döndürüyorsa ne kadar sürer?',
              options: ['$O(n)$ her zaman', '$O(\\log n + k)$', '$O(k\\log n)$', '$O(\\log n)$'],
              answer: 1,
              hint: 'Önce $a$’ya kadar inin, sonra sıralı dolaşın.',
              explanation: '$a$’nın yerini bulmak $O(\\log n)$; oradan in-order dolaşım her dönen anahtar için amortize $O(1)$ iş yapar: $O(\\log n + k)$.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: ekleme sırası ağacın şeklini belirler',
          label: 'formal',
          body: `Aynı yedi anahtarı (1…7) iki farklı sırayla boş bir BST’ye ekleyelim. Bir anahtarı eklerken kökten yerine kadar yoldaki her düğümle bir kez karşılaştırırız; yani anahtar başına karşılaştırma sayısı, o anahtarın **derinliği**dir.`,
          proof: [
            { title: 'Sıralı ekleme: 1, 2, …, 7', body: 'Her yeni anahtar öncekilerin hepsinden büyüktür ve hep sağa gider: ağaç bir zincirdir, yükseklik $6 = n - 1$. Derinlikler $0, 1, \\dots, 6$; toplam karşılaştırma $0 + 1 + \\dots + 6 = 21$.' },
            { title: 'Dengeli ekleme: 4, 2, 6, 1, 3, 5, 7', body: 'Önce ortanca, sonra iki yarının ortancaları: mükemmel bir ağaç, yükseklik 2. Derinlikler bir tane 0, iki tane 1, dört tane 2: toplam $0 + 2 + 8 = 10$.' },
            { title: 'Genel tablo', body: 'Sıralı eklemede toplam $\\frac{n(n-1)}{2} = \\Theta(n^2)$; dengeli eklemede her anahtar $O(\\log n)$, toplam $\\Theta(n \\log n)$. Aynı anahtarlar, ama ağacın şekli tamamen ekleme sırasına bağlı.' },
            { title: 'Ders', body: 'Pratikte veriler çoğu zaman (neredeyse) sıralı gelir: kayıtlar zaman damgasıyla, kimlikler artarak. İşte bu yüzden kendini dengeleyen ağaçlara (kırmızı-siyah ağaçlar, sıradaki ders) ihtiyaç duyarız.' },
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: '1, 2, …, 7 sırayla boş bir BST’ye eklenince toplam kaç anahtar karşılaştırması yapılır?',
              answer: 21,
              hint: 'Her anahtar, derinliği kadar karşılaştırma yapar.',
              explanation: 'Zincirde derinlikler $0, 1, \\dots, 6$: toplam $21$. Dengeli sırayla yalnızca $10$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- BST özelliğini yalnızca doğrudan çocuklar için kontrol etmek: “3’ün sağ çocuğu 7, 7’nin sol çocuğu 2” yerel olarak doğru görünür ama 2 < 3 olduğu için BST değildir (notlardaki Örnek 5).
- “BST işlemleri $O(\\log n)$’dir” demek: yalnızca dengeli ağaçlar için.
- İki çocuklu silmede ardılın da bir sağ çocuğu olabileceğini unutmak.
- search’ün döndürdüğü düğümü “en yakın değer” sanmak (Remark 8).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Aynı anahtar kümesini içeren iki farklı BST için hangisi her zaman aynıdır?',
          options: ['Pre-order dolaşımları', 'In-order dolaşımları', 'Post-order dolaşımları', 'Kök düğümleri'],
          answer: 1,
          hint: 'Hangi dolaşım anahtarları sıralı verir?',
          explanation: 'In-order dolaşım her BST’de anahtarları artan sırada verir; diğerleri ağacın şekline bağlıdır.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: '$A$ kök, $B$ onun sol çocuğu, $C$ de $B$’nin sağ çocuğu ise hangisi doğrudur?',
          options: ['$B < A < C$', '$B < C < A$', '$C < B < A$', '$C < A < B$'],
          answer: 1,
          hint: '$C$, $A$’nın sol alt ağacında ama $B$’nin sağ alt ağacında.',
          explanation: '$C$ sol alt ağaçta → $C < A$; $B$’nin sağında → $C > B$. Notlardaki “alt ağaç özelliği”.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Ön alıştırma ağacına (kök 5; 3 ve 9; 1, 4, 6) 7 eklenirse 7 nereye gider?',
          options: ['5’in sağ çocuğu', '9’un sol çocuğu', '6’nın sağ çocuğu', '4’ün sağ çocuğu'],
          answer: 2,
          hint: '5 → 9 → 6 yolunu izleyin.',
          explanation: '7 > 5 → sağ (9); 7 < 9 → sol (6); 7 > 6 → 6’nın sağı NIL: 7 oraya eklenir.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: '$n$ düğümlü bir BST’nin yüksekliği için hangisi doğrudur (hiçbir dengeleme varsayımı yok)?',
          options: ['$O(\\log n)$', '$\\Omega(\\log n)$ ve $O(n)$', '$\\Theta(\\log n)$', '$\\Theta(n)$'],
          answer: 1,
          hint: 'En dengeli ve en dengesiz ağacı düşünün.',
          explanation: 'Her ikili ağaçta $h \\ge \\lfloor\\log_2 n\\rfloor$; zincir biçiminde $h = n - 1$. Dolayısıyla genel olarak $\\Omega(\\log n)$ ve $O(n)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: $\\{1, 2, \\dots, 7\\}$ anahtarlarını öyle bir sırayla ekleyin ki BST’nin yüksekliği 2 olsun. Kaç farklı sıra bu ağacı verir sorusunu düşünün (cevabı hesaplamanız gerekmez).`,
          hints: ['Kök hangi anahtar olmalı?', 'Her alt ağaçta da aynı fikir.'],
          solution: `Örneğin $4, 2, 6, 1, 3, 5, 7$: kök 4, ikinci seviye 2 ve 6, yapraklar 1, 3, 5, 7 → yükseklik 2. Her düğüm, alt ağacındaki tüm düğümlerden önce eklenmelidir; bu kısıtı sağlayan her sıra aynı ağacı verir (ör. $4, 6, 2, 7, 5, 3, 1$ de çalışır). Görselleştiricide “Dengeli sıra” örneğini deneyin.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: 1, 2, 3 anahtarlarının $3! = 6$ ekleme sırası var. Her sırayla boş bir BST’ye ekleyin. Kaç farklı ağaç şekli çıkar? Kaç sıra yüksekliği 1 olan (dengeli) ağacı verir?`,
          hints: ['Kökte hangi anahtar olur? İlk eklenen.', 'Kök 2 ise ağaç zaten dengelidir.'],
          solution: `Kök, ilk eklenen anahtardır. Kök 2 ise (sıralar 2,1,3 ve 2,3,1) iki sıra da aynı dengeli ağacı verir: yükseklik 1. Kök 1 ise geriye kalan 2 ve 3 sağ alt ağaçta zincir olur ve iki farklı şekil çıkar (1,2,3 ve 1,3,2); kök 3 için de aynısı (3,2,1 ve 3,1,2). Toplam $1 + 2 + 2 = 5$ farklı BST şekli (3. Catalan sayısı) ve 6 sıradan yalnızca **2**’si dengeli. Rastgele bir sıra her zaman dengeli değildir, ama Ders 5’teki gibi beklenen derinlik $O(\\log n)$’dir.`,
        },
      ],
      sources: [SRC.l7.pre, SRC.l7.notes, SRC.l7.slides, SRC.l7.concept, SRC.sec.s4],
    },
    {
      id: 'l7-redblack',
      lecture: 7,
      title: 'Kırmızı-siyah ağaçlar',
      titleEn: 'Red-black trees',
      summary: 'Beş özellik, rotasyonlar ve yeniden boyama: yükseklik $\\le 2\\log_2(n+1)$.',
      minutes: 55,
      objectives: [
        'Beş kırmızı-siyah özelliği ifade etmek ve bir ağaçta ihlalleri bulmak.',
        'Rotasyonun BST özelliğini koruyan $O(1)$ bir yerel işlem olduğunu görmek.',
        'Ekleme sırasında Durum 1, 2, 3’ü tanımak ve her durumun hangi özelliği nasıl onardığını açıklamak.',
        'Siyah yükseklik argümanıyla $h \\le 2\\log_2(n+1)$ sınırını kanıtlamak ve bunu $O(\\log n)$ işlem süresine bağlamak.',
        'Silmede “ekstra siyah” fikrini ve dört düzeltme durumunu tanımak.',
      ],
      prerequisites: ['İkili arama ağaçları', 'Tümevarım'],
      sections: [
        {
          kind: 'formal',
          title: 'Tanım (Ders 7 notları, Tanım 10)',
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Kökten NIL’e giden bir yolda düğümlerin **en fazla yarısının** kırmızı olabilmesini hangi özellik sağlar?',
              options: ['Özellik 2 (kök siyah)', 'Özellik 3 (NIL’ler siyah)', 'Özellik 4 (kırmızının çocukları siyah)', 'Özellik 5 (eşit siyah sayısı)'],
              answer: 2,
              hint: 'İki kırmızı art arda gelebilir mi?',
              explanation: 'Özellik 4 yüzünden kırmızılar art arda gelemez; her kırmızıdan sonra bir siyah gelir. Özellik 5 ile birleşince yollar en fazla 2 kat farklı uzunlukta olur.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `Kırmızı-siyah ağaç, aşağıdaki özellikleri sağlayan bir BST’dir (yaprakların çocukları NIL kabul edilir):

1. Her düğüm kırmızı ya da siyahtır.
2. Kök siyahtır.
3. NIL’ler siyahtır.
4. Kırmızı bir düğümün çocukları siyahtır.
5. Her $x$ düğümü için, $x$’ten NIL’e giden **tüm** yollarda aynı sayıda siyah düğüm vardır.

Sezgi (Remark 15): kırmızı düğümler bir yolun “uzamaya başladığı” yerleri işaretler; özellik 4 bunu sınırlar.`,
        },
        {
          kind: 'viz',
          title: 'Değişmez denetleyicisi: renkleri kendiniz değiştirin',
          tasks: [
            'Kökü kırmızı yap: hangi özellik bozuldu?',
            'Bir yaprağı siyahtan kırmızıya ya da tersine çevir: hangi özellik ve neden?',
            'Ağacı geçerli tutan bir renk değişikliği bulabilir misin? (İpucu: bir siyah düğüm ile iki kırmızı çocuğunun renklerini birlikte değiştirmeyi dene.)',
          ],
          viz: 'rbPlayground',
          body: `Düğümlere tıklayarak renklerini değiştirin ve hangi özelliğin bozulduğunu görün. Kökü kırmızı yapın; bir yaprağı siyah yapın; bir kırmızının çocuğunu kırmızı yapın. Her ihlal “!” ile işaretlenir.`,
        },
        {
          kind: 'formal',
          title: 'Rotasyon',
          box: 'info',
          body: `$x$’in sol çocuğu $y$ olsun; $y$’nin alt ağaçları $\\alpha$ (sol) ve $\\beta$ (sağ), $x$’in sağ alt ağacı $\\gamma$. **$x$’te sağa rotasyon**, $y$’yi alt ağacın köküne çıkarır; $x$, $y$’nin sağ çocuğu olur ve $\\beta$, $x$’in sol çocuğuna taşınır. $\\alpha < y < \\beta < x < \\gamma$ sıralaması değişmez: **BST özelliği korunur**. Yalnızca birkaç işaretçi değişir: $O(1)$. Sola rotasyon tersidir.`,
        },
        {
          kind: 'viz',
          title: 'Rotasyonu izle',
          viz: 'rotation',
          body: `Düğmeye basarak $x$’te sağa rotasyon yapın ve geri alın. $\\alpha$, $\\beta$, $\\gamma$ birer alt ağaçtır; yalnızca $\\beta$’nın ebeveyni değişir. Sıralı dolaşımın aynı kaldığına dikkat edin.`,
          tasks: ['Rotasyondan önce ve sonra kökten $\\alpha$’ya ve $\\gamma$’ya olan uzaklıkları say. Hangi taraf yükseldi, hangisi alçaldı?', 'Hangi üç bağlantının değiştiğini yan paneldeki listeyle doğrula.'],
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Bir rotasyonda kaç **çocuk işaretçisi** değişir (alt ağacın kökünü gösteren, ebeveyndeki işaretçi dahil)?',
              answer: 3,
              hint: '$x$’in bir çocuğu, $y$’nin bir çocuğu ve yukarıdaki ebeveynin bir çocuğu.',
              explanation: 'left($x$): $y \\to \\beta$, right($y$): $\\beta \\to x$ ve üstteki işaretçi $x \\to y$. Sabit sayıda değişiklik: $O(1)$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Ekleme görselleştiricisi',
          tasks: [
            '“Sıralı 1…10” girdisini sona kadar oynat: kaç rotasyon yapıldı, son yükseklik kaç? Sıradan bir BST’de yükseklik kaç olurdu?',
            '“Durum 3 üçgen” örneğinde önce $p$’de, sonra $g$’de yapılan iki rotasyonu adım adım izle.',
            '**Tahmin modu**nda her düzeltme adımından önce hangi durumun uygulanacağını tahmin et.',
            '“Durum 2 zinciri” örneğinde ihlalin yukarı doğru nasıl taşındığını izle.',
            'Ağaç kurulduktan sonra bir anahtarı **delete_rb** ile sil: silinen konum siyahsa hangi durum(lar) uygulandı? Kırmızı bir yaprağı silince ne oldu?',
          ],
          viz: 'rb',
          body: `Ağacı bir sırayla kurun ya da tek tek anahtar ekleyip silin. Her adımda x, p (ebeveyn), u (amca), g (büyük ebeveyn) etiketlenir ve sağdaki denetleyici o anki ağacın hangi özellikleri sağladığını gösterir — düzeltme sırasında geçici ihlalleri görebilirsiniz. Tahmin modunda her durumdan önce hangi durumun uygulanacağını tahmin edin. “Sıralı 1…10” girdisini deneyin.`,
        },
        {
          kind: 'steps',
          title: 'Ekleme: durumlar (notlar, Algoritma 7–8)',
          body: `Yeni düğüm $x$, BST gibi eklenir ve **kırmızı** boyanır. Özellik 5 bozulmaz (siyah sayısı değişmedi); yalnızca 4 (kırmızı-kırmızı) bozulabilir.

- **Durum 1 — $p$ siyah:** sorun yok, bitti.
- **Durum 2 — $p$ kırmızı, amca $u$ kırmızı:** $p$ ve $u$’yu siyaha, $g$’yi kırmızıya boya. Her yolda bir kırmızı→siyah ve bir siyah→kırmızı değişimi olduğu için siyah sayıları korunur. $g$’nin ebeveyni kırmızıysa sorun yukarı taşınır: $g$’de devam et.
- **Durum 3 — $p$ kırmızı, $u$ siyah (NIL olabilir):** $x$, $g$’nin “iç” torunuysa (üçgen) önce $p$’de rotasyon yapılarak “dış” biçime (düz çizgi) çevrilir. Sonra $p$ siyaha, $g$ kırmızıya boyanır ve $g$’de rotasyon yapılır. Bitti.
- Düzeltme köke ulaşırsa ve kök kırmızıysa kök siyaha boyanır (özellik 2).

Notlar $x$’in sol, $u$’nun sağ çocuk olduğu durumu ayrıntılı gösterir; diğer durumlar simetriktir (CLRS 13.3).`,
        },
        {
          kind: 'steps',
          title: 'Silme: ekstra siyah ve dört durum',
          label: 'formal',
          body: `Ders 7 silmeyi ayrıntılı işlemez; görselleştiricideki **delete_rb** CLRS 13.4’teki yaygın biçimi izler. Fikir eklemeye benzer: önce sıradan BST silmesi, sonra **yerel onarım**.

1. **BST silmesi:** $z$ en fazla bir çocukluysa doğrudan çıkarılır; iki çocukluysa ardılı $y$, $z$’nin yerine (ve rengine) geçer. Ağaçtan fiilen ayrılan konum $y$’nin eski yeridir.
2. **Ayrılan konum kırmızıysa** hiçbir yolun siyah sayısı değişmez: bitti.
3. **Siyahsa** o konumdan geçen yollar bir siyah kaybeder (özellik 5 bozulur). Yerine gelen $x$’e (NIL olabilir) bir **ekstra siyah** yüklenir. $x$ kırmızıysa siyaha boyanır, bitti. Değilse $x$’in kardeşi $w$’ye bakılır:

- **Durum 1 — $w$ kırmızı:** $w$ siyaha, ebeveyn $p$ kırmızıya boyanır, $p$’de $x$ yönüne rotasyon. $x$’in yeni kardeşi siyahtır; 2, 3 ya da 4 ile devam.
- **Durum 2 — $w$ siyah, iki çocuğu siyah:** $w$ kırmızıya boyanır; artık $p$’nin iki tarafı da bir siyah eksik, ekstra siyah $p$’ye çıkar. $p$ kırmızıysa siyaha boyanıp biter.
- **Durum 3 — $w$ siyah, yakın çocuğu kırmızı, uzak çocuğu siyah:** yakın çocuk siyaha, $w$ kırmızıya boyanır, $w$’de $x$’ten uzağa rotasyon. Durum 4’e dönüşür.
- **Durum 4 — $w$ siyah, uzak çocuğu kırmızı:** $w$, $p$’nin rengini alır; $p$ ve uzak çocuk siyaha boyanır; $p$’de $x$ yönüne rotasyon. Ekstra siyah yok olur, bitti.

Yalnızca Durum 2 yukarı taşınır; 1, 3 ve 4 en fazla 3 rotasyonla biter. Toplam iş $O(h) = O(\\log n)$.`,
          check: [
            {
              id: 'c7',
              kind: 'mcq',
              prompt: 'Kırmızı-siyah ağaçtan **kırmızı bir yaprak** silinirse ne yapılır?',
              options: ['Durum 1’den başlanır.', 'Hiçbir şey: yolların siyah sayısı değişmez ve kırmızı-kırmızı oluşmaz.', 'Kök kırmızıya boyanır.', 'Ebeveynde bir rotasyon yapılır.'],
              answer: 1,
              hint: 'Silinen düğüm hangi özellikleri etkileyebilir? Kırmızı düğümler siyah sayısına katılmaz.',
              explanation: 'Kırmızı bir düğüm hiçbir yolun siyah sayısına katkı yapmaz ve onu kaldırmak iki kırmızıyı yan yana getiremez; beş özellik de korunur.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Yükseklik garantisi (Claim 16)',
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Kökün siyah yüksekliği $b(r) = 4$ ise ağaçta en az kaç (NIL olmayan) düğüm vardır?',
              answer: 15,
              hint: 'Lemma: en az $2^{b(x)} - 1$.',
              explanation: '$2^4 - 1 = 15$: tam dengeli, hepsi siyah 4 seviyeli bir ağaç bu sınıra ulaşır.',
            },
          ],
          label: 'formalProof',
          proof: [
            { title: 'Siyah yükseklik', body: '$b(x)$: $x$’ten NIL’e herhangi bir yoldaki siyah düğüm sayısı, $x$ hariç (NIL dahil). Özellik 5 sayesinde iyi tanımlıdır.' },
            { title: 'Lemma', body: '$x$’in alt ağacında en az $2^{b(x)} - 1$ NIL olmayan düğüm vardır. Taban: NIL için $b = 0$, $2^0 - 1 = 0$ ✓.' },
            { title: 'Tümevarım adımı', body: 'Her çocuğun siyah yüksekliği en az $b(x) - 1$’dir. $d(x) = 1 + d(left) + d(right) \\ge 1 + 2(2^{b(x)-1} - 1) = 2^{b(x)} - 1$.' },
            { title: 'Kırmızılar sınırlı', body: 'Özellik 4: bir yolda iki kırmızı art arda gelemez, bu yüzden kökten NIL’e her yolda siyahlar en az yarıdır: $b(r) \\ge h/2$.' },
            { title: 'Sonuç', body: '$n \\ge 2^{b(r)} - 1 \\ge 2^{h/2} - 1$ ⇒ $h \\le 2\\log_2(n+1)$. Ekleme düzeltmesi yukarı doğru en fazla $O(h)$ adım yapar ve her adım $O(1)$: search, insert (ve notlara göre delete) $O(\\log n)$.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Neden O(log n)?',
          body: `Sadece “$O(\\log n)$” demek yetmez; zincir şöyle:

1. Her BST işlemi $O(h)$ (bir arama yolu + sabit iş).
2. Ekleme düzeltmesi: Durum 2 her seferinde iki seviye yukarı çıkar, Durum 1/3 en fazla 2 rotasyonla biter → $O(h)$.
3. Özellik 4 + 5 ⇒ $h \\le 2\\log_2(n+1)$ (yukarıdaki kanıt).
4. Dolayısıyla tüm işlemler **en kötü durumda** $O(\\log n)$.

Sezgisel ifade: kökten NIL’e tüm yolların uzunlukları birbirinin en fazla 2 katıdır (en kısa yol yalnızca siyah, en uzun yol siyah-kırmızı dönüşümlü).`,
        },
        {
          kind: 'text',
          title: 'Pratikte: kırmızı-siyah ağaçlar nerede çalışıyor?',
          body: `- **Standart kütüphaneler:** Java \`TreeMap\`/\`TreeSet\`, C++ \`std::map\`/\`std::set\` (yaygın uygulamalarda) kırmızı-siyah ağaçtır.
- **İşletim sistemleri:** Linux çekirdeği zamanlayıcıda (CFS) çalışmaya hazır görevleri ve bellek bölgelerini kırmızı-siyah ağaçlarda tutar; en küçük anahtarlı görevi hızla bulmak ve ekleme/silme yapmak gerekir.
- **Neden AVL değil?** AVL daha sıkı dengelidir (aramalar biraz daha hızlı), ama ekleme ve silmede daha çok rotasyon yapabilir. Kırmızı-siyah ağaç, ekleme başına en fazla 2 rotasyonla sık değişen veriler için iyi bir dengedir.
- **Disk:** veritabanı dizinleri kırmızı-siyah ağaç yerine B-ağacı kullanır; her disk okuması pahalı olduğu için düğüm başına çok anahtar tutup ağacı sığlaştırmak daha önemlidir.`,
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Diskteki veritabanı dizinleri neden genellikle kırmızı-siyah ağaç yerine B-ağacı kullanır?',
              options: [
                'Kırmızı-siyah ağaçlar sıralı değildir.',
                'B-ağaçları düğüm başına çok anahtar tutar; ağaç çok sığdır ve bir aramada çok az disk okuması gerekir.',
                'B-ağaçlarında rotasyon yoktur.',
                'Kırmızı-siyah ağaçlar yalnızca tam sayılarla çalışır.',
              ],
              answer: 1,
              hint: 'Diskte maliyet, okunan blok sayısıdır.',
              explanation: 'Bir disk bloğu yüzlerce anahtar alır; B-ağacının yüksekliği $\\log_{B} n$ olur (ör. $B = 500$ ile milyarlarca kayıt için 3–4 seviye).',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Yeni düğümü siyah eklemek: özellik 5 bozulur ve düzeltmesi çok daha zordur.
- Durum 2’den sonra durmak: $g$ kırmızı olduğu için yeni bir kırmızı-kırmızı ihlali oluşabilir.
- Durum 3’te üçgen biçimini (iç torun) düzeltmeden doğrudan $g$’de rotasyon yapmak.
- NIL amcayı “yok” sayıp kırmızı sanmak: NIL’ler siyahtır, bu Durum 3’tür.
- Özellik 5’i yalnızca kök için kontrol etmek: **her** düğüm için geçerli olmalı.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Kök 2 (siyah), çocukları 1 ve 3 (ikisi de kırmızı) olan ağaç geçerli bir kırmızı-siyah ağaç mıdır?',
          options: ['Evet', 'Hayır: kırmızı-kırmızı ihlali', 'Hayır: siyah yükseklikler farklı', 'Hayır: kök kırmızı olmalı'],
          answer: 0,
          hint: 'Beş özelliği tek tek kontrol edin; NIL’leri unutmayın.',
          explanation: 'Kök siyah; kırmızıların çocukları NIL (siyah); her yolda 1 siyah düğüm (NIL) + kök. Tüm özellikler sağlanıyor.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Bir kırmızı-siyah ağaçta kökten bir NIL’e giden yolun uzunluğu 100 ise başka bir NIL’e giden yolun uzunluğu hangisi **olamaz**?',
          options: ['55', '180', '30', '50'],
          answer: 2,
          hint: 'Yol uzunlukları birbirinin en fazla 2 katı olabilir.',
          explanation: 'Her yolun siyah sayısı aynı ($b$); bir yolun uzunluğu $b$ ile $2b$ arasında. 100 uzunluklu yol için $50 \\le b \\le 100$, dolayısıyla diğer yollar en az $b \\ge 50$ olmalı: 30 olamaz. (55, 180, 50 için uygun bir $b$ seçilebilir: 180 için $b \\ge 90$.)',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Boş bir kırmızı-siyah ağaca sırasıyla 1, 2, 3 eklenince son durum nedir?',
          options: [
            'Zincir 1 → 2 → 3, hepsi siyah',
            'Kök 2 (siyah), çocukları 1 ve 3 (kırmızı)',
            'Kök 1 (siyah), sağ çocuk 2 (kırmızı), onun sağı 3 (kırmızı)',
            'Kök 3 (siyah), 2 ve 1 kırmızı zincir',
          ],
          answer: 1,
          hint: '3 eklenince p = 2 kırmızı, amca NIL (siyah): Durum 3, dış biçim.',
          explanation: '2 siyaha, 1 kırmızıya boyanır ve 1’de sola rotasyon yapılır: kök 2 (siyah), 1 ve 3 kırmızı.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Ekleme düzeltmesinde amca kırmızıyken (Durum 2) neden rotasyon gerekmez?',
          options: [
            'Çünkü ağaç zaten dengelidir.',
            'Yeniden boyama, siyah yükseklikleri değiştirmeden kırmızı-kırmızı ihlalini bu seviyede giderir (sorun gerekirse yukarı taşınır).',
            'Çünkü Durum 2 hiçbir zaman oluşmaz.',
            'Çünkü kök her zaman kırmızıdır.',
          ],
          answer: 1,
          hint: '$g$’nin altındaki yolların siyah sayısını boyamadan önce ve sonra sayın.',
          explanation: '$p$ ve $u$ siyah, $g$ kırmızı olur: $g$’nin altındaki her yolda siyah sayısı aynı kalır. Yalnızca $g$ ile ebeveyni arasında yeni bir ihlal oluşabilir; o da yukarıda çözülür.',
        },
        {
          id: 'q5',
          kind: 'numeric',
          prompt: '$n = 1000$ düğümlü bir kırmızı-siyah ağacın yüksekliği için Claim 16’nın verdiği üst sınırın tam sayı kısmı nedir? ($\\lfloor 2\\log_2 1001 \\rfloor$)',
          answer: 19,
          hint: '$\\log_2 1001 \\approx 9.97$.',
          explanation: '$2 \\cdot 9.967 \\approx 19.93$ → yükseklik en fazla 19. Sıradan bir BST’de ise 999 olabilir.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Boş ağaca sırasıyla 10, 5, 15, 3, 7, 1 ekleyin. Her eklemede hangi durum(lar) uygulanır? Son ağacı çizin. (Görselleştiricideki “Durum 2 zinciri” örneğiyle kontrol edin.)`,
          hints: ['3 eklenirken amca 15 kırmızıdır.', '1 eklenirken $p = 3$ kırmızı, amca 7 kırmızı mı?'],
          solution: `10: kök (siyaha boyanır). 5, 15: Durum 1 (ebeveyn 10 siyah). 3: $p = 5$ kırmızı, $u = 15$ kırmızı → Durum 2: 5 ve 15 siyah, 10 kırmızı; 10 kök olduğu için tekrar siyaha boyanır. 7: $p = 5$ siyah → Durum 1. 1: $p = 3$ kırmızı, $u = 7$ kırmızı → Durum 2: 3, 7 siyah, 5 kırmızı; 5’in ebeveyni 10 siyah → Durum 1, bitti.

Son ağaç: 10 (S) → sol 5 (K) [sol 3 (S) → sol 1 (K); sağ 7 (S)], sağ 15 (S). Her kök→NIL yolunda (NIL dahil) 3 siyah düğüm var.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: siyah yüksekliği $b$ olan (kökten her NIL’e giden yolda, NIL hariç, $b$ siyah düğüm bulunan) bir kırmızı-siyah ağaçta en az ve en çok kaç iç düğüm olabilir? $b = 3$ için hesaplayın.`,
          hints: ['En az: hiç kırmızı düğüm yoksa ağaç ne şekildedir?', 'En çok: kırmızı ve siyah düğümler her seviyede sırayla gelirse yükseklik en fazla $2b$.'],
          solution: `**En az:** her kökten-NIL yolunda tam $b$ siyah düğüm var; kırmızı düğüm yoksa bütün yollar $b$ uzunluğunda olur ve ağaç mükemmel bir ikili ağaçtır: $2^b - 1$ düğüm. Kırmızı düğüm eklemek sayıyı yalnızca artırır. **En çok:** kırmızı düğümler ardışık olamaz, yani her yolda en fazla $2b$ düğüm; en çok $2^{2b} - 1$ düğüm (seviyeler sırayla siyah ve kırmızı olan mükemmel ağaç). $b = 3$: en az 7, en çok 63 düğüm. Ters çevirince: $n \\ge 2^b - 1$, yani $b \\le \\log_2(n + 1)$ ve yükseklik $\\le 2b \\le 2\\log_2(n + 1)$: Claim 16.`,
        },
      ],
      sources: [SRC.l7.notes, SRC.l7.slides, SRC.l7.concept, SRC.hw.hw4],
    },
    {
      id: 'l7-compare',
      lecture: 7,
      title: 'BST ve kırmızı-siyah ağaç karşılaştırması',
      titleEn: 'Comparing a BST and a red-black tree',
      summary: 'Aynı ekleme sırası, çok farklı yükseklikler.',
      minutes: 25,
      objectives: [
        'Aynı ekleme sırasının sıradan bir BST ve bir kırmızı-siyah ağaçta ürettiği şekilleri karşılaştırmak.',
        'Yükseklik ile arama maliyeti arasındaki bağı ölçümlerle gözlemlemek ve kanıtlanmış garantiyle ilişkilendirmek.',
      ],
      prerequisites: ['İkili arama ağaçları', 'Kırmızı-siyah ağaçlar'],
      sections: [
        {
          kind: 'viz',
          title: 'Yan yana karşılaştırma',
          tasks: [
            '“Sıralı 1…12” ile iki ağacın yüksekliklerini ve en kötü arama karşılaştırmalarını oku.',
            '“Ters sıralı”yı dene: sıradan BST’nin şekli nasıl?',
            '“Karışık” sırada fark azalıyor mu? **Rastgele** ile birkaç kez dene.',
          ],
          viz: 'treeCompare',
          body: `Sıralı, ters sıralı ve karışık ekleme sıralarını deneyin. Ortalama ve en kötü arama karşılaştırma sayısını, yüksekliği ve garanti edilen sınırı inceleyin.`,
        },
        {
          kind: 'text',
          title: 'Ne gözlemlemeliyiz?',
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: '1’den 12’ye sıralı eklenen sıradan BST’de başarılı bir aramanın ortalama karşılaştırma sayısı kaçtır?',
              answer: 6.5,
              tolerance: 0.01,
              hint: '$k$ anahtarı zincirde $k$. düğümdür.',
              explanation: '$(1 + 2 + \\dots + 12)/12 = 78/12 = 6.5$. Kırmızı-siyah ağaçta bu değer 3’ün biraz üstündedir.',
            },
          ],
          body: `- Sıralı ekleme sıradan BST’yi bir zincire çevirir: yükseklik $n - 1$, arama $\\Theta(n)$.
- Kırmızı-siyah ağaç aynı sırada rotasyonlarla dengede kalır: yükseklik $\\le 2\\log_2(n+1)$.
- Ölçülen değerler tek bir sıraya aittir; kırmızı-siyah ağacın sınırı ise **her** sıra için kanıtlanmıştır.`,
        },
        {
          kind: 'text',
          title: 'Pratikte: rastgele sıra yeterli mi?',
          body: `Anahtarlar **rastgele bir sırayla** eklenirse sıradan bir BST’nin beklenen yüksekliği $O(\\log n)$’dir: kök, QuickSort’taki rastgele pivot gibi davranır ve ağaç, rastgele QuickSort’un özyineleme ağacına benzer.

Ama gerçek veriler çoğu zaman rastgele değildir: zaman damgaları, artan kimlik numaraları, alfabetik listeler **sıralı** gelir ve sıradan BST’yi bir zincire çevirir. İki çözüm vardır:

- **Garanti:** kırmızı-siyah ya da AVL gibi dengeleyen ağaçlar her ekleme sırasında $O(\\log n)$ sağlar.
- **Rastgeleleştirme:** **treap** her düğüme rastgele bir öncelik verir; böylece veri sırası ne olursa olsun ağaç rastgele eklenmiş gibi davranır (beklenen $O(\\log n)$).`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Bir uygulama kayıtları oluşturulma zamanına göre (artan zaman damgasıyla) sıradan bir BST’ye ekliyor. Ne olur?',
              options: ['Ağaç kendiliğinden dengeli kalır.', 'Ağaç bir zincire dönüşür; aramalar $\\Theta(n)$ olur.', 'Ağacın yüksekliği $\\log n$ olur.', 'Ekleme başarısız olur.'],
              answer: 1,
              hint: 'Artan anahtarlarla ekleme, “Sıralı” örneğiyle aynıdır.',
              explanation: 'Her yeni anahtar bir öncekinden büyük olduğu için en sağa eklenir: yükseklik $n - 1$. Dengeleyen bir ağaç ya da rastgeleleştirme gerekir.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: 1…7 sırayla, iki ağaç',
          label: 'formal',
          body: `Karşılaştırma panelindeki “Sıralı” senaryonun küçük bir hâli: 1, 2, …, 7 anahtarlarını sırayla ekleyelim. Sıradan BST’de sonuç bir zincirdir (yükseklik 6). Kırmızı-siyah ağaçta her eklemede ne olduğunu izleyelim; yeni düğüm kırmızı eklenir ve durum numaraları ekleme dersindeki gibidir.`,
          proof: [
            { title: '1, 2, 3', body: '1 kök olur ve siyaha boyanır. 2: ebeveyn siyah, Durum 1. 3: ebeveyn 2 kırmızı, amca NIL (siyah), düz çizgi: Durum 3. 1’de sola rotasyon; 2 siyah kök, 1 ve 3 kırmızı.' },
            { title: '4 ve 5', body: '4: ebeveyn 3 ve amca 1 kırmızı, Durum 2: 1 ve 3 siyaha, 2 kırmızıya boyanır; 2 kök olduğu için yeniden siyah olur. 5: ebeveyn 4 kırmızı, amca NIL, Durum 3: 3’te sola rotasyon; 4 siyah, 3 ve 5 kırmızı.' },
            { title: '6 ve 7', body: '6: ebeveyn 5 ve amca 3 kırmızı, Durum 2: 3 ve 5 siyah, 4 kırmızı; 4’ün ebeveyni 2 siyah, bitti. 7: ebeveyn 6 kırmızı, amca NIL, Durum 3: 5’te sola rotasyon; 6 siyah, 5 ve 7 kırmızı.' },
            { title: 'Sonuç', body: 'Kök 2; solunda 1; sağında kırmızı 4, onun altında 3 ve 6, 6’nın altında 5 ve 7. Yükseklik 3 (BST’de 6). Başarılı aramaların karşılaştırma sayıları 1 → 2, 2 → 1, 3 → 3, 4 → 2, 5 → 4, 6 → 3, 7 → 4: toplam 19, ortalama yaklaşık 2.71. Zincirde toplam 28, ortalama 4. Mükemmel dengeli ağaçta toplam $1 + 2 \\cdot 2 + 4 \\cdot 3 = 17$ olurdu: kırmızı-siyah ağaç mükemmel değil ama zincirden çok daha iyi.' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Bu ağaca 8 eklenince kök hangi anahtar olur?',
              answer: 4,
              hint: '8’in ebeveyni 7 ve amcası 5 kırmızı: önce Durum 2. Sorun nereye taşınır?',
              explanation: 'Durum 2: 5 ve 7 siyah, 6 kırmızı. Şimdi 6 ile ebeveyni 4 kırmızı, 4’ün kardeşi 1 siyah ve 2 → 4 → 6 düz çizgi: Durum 3, 2’de sola rotasyon. 4 siyah kök olur; 2 kırmızı (altında 1 ve 3), 6 kırmızı (altında 5 ve 7, 7’nin altında 8). Yükseklik yine 3.',
            },
          ],
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '1’den 12’ye sıralı ekleme yapıldığında sıradan BST’nin yüksekliği kaçtır?',
          options: ['3', '6', '11', '12'],
          answer: 2,
          hint: 'Her yeni anahtar en sağdaki düğümün sağ çocuğu olur.',
          explanation: 'Zincir: 12 düğüm, 11 kenar → yükseklik 11.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: '$n$ düğümlü bir kırmızı-siyah ağaçta INSERT/DELETE/SEARCH için en kötü durum süresi nedir?',
          options: ['$\\Theta(n)$', '$\\Theta(\\sqrt n)$', '$\\Theta(\\log n)$', '$\\Theta(1)$'],
          answer: 2,
          hint: 'Yükseklik sınırı + işlemler $O(h)$.',
          explanation: '$h = O(\\log n)$ ve işlemler $O(h)$; ayrıca her ikili ağaçta $h = \\Omega(\\log n)$ olduğundan arama en kötü durumda $\\Theta(\\log n)$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: '1…7 anahtarlarının hangi ekleme sırası **sıradan** bir BST’yi mükemmel dengeli yapar (yükseklik 2)?',
          options: ['1, 2, 3, 4, 5, 6, 7', '4, 2, 6, 1, 3, 5, 7', '7, 6, 5, 4, 3, 2, 1', '1, 7, 2, 6, 3, 5, 4'],
          answer: 1,
          hint: 'Kök, ilk eklenen anahtardır. Ortanca anahtar hangisi?',
          explanation: 'Önce ortanca 4 kök olur, sonra iki yarının ortancaları 2 ve 6, en son yapraklar. Diğer üç sıra yükseklik 6’lık zincirler verir (sonuncusu zikzak çizer).',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Bir kırmızı-siyah ağacın kökü, sıralı anahtarlar arasında $i$. sırada olsun. $i$ için ne söyleyebiliriz: $i = \\Theta(n)$ mi? Karşılaştırma panelinde sıralı eklemelerde kökün nerede kaldığını gözlemleyin.`,
          hints: ['Kökün sol ve sağ alt ağaçlarının siyah yükseklikleri eşittir.', 'Her alt ağaçta en az $2^{b} - 1$ düğüm var; en fazla kaç olabilir?'],
          solution: `Sol ve sağ alt ağaçların siyah yüksekliği aynı ($b$). Her biri en az $2^{b}-1$, en fazla (yükseklik $\\le 2b$) yaklaşık $4^{b}$ düğüm içerir. Dolayısıyla daha küçük taraf en az $\\approx 2^b \\approx \\sqrt{\\text{büyük taraf}}$’tır: kökün sırası $i = \\Omega(\\sqrt n)$ olmak zorunda, ama $\\Theta(n)$ olması gerekmez. (Ders 7 kavram kontrolündeki bir sorudan esinlenmiştir.)`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: 1, 2, …, 15 ve 1, 2, …, 31 anahtarlarını sırayla (a) sıradan bir BST’ye, (b) bir kırmızı-siyah ağaca ekleyin. Her durumda yükseklik (kökten en derin düğüme kenar sayısı) kaçtır? Mükemmel dengeli bir ağaçla karşılaştırın. (Karşılaştırma panelinde kontrol edin.)`,
          hints: ['Sıradan BST’de sıralı ekleme bir zincir verir.', 'Kırmızı-siyah ağaçta yükseklik $\\le 2\\log_2(n + 1)$.'],
          solution: `(a) BST: zincir, yükseklik $n - 1$: 14 ve 30. (b) Kırmızı-siyah ağaç: 5 ve 7. Mükemmel dengeli ağaç: $\\log_2(n + 1) - 1$, yani 3 ve 4. Kırmızı-siyah ağaç mükemmel değildir, ama sınır $2\\log_2(n + 1)$ (8 ve 10) rahatça sağlanır. Sıralı ekleme, kırmızı-siyah ağaç için en kötü girdi değildir: sağ kenar boyunca kırmızı düğümler birikir ve rotasyonlar onları düzenli olarak dengeler.`,
        },
      ],
      sources: [SRC.l7.notes, SRC.l7.slides, SRC.l7.concept],
    },
  ],
}
