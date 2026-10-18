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
      minutes: 30,
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
          label: 'Sezgi',
          body: `Sıralı dizide arama $O(\\log n)$ ama ekleme/silme $O(n)$; bağlı listede ekleme $O(1)$ ama arama $O(n)$. **Dengeli** bir ikili arama ağacı üçünü de $O(\\log n)$’de yapar.

BST’deki her düğüm, kendi alt ağacı için bir QuickSort pivotu gibidir: sol alt ağaç $A_<$, sağ alt ağaç $A_>$.`,
        },
        {
          kind: 'formal',
          title: 'Tanım (Ders 7 notları)',
          box: 'formal',
          label: 'Biçimsel',
          body: `Her $x$ düğümünün bir anahtarı $key(x)$, ebeveyni $p(x)$ ve çocukları $left(x)$, $right(x)$ vardır (yoksa NIL). **BST özelliği:** her $x$ için $left(x)$ altındaki tüm anahtarlar $< key(x)$, $right(x)$ altındakiler $> key(x)$. Bu derste anahtarlar farklıdır.

**Yükseklik:** kökten bir yaprağa en uzun yolun kenar sayısı (slaytlardaki tanım).`,
        },
        {
          kind: 'viz',
          title: 'BST görselleştiricisi',
          viz: 'bst',
          body: `Bir ekleme sırası girin (ağaç baştan, adım adım kurulur) ya da hazır ağaçta işlem çalıştırın. Ondalıklı bir anahtar arayarak (ör. 4.5) aramanın nerede durduğunu görün. “Sıralı” ekleme sırasının nasıl bir ağaç ürettiğine ve yüksekliğe dikkat edin. Tahmin modunda her karşılaştırmada yönü tahmin edin.`,
        },
        {
          kind: 'pseudocode',
          title: 'search (notlardaki Algoritma 4)',
          code: BST_SEARCH_CODE,
          body: `Bu search, anahtar ağaçta yoksa **eklenseydi ebeveyni olacak** düğümü döndürür (Claim 7). insert bunu kullanır; delete önce search ile düğümü bulur.`,
        },
        {
          kind: 'steps',
          title: 'Silme: üç durum',
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
      ],
      sources: [SRC.l7.pre, SRC.l7.notes, SRC.l7.slides, SRC.l7.concept, SRC.sec.s4],
    },
    {
      id: 'l7-redblack',
      lecture: 7,
      title: 'Kırmızı-siyah ağaçlar',
      titleEn: 'Red-black trees',
      summary: 'Beş özellik, rotasyonlar ve yeniden boyama: yükseklik $\\le 2\\log_2(n+1)$.',
      minutes: 45,
      objectives: [
        'Beş kırmızı-siyah özelliği ifade etmek ve bir ağaçta ihlalleri bulmak.',
        'Rotasyonun BST özelliğini koruyan $O(1)$ bir yerel işlem olduğunu görmek.',
        'Ekleme sırasında Durum 1, 2, 3’ü tanımak ve her durumun hangi özelliği nasıl onardığını açıklamak.',
        'Siyah yükseklik argümanıyla $h \\le 2\\log_2(n+1)$ sınırını kanıtlamak ve bunu $O(\\log n)$ işlem süresine bağlamak.',
      ],
      prerequisites: ['İkili arama ağaçları', 'Tümevarım'],
      sections: [
        {
          kind: 'formal',
          title: 'Tanım (Ders 7 notları, Tanım 10)',
          box: 'formal',
          label: 'Biçimsel',
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
          title: 'Ekleme görselleştiricisi',
          viz: 'rb',
          body: `Ağacı bir sırayla kurun ya da tek tek anahtar ekleyin. Her adımda x, p (ebeveyn), u (amca), g (büyük ebeveyn) etiketlenir ve sağdaki denetleyici o anki ağacın hangi özellikleri sağladığını gösterir — düzeltme sırasında geçici ihlalleri görebilirsiniz. Tahmin modunda her durumdan önce hangi durumun uygulanacağını tahmin edin. “Sıralı 1…10” girdisini deneyin.`,
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
          kind: 'correctness',
          title: 'Yükseklik garantisi (Claim 16)',
          label: 'Biçimsel kanıt',
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
      ],
      sources: [SRC.l7.notes, SRC.l7.slides, SRC.l7.concept, SRC.hw.hw4],
    },
    {
      id: 'l7-compare',
      lecture: 7,
      title: 'BST ve kırmızı-siyah ağaç karşılaştırması',
      titleEn: 'Comparing a BST and a red-black tree',
      summary: 'Aynı ekleme sırası, çok farklı yükseklikler.',
      minutes: 10,
      objectives: [
        'Aynı ekleme sırasının sıradan bir BST ve bir kırmızı-siyah ağaçta ürettiği şekilleri karşılaştırmak.',
        'Yükseklik ile arama maliyeti arasındaki bağı ölçümlerle gözlemlemek ve kanıtlanmış garantiyle ilişkilendirmek.',
      ],
      prerequisites: ['İkili arama ağaçları', 'Kırmızı-siyah ağaçlar'],
      sections: [
        {
          kind: 'viz',
          title: 'Yan yana karşılaştırma',
          viz: 'treeCompare',
          body: `Sıralı, ters sıralı ve karışık ekleme sıralarını deneyin. Ortalama ve en kötü arama karşılaştırma sayısını, yüksekliği ve garanti edilen sınırı inceleyin.`,
        },
        {
          kind: 'text',
          title: 'Ne gözlemlemeliyiz?',
          body: `- Sıralı ekleme sıradan BST’yi bir zincire çevirir: yükseklik $n - 1$, arama $\\Theta(n)$.
- Kırmızı-siyah ağaç aynı sırada rotasyonlarla dengede kalır: yükseklik $\\le 2\\log_2(n+1)$.
- Ölçülen değerler tek bir sıraya aittir; kırmızı-siyah ağacın sınırı ise **her** sıra için kanıtlanmıştır.`,
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
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Bir kırmızı-siyah ağacın kökü, sıralı anahtarlar arasında $i$. sırada olsun. $i$ için ne söyleyebiliriz: $i = \\Theta(n)$ mi? Karşılaştırma panelinde sıralı eklemelerde kökün nerede kaldığını gözlemleyin.`,
          hints: ['Kökün sol ve sağ alt ağaçlarının siyah yükseklikleri eşittir.', 'Her alt ağaçta en az $2^{b} - 1$ düğüm var; en fazla kaç olabilir?'],
          solution: `Sol ve sağ alt ağaçların siyah yüksekliği aynı ($b$). Her biri en az $2^{b}-1$, en fazla (yükseklik $\\le 2b$) yaklaşık $4^{b}$ düğüm içerir. Dolayısıyla daha küçük taraf en az $\\approx 2^b \\approx \\sqrt{\\text{büyük taraf}}$’tır: kökün sırası $i = \\Omega(\\sqrt n)$ olmak zorunda, ama $\\Theta(n)$ olması gerekmez. (Ders 7 kavram kontrolündeki bir sorudan esinlenmiştir.)`,
        },
      ],
      sources: [SRC.l7.notes, SRC.l7.slides, SRC.l7.concept],
    },
  ],
}
