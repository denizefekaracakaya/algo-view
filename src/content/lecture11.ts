import type { Lecture } from './types'
import { SRC } from './sources'
import { DIJKSTRA_CODE } from '../engines/shortestPaths'

export const lecture11: Lecture = {
  n: 11,
  title: 'Dijkstra ve Bellman–Ford',
  titleEn: 'Dijkstra and Bellman-Ford',
  date: '11 Şubat 2026',
  blurb: 'Negatif olmayan ağırlıklarla tek kaynaklı en kısa yollar: Dijkstra; negatif kenarlar için Bellman–Ford’a hazırlık.',
  lessons: [
    {
      id: 'l11-dijkstra',
      lecture: 11,
      title: 'Dijkstra algoritması',
      titleEn: 'Dijkstra’s algorithm',
      summary: 'Tahminleri gevşetmek, en küçük tahmini kesinleştirmek ve öncelik kuyruğu seçimleri.',
      minutes: 55,
      objectives: [
        'Dijkstra’nın iki değişmezini ($d[t] \\ge d(s, t)$; bitmiş düğümlerde eşitlik) ifade etmek.',
        'Algoritmayı adım adım çalıştırıp gevşetme (relax) işlemini açıklamak.',
        'Doğruluk kanıtında negatif olmayan ağırlıkların nerede kullanıldığını göstermek ve negatif bir kenarla başarısızlığını görmek.',
        'Dizi, kırmızı-siyah ağaç ve Fibonacci yığını ile çalışma sürelerini karşılaştırmak.',
        'Amortize süre kavramını ikili sayaç örneğiyle açıklamak.',
      ],
      prerequisites: ['BFS (Ders 9)', 'Kırmızı-siyah ağaçlar (Ders 7)'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: ağırlıklı BFS',
          label: 'intuition',
          body: `BFS, kenar **sayısını** en aza indirir. Ama yol ağlarında, ağ gecikmelerinde ya da uçuş fiyatlarında kenarların farklı **ağırlıkları** vardır: uzun tek bir kenar, kısa iki kenardan pahalı olabilir.

Dijkstra’nın fikri: kaynaktan dışarı doğru, **en yakın** henüz kesinleşmemiş düğümü sürekli seçerek ilerle. Her düğüm için bir **tahmin** $d[t]$ tut; bir düğümü seçtiğinde ondan çıkan kenarlarla komşuların tahminlerini iyileştir (**gevşet**). Ağırlıklar negatif değilse, seçilen düğümün tahmini artık kesinleşmiştir.

Bu derste tüm ağırlıklar **negatif olmayan** sayılardır: $w(u, v) \\ge 0$.`,
        },
        {
          kind: 'pseudocode',
          title: 'Dijkstra(G, s) (notlar, Algoritma 1)',
          code: DIJKSTRA_CODE,
          body: `$F$: henüz kesinleşmemiş düğümler, $D$: kesinleşmiş düğümler. Gevşetme: $d[y] \\leftarrow \\min(d[y],\\ d[x] + w(x, y))$. Yolu da hatırlamak için $d[y]$ her değiştiğinde $p(y) = x$ yapılır; $p$ işaretçileri bir **en kısa yollar ağacı** oluşturur.`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Dijkstra’nın her an koruduğu değişmez hangisidir?',
              options: [
                '$d[t] \\le d(s, t)$ her $t$ için',
                '$d[t] \\ge d(s, t)$ her $t$ için; $t$ bittiğinde $d[t] = d(s, t)$',
                '$d[t]$ yalnızca bir kez değişir',
                '$d[t]$, $t$’ye giden kenar sayısıdır',
              ],
              answer: 1,
              hint: 'Bir tahmin, gerçekten var olan bir yolun ağırlığıdır.',
              explanation: 'Sonlu her $d[t]$, $s$’den $t$’ye gerçek bir yolun ağırlığıdır (Claim 1), dolayısıyla en kısa yoldan küçük olamaz. Kesinleşme anında eşitlik sağlanır (Claim 2).',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Dijkstra görselleştiricisi',
          viz: 'dijkstra',
          tasks: [
            '“Negatif olmayan ağırlıklar” grafiğini oynatın: düğümler hangi sırayla kesinleşiyor? Bu sıra uzaklıklara göre artan mı?',
            '$a$’nın tahmini kaç kez değişiyor ve neden?',
            '“Bir negatif kenar” grafiğine geçin: Dijkstra’nın $t$ için bulduğu değeri yan paneldeki gerçek uzaklıkla karşılaştırın.',
            '**Tahmin modu**nda her adımda $F$’ten hangi düğümün seçileceğini tahmin edin.',
          ],
          body: `Her düğümün altında o anki tahmin $d$ yazar. Yeşil düğümler kesinleşmiştir ($D$), mavi olanlar sonlu bir tahmine sahiptir. Gevşetilen kenar sarı, en kısa yollar ağacının kenarları yeşildir; negatif kenarlar kırmızıdır.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Görselleştiricinin ilk grafiğinde $d(s, t)$ kaçtır?',
              answer: 10,
              hint: '$s \\to b \\to a$ yolu $s \\to a$’dan kısadır.',
              explanation: '$s \\to b \\to a \\to d \\to t$: $1 + 2 + 6 + 1 = 10$. ($s \\to b \\to a \\to c \\to t$ ise $1 + 2 + 5 + 3 = 11$.)',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Neden doğru? (Claim 1 ve 2)',
          label: 'formalProof',
          proof: [
            { title: 'Claim 1', body: 'Her an $d[u] \\ge d(s, u)$. Tümevarım: başta $d[s] = 0$, diğerleri $\\infty$. $d[u]$, $d[x] + w(x, u)$ yapıldığında hipoteze göre $s$’den $x$’e ağırlığı $d[x]$ olan bir yol var; $(x, u)$ kenarıyla $u$’ya ağırlığı $d[u]$ olan bir yol oluşur. Bir yolun ağırlığı en kısa yoldan küçük olamaz.' },
            { title: 'Claim 2: kurulum', body: '$x$, $F$’in en küçük tahminli düğümü ve şimdi $D$’ye taşınıyor. $D$’deki her $y$ için $d[y] = d(s, y)$ olduğunu varsayalım. $p$: $s$’den $x$’e en kısa bir yol. $z$: $p$ üzerinde $d[z] = d(s, z)$ olan, $x$’e en yakın düğüm ($s$ en azından böyledir).' },
            { title: 'z = x ise', body: 'Zaten $d[x] = d(s, x)$: bitti.' },
            { title: 'z ≠ x ise', body: '$z\'$, $p$ üzerinde $z$’den sonraki düğüm olsun. $d[z] = d(s, z) \\le d(s, x) \\le d[x]$. İlk eşitsizlik, yolun $z$’den $x$’e olan kısmının ağırlığının **negatif olmamasından** gelir. Eşitlik varsa $d[x] = d(s, x)$ ve bitti.' },
            { title: 'Çelişki', body: '$d[z] < d[x]$ ise $x$ en küçük tahminli olduğundan $z \\notin F$, yani $z \\in D$: $(z, z\')$ kenarı zaten gevşetilmiştir ve $d[z\'] \\le d(s, z) + w(z, z\') = d(s, z\')$. Bu, $z$’nin seçimiyle çelişir. Demek ki $d[x] = d(s, x)$.' },
          ],
        },
        {
          kind: 'formal',
          title: 'Negatif kenarlar ve negatif döngüler',
          box: 'warn',
          label: 'formal',
          body: `Kanıt iki yerde $w \\ge 0$ kullandı. Negatif bir kenar varsa Dijkstra bir düğümü **erken** kesinleştirebilir: görselleştiricinin ikinci grafiğinde $a$, $d[a] = 2$ ile kesinleşir; oysa $s \\to b \\to a$ yolu $5 - 4 = 1$’dir ve $t$’nin gerçek uzaklığı 2’dir, Dijkstra 3 bulur.

Daha büyük sorun **negatif döngülerdir**: toplam ağırlığı negatif bir döngü varsa, üzerinde dolaşarak yolu istediğimiz kadar ucuzlatabiliriz; en kısa yol tanımsızdır. Negatif döngü yoksa negatif kenarlar sorun değildir — ama Dijkstra yerine **Bellman–Ford** gerekir (Ders 12): negatif döngüyü tespit eder ya da doğru uzaklıkları bulur, $O(nm)$ sürede.`,
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Görselleştiricinin “Bir negatif kenar” grafiğinde $s$’den $t$’ye **gerçek** en kısa yolun ağırlığı kaçtır?',
              answer: 2,
              hint: '$s \\to b \\to a \\to t$ yolunu deneyin.',
              explanation: '$5 + (-4) + 1 = 2$. Dijkstra $a$’yı $d[a] = 2$ ile erkenden kesinleştirdiği ve $t$’yi ondan önce bitirdiği için 3 bulur.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Uygulama: öncelik kuyruğu seçimi',
          body: `Toplam iş: $n$ kez FindMin + DeleteMin, en çok $m$ kez DecreaseKey:
$$n \\cdot (T_{\\text{FindMin}} + T_{\\text{DeleteMin}}) + m \\cdot T_{\\text{DecreaseKey}}.$$

- **Dizi:** DecreaseKey $O(1)$, FindMin/DeleteMin $O(n)$ → $O(n^2 + m) = O(n^2)$. Yoğun grafikler için iyi.
- **Kırmızı-siyah ağaç (veya ikili yığın):** hepsi $O(\\log n)$ (DecreaseKey = sil + yeniden ekle) → $O((n + m)\\log n)$. Seyrek grafikler için iyi; $m = \\Theta(n^2)$ ise diziden yavaş.
- **Fibonacci yığını:** DecreaseKey ve FindMin **amortize** $O(1)$, DeleteMin amortize $O(\\log n)$ → $O(m + n\\log n)$.

**Amortize süre:** boş yapıdan başlayan herhangi $L$ işlem toplam $O(L \\cdot t(n))$ sürüyorsa işlem başına amortize süre $t(n)$’dir; tek bir işlem pahalı olabilir, ama ortalaması değil. Örnek: ikili sayacı $n$ kez artırmak. Bazı artırmalar ($0111 \\to 1000$) çok bit değiştirir, ama her 1’e bir “kredi” iliştiren muhasebe yöntemiyle toplam iş $O(n)$, artırma başına amortize $O(1)$.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: '0’dan başlayan bir ikili sayaç 16 kez artırılıyor. Toplam kaç bit değişir (0→1 ve 1→0 dahil)?',
              answer: 31,
              hint: 'En düşük bit her seferinde, bir sonraki her iki seferde bir değişir…',
              explanation: '$16 + 8 + 4 + 2 + 1 = 31 < 2 \\cdot 16$. Artırma başına ortalama 2’den az: amortize $O(1)$.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: en kısa yollar',
          body: `- **Navigasyon uygulamaları** Dijkstra’nın hızlandırılmış türevlerini kullanır: hedefe doğru yönlendiren A*, iki uçtan aynı anda arama ve önceden hesaplanmış “kısayol” kenarları (contraction hierarchies). Kıta ölçeğinde yollar milisaniyeler içinde bulunur.
- **İnternet yönlendirme:** OSPF protokolünde her yönlendirici ağın haritasını bilir ve Dijkstra ile en kısa yolları hesaplar.
- **Negatif ağırlıklar:** döviz kurlarında $-\\log(\\text{kur})$ ağırlıklarıyla negatif bir döngü, kârlı bir arbitraj fırsatı demektir; Bellman–Ford bunu tespit eder.`,
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: uzaklıklar ve ebeveynler',
          label: 'formal',
          body: `Kendi örneğimiz: $s \\to a$ (4), $s \\to b$ (1), $b \\to a$ (2), $a \\to c$ (1), $b \\to c$ (5). Dijkstra’yı çalıştırırken her $d[v]$ güncellemesinde $v$’nin **ebeveynini** de ($\\pi[v]$, güncellemeyi yapan düğüm) kaydedelim; yolları sonradan buradan okuyacağız.`,
          proof: [
            { title: 's kesinleşir (d = 0)', body: '$d[a] = 4$ ($\\pi[a] = s$), $d[b] = 1$ ($\\pi[b] = s$).' },
            { title: 'b kesinleşir (d = 1)', body: '$a$: $1 + 2 = 3 < 4$ → $d[a] = 3$, $\\pi[a] = b$. $c$: $1 + 5 = 6$ → $d[c] = 6$, $\\pi[c] = b$.' },
            { title: 'a kesinleşir (d = 3)', body: '$c$: $3 + 1 = 4 < 6$ → $d[c] = 4$, $\\pi[c] = a$. Son olarak $c$ kesinleşir ($d = 4$).' },
            { title: 'Yolu geri okumak', body: '$c$’den ebeveynleri izle: $c \\leftarrow a \\leftarrow b \\leftarrow s$. Ters çevirince $s \\to b \\to a \\to c$, uzunluk $1 + 2 + 1 = 4$. Ebeveyn kenarları birlikte bir **en kısa yollar ağacı** oluşturur: her düğümün tek ebeveyni olması yeter, çünkü en kısa bir yolun her ön eki de en kısa yoldur.' },
          ],
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'Bu örnekte $d[c]$ kaç kez güncellenir (sonsuzdan ilk değerine geçiş de dahil)?',
              answer: 2,
              hint: 'Önce $b$’den, sonra $a$’dan.',
              explanation: '$\\infty \\to 6$ ($b$ kesinleşince) ve $6 \\to 4$ ($a$ kesinleşince). Son ebeveyn $\\pi[c] = a$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Dijkstra’yı negatif kenarlı grafiklerde kullanmak (negatif döngü olmasa bile yanlış sonuç verebilir).
- Bir düğümü, tahmini **ilk değiştiğinde** kesinleşmiş saymak: kesinleşme, $F$’ten **seçildiği** andır.
- Süreyi bağlamsız “$O(m\\log n)$” diye ezberlemek: süre öncelik kuyruğuna bağlıdır; dizi ile $O(n^2)$, Fibonacci yığınıyla $O(m + n\\log n)$.
- Amortize süreyi ortalama durum (rastgele girdi) ile karıştırmak: amortize analizde rastgelelik yoktur; her işlem dizisi için toplam garanti edilir.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Dijkstra, $F$ kümesi kırmızı-siyah ağaçta tutularak uygulanırsa çalışma süresi nedir?',
          options: ['$O(n + m)$', '$O((n + m)\\log n)$', '$O(n^2)$', '$O(nm)$'],
          answer: 1,
          hint: '$n + m$ işlemin her biri $O(\\log n)$.',
          explanation: 'FindMin, DeleteMin ve DecreaseKey (sil + ekle) $O(\\log n)$; $O(n)$ + $O(m)$ işlem: $O((n + m)\\log n)$.',
          feedback: { 3: 'Bu Bellman–Ford’un süresidir.' },
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Yoğun bir grafikte ($m = \\Theta(n^2)$) Dijkstra için hangisi en iyi asimptotik süreyi verir?',
          options: ['Kırmızı-siyah ağaç', 'Sıralanmamış dizi', 'Bağlı liste ve her seferinde sıralama', 'Fark etmez'],
          answer: 1,
          hint: '$(n + m)\\log n$ ile $n^2$’yi $m = n^2$ için karşılaştırın.',
          explanation: 'Dizi ile $O(n^2)$ = girdi boyutu kadar; kırmızı-siyah ağaçla $O(n^2 \\log n)$. (Fibonacci yığını da $O(n^2)$ verir ama çok daha karmaşıktır.)',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Dijkstra’nın doğruluk kanıtında “$d(s, z) \\le d(s, x)$” eşitsizliği neye dayanır?',
          options: ['$z$’nin $D$’de olmasına', 'Ağırlıkların negatif olmamasına', 'Grafiğin yönsüz olmasına', 'Öncelik kuyruğunun kırmızı-siyah ağaç olmasına'],
          answer: 1,
          hint: '$z$, $s \\to x$ en kısa yolunun üzerinde ve $x$’ten önce.',
          explanation: 'Yolun $z$’den $x$’e olan kısmının ağırlığı $\\ge 0$ olduğundan önek, yolun tamamından ağır olamaz. Negatif bir kenar bu adımı bozar.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: '0’dan başlayan bir ikili sayaç $n = 1000$ kez artırılıyor. Notlardaki kredi (muhasebe) argümanı toplam bit değişimi için hangi üst sınırı verir?',
          answer: 2000,
          hint: 'Her artırma 2 kredi yatırır.',
          explanation: 'Muhasebe yöntemi: her artırma 2 kredi getirir, her bit değişimi 1 kredi harcar; toplam en fazla $2n = 2000$. (Gerçek değer biraz daha azdır: $\\sum_i \\lfloor 1000/2^i \\rfloor = 1994$.)',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: yönlü kenarlar s→a (7), s→b (2), b→a (3), a→c (1), b→c (8), c→t (2), b→t (9). $s$’den Dijkstra’yı elle çalıştırın: her adımda seçilen düğümü ve tahminleri yazın. Son en kısa yollar ağacını çizin.`,
          hints: ['İlk seçilen $s$, sonra $b$ (tahmin 2).', '$a$’nın tahmini 7’den 5’e iner.'],
          solution: `Başta $d = (s: 0, a: \\infty, b: \\infty, c: \\infty, t: \\infty)$. $s$ seçilir: $a = 7$, $b = 2$. $b$ seçilir (2): $a = \\min(7, 5) = 5$, $c = 10$, $t = 11$. $a$ seçilir (5): $c = \\min(10, 6) = 6$. $c$ seçilir (6): $t = \\min(11, 8) = 8$. $t$ seçilir (8). Sonuç: $s$ 0, $b$ 2, $a$ 5, $c$ 6, $t$ 8. Ağaç: s→b, b→a, a→c, c→t.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: yukarıdaki grafikte ($s \\to a$ 4, $s \\to b$ 1, $b \\to a$ 2, $a \\to c$ 1, $b \\to c$ 5) $b \\to a$ kenarının ağırlığı 2’den 4’e çıkarsa uzaklıklar ve en kısa yollar ağacı nasıl değişir? Eşitlik olursa ne olur?`,
          hints: ['$s \\to a$ doğrudan 4, $s \\to b \\to a$ artık $1 + 4 = 5$.', '$c$ için iki yolu karşılaştırın: $s \\to a \\to c$ ve $s \\to b \\to c$.'],
          solution: `Artık $d[a] = 4$ ($\\pi[a] = s$, doğrudan kenar). $c$ için $s \\to a \\to c = 4 + 1 = 5$ ve $s \\to b \\to c = 1 + 5 = 6$: $d[c] = 5$, $\\pi[c] = a$. Yeni ağaç: $s \\to a$, $s \\to b$, $a \\to c$. Eşitlik olsaydı (örneğin $b \\to a$ ağırlığı 3: $1 + 3 = 4$) iki yol da en kısa olurdu; Dijkstra yalnızca **kesin iyileşmede** ($<$) günceller, yani hangi ebeveynin kalacağı işleme sırasına bağlıdır. Uzaklıklar ise her durumda tektir.`,
        },
      ],
      sources: [SRC.l11.notes, SRC.l11.slides, SRC.l11.pre, SRC.l11.notebook, SRC.l11.concept],
    },
  ],
}
