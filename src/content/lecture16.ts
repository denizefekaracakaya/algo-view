import type { Lecture } from './types'
import { SRC } from './sources'
import { FF_CODE } from '../engines/maxFlow'

export const lecture16: Lecture = {
  n: 16,
  title: 'Maksimum akış ve Ford–Fulkerson',
  titleEn: 'Max-Flow and the Ford-Fulkerson Algorithm',
  date: '4 Mart 2026',
  blurb: 'Bir ağdan geçebilecek en büyük akış, en dar kesmenin kapasitesine eşittir.',
  lessons: [
    {
      id: 'l16-maxflow',
      lecture: 16,
      title: 'Maksimum akış, minimum kesme ve Ford–Fulkerson',
      titleEn: 'Max flow, min cut and Ford–Fulkerson',
      summary: 'Akış kısıtları, artık grafik, artırıcı yollar ve maksimum akış–minimum kesme teoremi.',
      minutes: 60,
      objectives: [
        'Akışı (kapasite ve korunum kısıtları) ve $s$–$t$ kesmesini tanımlamak.',
        'Her akışın her kesmeden küçük ya da eşit olduğunu (Lemma 2) göstermek.',
        'Artık grafiği kurmak ve bir artırıcı yol boyunca akışı artırmak.',
        'Ford–Fulkerson’ın neden doğru olduğunu ve maksimum akış–minimum kesme teoremini açıklamak.',
        'İki parçalı eşleştirmeyi bir akış problemine çevirmek.',
      ],
      prerequisites: ['BFS ve DFS (Ders 9)', 'Yönlü grafikler'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: borulardan geçebilecek en çok su',
          label: 'intuition',
          body: `Bir kaynaktan ($s$) bir hedefe ($t$) borularla su taşıdığımızı düşünün; her borunun bir **kapasitesi** var. Ara noktalarda su birikemez: giren kadar çıkmalı. Saniyede en çok ne kadar su gönderebiliriz?

Tersten bakalım: ağı ikiye ayıran bir “bıçak darbesi” ($s$ bir tarafta, $t$ diğerinde) düşünün. $s$ tarafından $t$ tarafına giden boruların kapasiteleri toplamı, geçebilecek suyu sınırlar. En dar böyle bir **kesme** en büyük akışı belirler — ve şaşırtıcı biçimde, bu sınıra her zaman ulaşılabilir.

Tarihçe: Soğuk Savaş’ta ABD Hava Kuvvetleri, Sovyet demiryolu ağında hangi hatların kesilmesinin malzeme akışını en çok azaltacağını bu sorularla incelemişti.`,
        },
        {
          kind: 'formal',
          title: 'Akış ve kesme (Ders 16 notları)',
          box: 'formal',
          label: 'formal',
          body: `Yönlü $G = (V, E)$, kapasiteler $c: E \\to \\mathbb{R}_{\\ge 0}$, kaynak $s$ ve hedef $t$. Bir **akış** $f: E \\to \\mathbb{R}_{\\ge 0}$:

1. **Kapasite:** her $(u, v) \\in E$ için $0 \\le f(u, v) \\le c(u, v)$.
2. **Korunum:** $s$ ve $t$ dışındaki her $v$ için $\\sum_{x} f(x, v) = \\sum_{y} f(v, y)$ (giren = çıkan).

Akışın **değeri** $|f|$, $s$’den çıkan toplam akıştır (girenler çıkarılarak). Bir **$s$–$t$ kesmesi** $V = S \\cup T$, $s \\in S$, $t \\in T$; kapasitesi
$$c(S, T) = \\sum_{x \\in S,\\ y \\in T} c(x, y)$$
— yalnızca $S$’den $T$’ye giden kenarlar sayılır.

**Lemma 2:** her akış $f$ ve her kesme $(S, T)$ için $|f| \\le c(S, T)$. Kanıt fikri: korunum sayesinde $|f|$, kesmeyi $S \\to T$ yönünde geçen akış eksi $T \\to S$ yönünde geçen akıştır; bu da en fazla $S \\to T$ kenarlarının kapasitesidir.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Görselleştiricideki klasik ağda $S = \\{s\\}$ kesmesinin kapasitesi kaçtır? ($s \\to a$: 16, $s \\to b$: 13)',
              answer: 29,
              hint: 'Yalnızca $s$’den çıkan kenarlar.',
              explanation: '$16 + 13 = 29$. Bu bir üst sınırdır; gerçek maksimum akış daha küçüktür (23), çünkü daha dar bir kesme var.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Artık grafik',
          box: 'info',
          label: 'formal',
          body: `Mevcut bir $f$ akışını nasıl iyileştiririz? **Artık kapasite**:
$$c_f(u, v) = \\begin{cases} c(u, v) - f(u, v) & (u, v) \\in E \\\\ f(v, u) & (v, u) \\in E \\\\ 0 & \\text{değilse} \\end{cases}$$
İlk satır “bu kenardan daha ne kadar gönderebilirim?”, ikinci satır “bu kenardan gönderdiğimin ne kadarını **geri alabilirim**?”. Geri alma kritik: ilk seçtiğimiz yollar yanlış olabilir.

**Artık grafik** $G_f$: $c_f(u, v) > 0$ olan kenarlar. $G_f$’te $s$’den $t$’ye bir yola **artırıcı yol** denir. (Notlardaki gibi $G$’de hem $(u, v)$ hem $(v, u)$ olmadığını varsayıyoruz; varsa araya yeni bir düğüm konur.)`,
        },
        {
          kind: 'pseudocode',
          title: 'Ford–Fulkerson (notlar, Algoritma 1)',
          code: FF_CODE,
          body: `Artırma: $P$ üzerindeki en küçük artık kapasite $F$ olsun. $P$’deki ileri kenarlarda akışı $F$ artır, ters kenarların karşılığı olan $G$ kenarlarında $F$ azalt. Yeni akış yine geçerlidir ve değeri $F > 0$ kadar büyür (Lemma 6).`,
        },
        {
          kind: 'viz',
          title: 'Ford–Fulkerson görselleştiricisi',
          viz: 'maxFlow',
          tasks: [
            'Klasik ağda BFS ile yol seçerek oynatın: her artırıcı yolun darboğazı kaç? Son akış değeri?',
            'Algoritma bittiğinde $S$ kümesi (mavi düğümler) ve kırmızı kenarlar: kırmızı kenarların kapasiteleri toplamı akışa eşit mi?',
            '**Artık grafiği göster** kutusunu işaretleyin: ters (kesikli mor) kenarlar ne zaman ortaya çıkıyor? Bir yol ters kenar kullanıyor mu?',
            '“Kötü yol seçimi tuzağı” ağında BFS ile DFS’in kaç artırma yaptığını karşılaştırın.',
            '“İki parçalı eşleştirme” ağında son akıştaki dolu orta kenarlar hangi eşleştirmeyi veriyor?',
          ],
          body: `Kenar etiketleri **akış/kapasite**dir. Sarı yol o anki artırıcı yoldur; yeşil kenarlar doludur (akış = kapasite). Her artırmadan önce artık grafik gösterilir. Bitişte $s$’den artık grafikte ulaşılabilen düğümler $S$ (mavi), diğerleri $T$ (turuncu) olur.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Klasik ağdaki maksimum akışın değeri kaçtır?',
              answer: 23,
              hint: 'Algoritma bitince $|f|$’yi okuyun ya da en dar kesmeyi bulun.',
              explanation: 'Maksimum akış 23; bitişteki $S = \\{s, a, b, d\\}$ kesmesinin kapasitesi $a \\to c$ (12) + $d \\to c$ (7) + $d \\to t$ (4) = 23.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Maksimum akış–minimum kesme teoremi',
          label: 'formalProof',
          proof: [
            { title: 'Lemma 6 (artırma işe yarar)', body: '$G_f$’te bir $s \\to t$ yolu varsa $F = \\min_{e \\in P} c_f(e) > 0$ kadar artırılmış $f\'$ geçerli bir akıştır: kapasiteler aşılmaz ($F \\le c_f$) ve her ara düğüme giren ile çıkan aynı miktarda değişir. $|f\'| = |f| + F$.' },
            { title: 'Lemma 5 (yol yoksa maksimum)', body: '$G_f$’te $t$, $s$’den ulaşılamıyorsa $S$ = ulaşılabilen düğümler, $T = V - S$. $S \\to T$ yönündeki her $G$ kenarı dolu ($c_f = 0$ ⇒ $f = c$), $T \\to S$ yönündeki her kenarda akış 0 (yoksa ters artık kenar olurdu).' },
            { title: 'Eşitlik', body: 'Lemma 2’nin hesabına göre $|f| = \\sum_{S \\to T} f - \\sum_{T \\to S} f = c(S, T) - 0$.' },
            { title: 'Sonuç (Teorem 4)', body: 'Her akış her kesmeden küçük olduğu için (Lemma 2), $|f| = c(S, T)$ olan bir akış maksimum, kesme de minimumdur. Ford–Fulkerson durduğunda tam olarak böyle bir çift bulmuş olur: **maksimum akış = minimum kesme**.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Kaç artırma?',
          body: `Her artırıcı yol $O(m)$’de (BFS/DFS) bulunur. Soru, kaç artırma yapıldığıdır.

- **Tam sayı kapasiteler, herhangi bir yol:** her artırma en az 1 ekler → en fazla $|f^*|$ artırma, $O(|f^*| \\cdot m)$. Kapasiteler büyükse çok yavaş olabilir; irrasyonel kapasitelerde algoritma durmayabilir bile.
- **En kısa yol (BFS) — Edmonds–Karp:** artık grafikte uzaklıklar hiç azalmaz; her kenar en fazla $n/2$ kez “kaybolur”. En fazla $O(nm)$ artırma → $O(nm(n + m))$.
- **En şişman yol:** darboğazı en büyük yolu seçmek → $O(m \\log |f^*|)$ artırma.

**Tam sayılık:** kapasiteler tam sayıysa Ford–Fulkerson’ın bulduğu maksimum akış da tam sayılıdır. Eşleştirme uygulaması buna dayanır.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Kapasiteleri 100 olan dört kenar ve ortada kapasitesi 1 olan bir kenar var (görselleştiricideki tuzak ağı). En kötü yol seçimleriyle Ford–Fulkerson kaç artırma yapabilir?',
              options: ['2', '4', '200', 'Sonsuz'],
              answer: 2,
              hint: 'Her seferinde ortadaki 1’lik kenarı (bir ileri, bir geri) kullanan bir yol seçilirse?',
              explanation: 'Her artırma yalnızca 1 birim ekler ve akış 200’e ulaşana kadar 200 artırma gerekir. BFS (en kısa yol) ise 2 artırmayla biter.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Uygulama: iki parçalı eşleştirme',
          box: 'info',
          label: 'formal',
          body: `İki parçalı bir grafikte ($V_1$ ve $V_2$ arasında kenarlar) bir **eşleştirme**, uçları ortak olmayan kenarlar kümesidir. En büyük eşleştirmeyi bulmak için:

1. Tüm kenarları $V_1 \\to V_2$ yönüne çevir.
2. Yeni bir $s$ ekle ve her $x \\in V_1$’e $s \\to x$; yeni bir $t$ ekle ve her $y \\in V_2$’den $y \\to t$ kenarı koy.
3. Tüm kapasiteler 1. Maksimum akışı bul.

Tam sayılık sayesinde akış her kenarda 0 ya da 1’dir; her $x$’e en fazla 1 birim girer, yani en fazla bir kenarla eşleşir. Akış değeri = en büyük eşleştirmenin boyutu; $|V_1| = |V_2| = n$ ve akış $n$ ise **mükemmel eşleştirme** vardır. (Birden çok kaynak ya da hedef gerekiyorsa sonsuz kapasiteli kenarlarla tek bir süper kaynak/hedef eklenir.)`,
        },
        {
          kind: 'text',
          title: 'Pratikte',
          body: `- **Ulaşım ve lojistik:** bir yol ya da boru ağının taşıyabileceği en büyük miktar.
- **Atama problemleri:** öğrencileri projelere, işleri makinelere, doktorları vardiyalara atamak (iki parçalı eşleştirme ve türevleri).
- **Görüntü bölütleme:** ön plan/arka plan ayrımı bir minimum kesme problemi olarak çözülür.
- **Ağ güvenilirliği:** iki bilgisayar arasındaki bağlantıyı koparmak için en az kaç hat kesilmeli? Minimum kesme.
- **Spor eleme problemleri:** “Bu takım hâlâ lider olabilir mi?” sorusu bir akış problemine çevrilebilir.`,
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: ters kenarlar neden gerekli?',
          label: 'formal',
          body: `Ters kenarlar olmadan, yalnızca “dolu olmayan bir yol bul ve doldur” diyen açgözlü bir algoritma takılabilir. Kendi örneğimiz, bütün kapasiteler 1: $s \\to a$, $s \\to b$, $a \\to c$, $a \\to d$, $b \\to c$, $c \\to t$, $d \\to t$.`,
          proof: [
            { title: 'Talihsiz ilk yol', body: '$s \\to a \\to c \\to t$ seçilir: akış 1. Şimdi $s \\to a$ ve $c \\to t$ dolu. $b$’den çıkan tek yol $b \\to c$, ama $c \\to t$ dolu: ters kenarsız grafikte başka yol yok. Açgözlü algoritma 1’de durur.' },
            { title: 'Artık grafik', body: 'Ters kenarlarla $c \\to a$ (akışı geri alma) kullanılabilir: $s \\to b \\to c \\to a \\to d \\to t$. Bu yol, $a \\to c$ üzerindeki akışı iptal edip $a$’nın akışını $d$’ye yönlendirir.' },
            { title: 'Sonuç', body: 'Akış 2: $s \\to a \\to d \\to t$ ve $s \\to b \\to c \\to t$. $\\{s\\}$ kesmesinin kapasitesi $1 + 1 = 2$: bu maksimumdur.' },
            { title: 'Ders', body: 'Ters kenarlar, önceki kararları **geri alma** imkânıdır. Ford–Fulkerson’ın hangi yolları seçerse seçsin maksimuma ulaşmasının nedeni budur; açgözlü “doldur ve unut” ise yerel bir tuzağa düşer.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'Bu örnekte ters kenarlar kullanılmaz ve ilk yol $s \\to a \\to c \\to t$ seçilirse açgözlü algoritma hangi akış değerinde takılır?',
              answer: 1,
              hint: '$c \\to t$ dolunca $b$’den $t$’ye bir yol kalıyor mu?',
              explanation: '$b$’nin tek çıkışı $c$, $c$’nin tek çıkışı dolu: akış 1’de kalır. Ters kenarla 2’ye çıkar.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Ters (geri alma) kenarlarını unutmak: onlar olmadan açgözlü yol seçimi optimal olmayan bir akışta takılabilir.
- Kesmenin kapasitesine $T \\to S$ yönündeki kenarları da eklemek: yalnızca $S \\to T$ kenarları sayılır.
- Darboğazı yoldaki en büyük kapasite sanmak: **en küçük** artık kapasitedir.
- Ford–Fulkerson’ın süresinin her zaman polinom olduğunu sanmak: yol seçim kuralı önemlidir.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Herhangi bir akış $f$ ve herhangi bir $s$–$t$ kesmesi $(S, T)$ için hangisi her zaman doğrudur?',
          options: ['$|f| \\ge c(S, T)$', '$|f| \\le c(S, T)$', '$|f| = c(S, T)$', 'Aralarında ilişki yoktur'],
          answer: 1,
          hint: 'Lemma 2.',
          explanation: 'Akışın tamamı kesmeyi $S \\to T$ yönünde geçmek zorundadır; bu kenarların kapasitesi aşılamaz. Eşitlik yalnızca maksimum akış ve minimum kesmede olur.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Artık grafikte $(v, u)$ ters kenarının kapasitesi $f(u, v)$’dir. Bu kenar ne anlama gelir?',
          options: ['$v$’den $u$’ya yeni bir boru', '$(u, v)$’den gönderilen akışın geri alınabilecek kısmı', 'Akışın kaybolduğu yer', 'Kesmeyi geçen kenar'],
          answer: 1,
          hint: 'Gönderilmiş akışı geri almak.',
          explanation: 'Ters kenardan akış “göndermek”, $(u, v)$ üzerindeki akışı azaltmak demektir. Böylece önceki kötü seçimler düzeltilir.',
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'Tüm kapasiteleri 1 olan bir eşleştirme ağında $|V_1| = |V_2| = 5$ ve maksimum akış 4. En büyük eşleştirmede kaç kenar vardır?',
          answer: 4,
          hint: 'Akış değeri = eşleştirme boyutu.',
          explanation: 'Akış birimleri ayrık $s \\to x \\to y \\to t$ yollarıdır; her biri bir eşleştirme kenarıdır. 4 kenar: mükemmel eşleştirme yok.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Tüm kapasiteler tam sayıysa Ford–Fulkerson’ın bulduğu maksimum akış için ne söylenebilir?',
          options: ['Her kenardaki akış tam sayıdır.', 'Akış kesirli olabilir.', 'Akış her zaman 1’dir.', 'Algoritma durmayabilir.'],
          answer: 0,
          hint: 'Darboğazlar hep tam sayıdır.',
          explanation: 'Her darboğaz tam sayı olduğundan her artırma tam sayılık korur; algoritma en fazla $|f^*|$ adımda durur.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: kenarlar s→a (3), s→b (2), a→b (1), a→t (2), b→t (3). Ford–Fulkerson’ı elle çalıştırın (kendi seçtiğiniz yollarla). Maksimum akışı ve bir minimum kesmeyi bulun.`,
          hints: ['Önce s→a→t ve s→b→t.', 'Kalan artık kapasitelerle s→a→b→t mümkün mü?'],
          solution: `s→a→t: darboğaz 2, $|f| = 2$. s→b→t: darboğaz 2, $|f| = 4$. s→a→b→t: artık kapasiteler 1, 1, 1 → $|f| = 5$. Artık grafikte $s$’den çıkan kenarların ikisi de dolu: $S = \\{s\\}$, kapasite $3 + 2 = 5 = |f|$. Maksimum akış 5; $(\\{s\\}, \\{a, b, t\\})$ bir minimum kesmedir ($\\{s, a, b\\}$ de kapasitesi $2 + 3 = 5$ olan bir başka minimum kesmedir).`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: şu ağda ($s \\to a$, $s \\to b$, $a \\to t$, $b \\to t$ kapasite $C = 100$, $a \\to b$ kapasite 1) bütün $s$–$t$ kesmelerini listeleyin ($s$ tarafına $a$ ve $b$’den hangilerinin girdiğine göre). Hangileri minimumdur?`,
          hints: ['Dört kesme: $\\{s\\}$, $\\{s, a\\}$, $\\{s, b\\}$, $\\{s, a, b\\}$.', 'Yalnızca $s$ tarafından $t$ tarafına giden kenarlar sayılır.'],
          solution: `$\\{s\\}$: $s \\to a$ + $s \\to b$ = 200. $\\{s, a\\}$: $s \\to b$ + $a \\to t$ + $a \\to b$ = 201. $\\{s, b\\}$: $s \\to a$ + $b \\to t$ = 200 ($a \\to b$ ters yönde, sayılmaz). $\\{s, a, b\\}$: $a \\to t$ + $b \\to t$ = 200. Üç kesme minimumdur (200) ve maksimum akış–minimum kesme teoremine uygun olarak maksimum akış da 200’dür. Ford–Fulkerson’ın sonunda $s$’den artık grafikte ulaşılabilen düğümler bu minimum kesmelerden birini verir: burada $\\{s\\}$.`,
        },
      ],
      sources: [SRC.l16.notes, SRC.l16.slides, SRC.l16.pre, SRC.l16.concept],
    },
  ],
}
