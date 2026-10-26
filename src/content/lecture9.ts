import type { Lecture } from './types'
import { SRC } from './sources'
import { BFS_CODE, DFS_CODE } from '../engines/graphSearch'

export const lecture9: Lecture = {
  n: 9,
  title: 'Grafikler, BFS ve DFS',
  titleEn: 'Graphs and BFS and DFS',
  date: '4 Şubat 2026',
  blurb: 'Grafikleri saklamak ve dolaşmak: derinlik öncelikli ve genişlik öncelikli arama, ikisi de $O(n + m)$.',
  lessons: [
    {
      id: 'l9-graphs',
      lecture: 9,
      title: 'Grafik gösterimi ve genişlik öncelikli arama (BFS)',
      titleEn: 'Graph representations and breadth-first search (BFS)',
      summary: 'Komşuluk listesi ve matrisi; BFS katmanları ve ağırlıksız en kısa yollar.',
      minutes: 45,
      objectives: [
        'Komşuluk listesi ile komşuluk matrisinin bellek ve sorgu maliyetlerini karşılaştırmak.',
        'BFS’in düğümleri kaynağa uzaklık sırasıyla, katman katman keşfettiğini izlemek.',
        '$L_i = \\{x : d(s, x) = i\\}$ önermesinin tümevarım kanıtını açıklamak.',
        'BFS’in çalışma süresinin $O(n + m)$ olduğunu göstermek.',
      ],
      prerequisites: ['Tümevarım', 'Kuyruk ve yığın veri yapıları'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: grafikler her yerde',
          label: 'intuition',
          body: `Bir **grafik** $G = (V, E)$ düğümlerden ve onları bağlayan kenarlardan oluşur. Yollar ve kavşaklar, arkadaşlık ağları, web sayfaları ve bağlantıları, ders önkoşulları… hepsi grafiktir. Yönsüz grafikte kenar iki yönlüdür; yönlü grafikte $(u, v)$ yalnızca $u$’dan $v$’ye gider.

Bu dersten itibaren $n = |V|$ ve $m = |E|$ yazacağız. Bir grafikte en fazla $n^2$ kenar olabilir; kenar sayısı bundan çok küçükse grafik **seyrek**, yakınsa **yoğundur**.

İlk soru: bir düğümden başlayıp ulaşılabilen her şeyi nasıl bulur ve kaynağa en yakın olanları nasıl sırayla ziyaret ederiz?`,
        },
        {
          kind: 'formal',
          title: 'Gösterim: liste mi, matris mi?',
          box: 'info',
          label: 'formal',
          body: `- **Komşuluk matrisi:** $n \\times n$ tablo, $A[u][v] = 1 \\iff (u, v) \\in E$. “$(u, v)$ kenar mı?” sorusu $O(1)$; ama bellek her zaman $\\Theta(n^2)$ ve bir düğümün komşularını listelemek $\\Theta(n)$.
- **Komşuluk listesi:** her $u$ için komşularının listesi. Bellek $\\Theta(n + m)$; $u$’nun komşularını listelemek $O(\\deg(u))$; ama “$(u, v)$ kenar mı?” $O(\\deg(u))$. Yönlü grafiklerde dışarı ve içeri komşular için iki ayrı liste tutmak işe yarar.

**Kural:** seyrek grafiklerde ($m \\ll n^2$) liste, çok yoğun grafiklerde matris. Bu dersteki algoritmalar komşuluk listesi varsayar.`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: '$n = 10^6$ kullanıcı ve ortalama 100 arkadaşlığı olan bir sosyal ağ için hangi gösterim uygundur?',
              options: [
                'Komşuluk matrisi: kenar sorgusu $O(1)$ olduğu için.',
                'Komşuluk listesi: matris $10^{12}$ hücre isterdi, liste yalnızca $\\approx 10^8$ kayıt.',
                'İkisi de aynı belleği kullanır.',
                'Hiçbiri; grafik saklanamaz.',
              ],
              answer: 1,
              hint: 'Matrisin boyutu $n^2$; listenin boyutu $n + 2m$ civarı.',
              explanation: '$m \\approx 5 \\cdot 10^7$ kenar, yani grafik çok seyrek. Matris $10^{12}$ hücre (terabaytlar) gerektirirken liste $n + 2m \\approx 10^8$ kayıtla yetinir.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'BFS(s) (notlar, Algoritma 5)',
          code: BFS_CODE,
          body: `BFS, kaynaktan uzaklığı $k$ olan her düğümü, uzaklığı $k + 1$ olanlardan **önce** keşfeder. $L_i$ kümeleri katmanlardır; $p(x)$, $x$’i keşfeden düğümdür ve $p$ işaretçileri bir **BFS ağacı** oluşturur.`,
        },
        {
          kind: 'viz',
          title: 'BFS görselleştiricisi',
          viz: 'bfs',
          tasks: [
            'Katmanlı grafikte $s$’den BFS çalıştırın: her katman hangi düğümlerden oluşuyor?',
            'Kaynağı değiştirin ($g$ deneyin). Katmanlar nasıl değişti?',
            'Yeşil ağaç kenarlarını izleyin: kaynaktan her düğüme giden ağaç yolu kaç kenar?',
            '**Tahmin modu**nda yeni keşfedilen her düğümün hangi katmana gireceğini tahmin edin.',
          ],
          body: `Her düğümün altındaki etiket katman numarasıdır ($L_i$ = kaynağa uzaklık $i$). Taranan kenar sarı, BFS ağacının kenarları yeşildir. Yönsüz grafiklerde her kenar iki uçtan da taranır.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Görselleştiricideki katmanlı grafikte $s$’den başlayan BFS, $g$ düğümünü hangi katmana koyar? (Yalnızca sayıyı yazın.)',
              answer: 3,
              hint: '$s \\to b \\to e \\to g$ dışında daha kısa bir yol var mı?',
              explanation: '$L_1 = \\{a, b, c\\}$, $L_2 = \\{d, e\\}$, $L_3 = \\{f, g\\}$. $g$’ye en kısa yol 3 kenarlıdır.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'BFS en kısa yolları bulur (Önerme 1)',
          label: 'formalProof',
          proof: [
            { title: 'İddia', body: 'Her $i$ için $L_i = \\{x : d(s, x) = i\\}$. $d(s, x)$: $s$’den $x$’e en az kenarlı yolun uzunluğu.' },
            { title: 'Taban', body: '$i = 0$: $L_0 = \\{s\\}$ ve uzaklığı 0 olan tek düğüm $s$.' },
            { title: 'Hipotez', body: 'Her $j \\le i$ için $L_j = \\{x : d(s, x) = j\\}$ olsun (güçlü tümevarım).' },
            { title: '(1) Eklenen doğru katmanda', body: '$y$, $x \\in L_i$ üzerinden $L_{i+1}$’e eklendiyse $d(s, y) \\le d(s, x) + 1 = i + 1$. $y$ hiçbir $L_j$ ($j \\le i$) içinde olmadığından hipoteze göre $d(s, y) > i$. Demek ki $d(s, y) = i + 1$.' },
            { title: '(2) Uzaklığı i + 1 olan eklenir', body: '$d(s, y) = i + 1$ olsun ve $x$, en kısa $s \\to y$ yolunda $y$’den önceki düğüm olsun. Yolun $s \\to x$ kısmı en kısa ve uzunluğu $i$: hipoteze göre $x \\in L_i$. $x$ işlenirken $(x, y)$ taranır; $y$ o ana kadar görülmediyse $L_{i+1}$’e eklenir, görüldüyse zaten başka bir $L_i$ düğümünden $L_{i+1}$’e eklenmiştir.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Çalışma süresi: O(n + m)',
          body: `Başlangıç $O(n)$. Her düğüm bir kez bir katmandan çıkarılır: düğüm başına $O(1)$. Bir düğüm işlenirken tüm komşuları taranır; her kenar yönlü grafikte bir, yönsüz grafikte iki kez taranır: kenar başına $O(1)$. Toplam:
$$O(\\#\\text{ziyaret} + \\#\\text{kenar taraması}) = O(n + m).$$
Bu, girdinin okunma süresi kadardır: daha iyisi mümkün değil.`,
        },
        {
          kind: 'text',
          title: 'Pratikte: BFS nerede kullanılır?',
          body: `- **Ağırlıksız en kısa yol:** metro hattında en az aktarma, sosyal ağda “kaç adım uzakta?”, bulmaca ve oyunlarda en az hamle (her durum bir düğüm).
- **Web tarayıcıları (crawler)** sayfaları bağlantı mesafesine göre katman katman gezer.
- **İki parçalılık testi:** BFS katmanlarını iki renge boyayın; aynı katmandaki iki düğüm arasında kenar varsa grafik iki parçalı değildir.
- **Ağırlıklı grafikler** için BFS yetmez: Ders 11’de Dijkstra, ağırlıklar eklenince BFS’in yerini alır.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Kenarların farklı uzunlukları (ağırlıkları) olan bir yol ağında BFS’in bulduğu yol hakkında ne söylenebilir?',
              options: ['Her zaman en kısa toplam uzunluklu yoldur.', 'En az **kenarlı** yoldur; toplam uzunlukça en kısa olmayabilir.', 'En uzun yoldur.', 'Rastgele bir yoldur.'],
              answer: 1,
              hint: 'BFS’in katmanları neyi sayıyor?',
              explanation: 'BFS kenar sayısını en aza indirir. Uzun bir tek kenar, kısa iki kenardan daha kötü olabilir; bunun için Dijkstra gerekir.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: BFS ile iki parçalılık testi',
          label: 'formal',
          body: `Bir yönsüz grafik, düğümleri iki renge boyanabiliyor ve her kenar farklı renkleri birleştiriyorsa **iki parçalıdır** (örneğin öğrenciler ve dersler). BFS’nin katmanları bunu doğrudan test eder.`,
          proof: [
            { title: 'Boyama', body: 'BFS’yi $s$’den çalıştır ve her düğümü $d(s, v)$’nin tek ya da çift olmasına göre boya. Bir kenar ya komşu iki katmanı ya da aynı katmanı birleştirir (Önerme 1’e göre katman atlayamaz).' },
            { title: 'Birinci durum', body: 'Hiçbir kenar aynı katmandaki iki düğümü birleştirmiyorsa boyama geçerlidir: grafik iki parçalıdır.' },
            { title: 'İkinci durum', body: 'Aynı katmanda iki düğümü birleştiren bir $(u, v)$ kenarı varsa: $s$’den $u$’ya ve $v$’ye eşit uzunlukta iki yol ve $(u, v)$ birlikte **tek uzunlukta bir döngü** içerir. Tek döngü iki renge boyanamaz: grafik iki parçalı değildir.' },
            { title: 'Sonuç', body: 'Bir grafik ancak ve ancak tek uzunlukta döngüsü yoksa iki parçalıdır ve bunu $O(n + m)$’de test ederiz. Örneğin 6 uzunluklu döngü iki parçalıdır, 5 uzunluklu döngü değildir.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Aşağıdaki grafiklerden hangisi iki parçalıdır?',
              options: ['5 düğümlü bir döngü', '6 düğümlü bir döngü', 'Bir üçgen', '4 düğümlü tam grafik'],
              answer: 1,
              hint: 'Tek uzunlukta döngü arayın.',
              explanation: '6 uzunluklu döngüde renkler sırayla değişir. Diğerlerinin hepsi tek uzunlukta bir döngü (5 ya da 3) içerir.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Bir düğümü kuyruktan **çıkarırken** ziyaret edildi saymak: aynı düğüm kuyruğa birden fazla kez girer. Düğüm, ilk **görüldüğünde** işaretlenmelidir (notlardaki $vis[x] = $ true).
- BFS’in ağırlıklı grafiklerde de en kısa yolu bulduğunu sanmak.
- Süreyi $O(n \\cdot m)$ ya da $O(n^2)$ sanmak: komşuluk listesiyle her kenar sabit sayıda taranır, toplam $O(n + m)$. Komşuluk **matrisi** kullanılırsa süre $O(n^2)$ olur.
- Kaynaktan ulaşılamayan düğümleri unutmak: BFS onları hiç keşfetmez; uzaklıkları $\\infty$ kalır.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Komşuluk listesiyle saklanan bir grafikte BFS’in çalışma süresi nedir?',
          options: ['$O(n)$', '$O(n + m)$', '$O(n \\log n + m)$', '$O(n^2)$'],
          answer: 1,
          hint: 'Düğüm başına ve kenar başına ne kadar iş?',
          explanation: 'Her düğüm bir kez işlenir, her kenar en çok iki kez taranır: $O(n + m)$.',
          feedback: { 3: 'Bu, komşuluk matrisiyle elde edilen süredir.' },
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'BFS’te $y$ düğümü $L_4$’e eklendi. Aşağıdakilerden hangisi kesinlikle doğrudur?',
          options: ['$d(s, y) \\le 3$', '$d(s, y) = 4$', '$d(s, y) \\ge 5$', '$y$’nin derecesi 4’tür'],
          answer: 1,
          hint: 'Önerme 1.',
          explanation: '$L_i$ tam olarak uzaklığı $i$ olan düğümlerdir.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'BFS ve DFS’in iskeleti aynıdır; farkı yaratan veri yapısı hangisidir?',
          options: ['BFS yığın, DFS kuyruk kullanır.', 'BFS kuyruk (FIFO), DFS yığın (LIFO) kullanır.', 'İkisi de öncelik kuyruğu kullanır.', 'BFS hash tablosu, DFS dizi kullanır.'],
          answer: 1,
          hint: 'Önce en eski keşfedileni mi, en yeni keşfedileni mi işleriz?',
          explanation: 'Kuyruk en eski (en yakın) düğümü önce verir: genişlik. Yığın en yeni düğümü verir: derinlik.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: '$n = 100$ düğümlü yönsüz bir grafikte BFS en çok kaç katman ($L_0$ dahil, boş olmayan) oluşturabilir?',
          answer: 100,
          hint: 'Hangi grafikte her katmanda tek düğüm olur?',
          explanation: 'Bir yol grafiğinde kaynak bir uçtaysa her katmanda bir düğüm vardır: $L_0, \\dots, L_{99}$, toplam 100 katman.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: düğümler 1–8, yönsüz kenarlar 1–2, 1–3, 2–4, 3–4, 4–5, 5–6, 5–7, 6–8, 7–8. 1’den BFS çalıştırın (komşuları küçükten büyüğe tarayın). Katmanları ve BFS ağacını yazın. 8’e en kısa yol kaç kenar?`,
          hints: ['$L_1 = \\{2, 3\\}$.', '4’e hem 2’den hem 3’ten ulaşılır; hangisi ebeveyn olur?'],
          solution: `$L_0 = \\{1\\}$, $L_1 = \\{2, 3\\}$, $L_2 = \\{4\\}$ ($p(4) = 2$, çünkü 2 önce işlenir), $L_3 = \\{5\\}$, $L_4 = \\{6, 7\\}$, $L_5 = \\{8\\}$ ($p(8) = 6$). Ağaç kenarları: 1–2, 1–3, 2–4, 4–5, 5–6, 5–7, 6–8. 8’e en kısa yol 5 kenar (1–2–4–5–6–8).`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: 10 000 düğümlü ve 30 000 kenarlı yönsüz bir yol ağı. Komşuluk matrisi kaç hücre tutar? Komşuluk listeleri kaç komşu girişi tutar? BFS’nin her iki gösterimdeki süresi nedir?`,
          hints: ['Matris: $n^2$ hücre.', 'Yönsüz grafikte her kenar iki listede görünür.'],
          solution: `Matris $n^2 = 10^8$ hücre tutar; listeler $2m = 60\\,000$ komşu girişi (artı 10 000 liste başı). Matrisle BFS her düğümün satırını baştan sona tarar: $\\Theta(n^2) = 10^8$ adım. Listelerle $O(n + m) = 40\\,000$ mertebesinde. Seyrek grafiklerde ($m \\ll n^2$) listeler hem bellekte hem zamanda açık ara kazanır; matris, “$(u, v)$ kenarı var mı?” sorusunu $O(1)$’de cevaplamak gerektiğinde ya da grafik yoğunken anlamlıdır.`,
        },
      ],
      sources: [SRC.l9.notes, SRC.l9.slides, SRC.l9.pre, SRC.l9.notebook, SRC.l9.concept],
    },
    {
      id: 'l9-dfs',
      lecture: 9,
      title: 'Derinlik öncelikli arama (DFS) ve uygulamaları',
      titleEn: 'Depth-first search (DFS) and its applications',
      summary: 'Keşif ve bitiş zamanları, bağlı bileşenler ve topolojik sıralama.',
      minutes: 45,
      objectives: [
        'DFS’i keşif $d(v)$ ve bitiş $f(v)$ zamanlarıyla adım adım çalıştırmak.',
        'Beyaz/gri/siyah renklerin anlamını ve DFS’in neden $O(n + m)$ sürdüğünü açıklamak.',
        'DFS ile yönsüz bir grafiğin bağlı bileşenlerini bulmak.',
        'Bir DAG’de bitiş zamanına göre azalan sıranın topolojik sıra olduğunu görmek.',
      ],
      prerequisites: ['BFS ve grafik gösterimi', 'Özyineleme'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: labirentte ip takip etmek',
          label: 'intuition',
          body: `Bir labirentte elinizde bir ip yumağıyla dolaştığınızı düşünün: gidebildiğiniz kadar ilerlersiniz; çıkmaz sokağa ya da daha önce geçtiğiniz bir yere gelince ipi takip ederek geri dönüp keşfedilmemiş ilk sapağa girersiniz. DFS tam olarak budur: **önce derine**, yalnızca gerekince geri.

DFS’e iki zaman damgası ekleriz: düğüme ilk vardığımız an $d(v)$ (**keşif**) ve onunla tamamen işimiz bittiği an $f(v)$ (**bitiş**). Bu zamanlar, birçok grafik algoritmasının (topolojik sıralama, güçlü bağlı bileşenler) anahtarıdır.`,
        },
        {
          kind: 'pseudocode',
          title: 'DFS(s, t) ve DFS(G) (notlar, Algoritma 2 ve 4)',
          code: DFS_CODE,
          body: `**Beyaz:** henüz keşfedilmedi. **Gri:** keşfedildi ama işi bitmedi (özyineleme yığınında). **Siyah:** bitti. Notlarda zaman her keşifte ve her geri dönüşte birer artar; böylece her düğüm $[d(v), f(v)]$ aralığına sahip olur.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Notlardaki DFS örneğinde (a→b, b→c, c→a, c→d, e→f) $a$’dan başlanınca $f(a)$ kaçtır?',
              answer: 8,
              hint: '$d(a) = 1, d(b) = 2, d(c) = 3, d(d) = 4$; sonra geri dönüşler.',
              explanation: '$f(d) = 5$, $f(c) = 6$, $f(b) = 7$, $f(a) = 8$. Sonra $e$’den yeni bir DFS: $(9, 12)$ ve $f$ için $(10, 11)$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'DFS görselleştiricisi',
          viz: 'dfs',
          tasks: [
            'Notlardaki örneği oynatın ve her düğümün altındaki $d/f$ değerlerini notlardakilerle karşılaştırın.',
            '$c \\to a$ kenarı tarandığında $a$ hangi renkte? Bu, grafikte ne olduğunu gösterir?',
            'Katmanlı grafikte de DFS çalıştırın: ağaç kenarları BFS ağacından nasıl farklı?',
            '**Tahmin modu**nda her kenar için “içine inilir mi, atlanır mı?” sorusunu cevaplayın.',
          ],
          body: `Düğüm altındaki $d/f$ etiketleri keşif ve bitiş zamanlarıdır. Özyineleme yığını görselin altında gösterilir. Gri bir düğüme giden kenar yönlü grafikte bir **geri kenardır** ve bir döngüye işaret eder.`,
        },
        {
          kind: 'correctness',
          title: 'Parantez yapısı ve çalışma süresi',
          label: 'proofIdea',
          proof: [
            { title: 'Her düğüm bir kez', body: 'DFS yalnızca beyaz düğümleri ziyaret eder ve onları hemen griye boyar; hiçbir düğüm yeniden beyaz olmaz. $n$ ziyaret.' },
            { title: 'Her kenar sabit sayıda', body: '$(u, v)$ yalnızca $u$ (yönsüzde $u$ veya $v$) ziyaret edilirken taranır: yönlüde bir, yönsüzde iki kez. Toplam $O(n + m)$.' },
            { title: 'Aralıklar iç içe', body: '$v$, $u$ gri iken keşfedildiyse $v$’nin tüm işi $u$ bitmeden biter: $d(u) < d(v) < f(v) < f(u)$. İki aralık ya iç içedir ya da ayrıktır (parantez yapısı).' },
            { title: 'Erişilebilirlik', body: 'DFS($s$) bittiğinde $s$’den ulaşılabilen her düğüm siyahtır, ulaşılamayanlar beyaz kalır.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Aynı DFS’te iki düğümün $[d, f]$ aralıkları hangisi **olamaz**?',
              options: ['$[1, 8]$ ve $[2, 5]$', '$[1, 4]$ ve $[5, 8]$', '$[1, 6]$ ve $[3, 9]$', '$[2, 7]$ ve $[3, 4]$'],
              answer: 2,
              hint: 'İki aralık ya iç içedir ya da ayrıktır.',
              explanation: '$[1, 6]$ ile $[3, 9]$ kesişiyor ama biri diğerinin içinde değil. 3. zamanda keşfedilen düğüm, 1’de keşfedilenin torunudur ve ondan önce bitmeliydi: $f \\le 5$. Diğer üçü ya iç içe ya ayrık.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Uygulamalar: bağlı bileşenler ve topolojik sıra',
          viz: 'dfsApps',
          tasks: [
            '**Bileşenler** modunda üç bileşenli grafiği oynatın: yeni bir bileşen ne zaman başlıyor?',
            '**Topolojik sıra** moduna geçin: sıra nasıl oluşuyor? Her kenarın soldan sağa gittiğini kontrol edin.',
          ],
          body: `**Bağlı bileşenler:** DFS($G$) her beyaz düğümden yeni bir arama başlatır; yönsüz bir grafikte her arama tam olarak bir bileşeni boyar. Toplam yine $O(n + m)$.

**Topolojik sıra:** döngüsüz yönlü bir grafikte (DAG) her $u \\to v$ kenarı için $f(u) > f(v)$ olur. Düğümleri bitiş zamanına göre **azalan** sırada yazmak, tüm kenarların ileri gittiği bir sıralama verir (örneğin önkoşullu derslerin alınma sırası).`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Bir DAG’de DFS sırasında $u \\to v$ kenarı tarandığında $v$ neden **gri olamaz**?',
              options: [
                'Çünkü DFS gri düğümleri atlar.',
                'Gri $v$, yığında $u$’nun atası demektir; $v \\leadsto u \\to v$ bir döngü olurdu.',
                'Çünkü $v$’nin derecesi sıfırdır.',
                'Olabilir; topolojik sıra yine doğru çıkar.',
              ],
              answer: 1,
              hint: 'Gri düğümler, özyineleme yığınındaki düğümlerdir.',
              explanation: 'Yığındaki her düğümden $u$’ya bir yol vardır. $v$ gri ise $v \\leadsto u \\to v$ döngüdür; DAG’de olamaz. Demek ki $v$ ya beyazdır (o zaman $u$’dan önce biter) ya siyahtır (zaten bitmiştir): her iki durumda $f(v) < f(u)$.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'BFS ve DFS yan yana',
          body: `İskelet aynı: bir başlangıç düğümü, bir “sınır” yapısı, keşfedilmemiş komşuları ekleme. **Kuyruk** (FIFO) en eski düğümü verir → BFS; **yığın** (LIFO) en yeni düğümü verir → DFS (özyineleme yığını da bir yığındır).

- **Süre:** ikisi de $O(n + m)$.
- **BFS verir:** katmanlar ve ağırlıksız uzaklıklar → en az adımlı yollar.
- **DFS verir:** $d/f$ zamanları ve döngü tespiti → topolojik sıra, güçlü bağlı bileşenler (Ders 10).`,
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'Ağırlıksız bir grafikte $s$’den $t$’ye **en az kenarlı** yolu hangisi bulur?',
              options: ['Yalnızca BFS', 'Yalnızca DFS', 'İkisi de', 'Hiçbiri'],
              answer: 0,
              hint: 'DFS bir dala girince sonuna kadar gider.',
              explanation: 'BFS katman katman ilerler ve $t$’yi ilk bulduğu katman uzaklıktır. DFS de $t$’ye bir yol bulur ama uzun olabilir: $s$–$t$ kenarı olan bir döngüde DFS önce döngünün öbür yanından dolanabilir.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: DFS nerede karşımıza çıkar?',
          body: `- **Derleme ve paket yöneticileri:** modüller veya paketler arası bağımlılıklar bir DAG’dir; derleme sırası topolojik sıradır. Bir döngü bulunursa “döngüsel bağımlılık” hatası verilir.
- **Elektronik tablolar** hücreleri, bağımlı oldukları hücrelerden sonra hesaplar.
- **Çöp toplayıcılar** (mark-and-sweep) kök referanslardan DFS yaparak erişilebilen nesneleri işaretler; işaretlenmeyenler silinir.
- **Labirent ve bulmaca** çözücüler, geri izleme (backtracking) ile DFS’in özel bir hâlidir.`,
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: bitiş zamanlarından topolojik sıra',
          label: 'formal',
          body: `Kendi küçük DAG’imiz: $a \\to c$, $b \\to c$, $c \\to d$, $c \\to e$ (dersler ve önkoşulları gibi). DFS(G)’yi düğümleri alfabetik sırayla deneyerek çalıştıralım.`,
          proof: [
            { title: 'a’dan başla', body: '$a$: $d = 1$. Komşusu $c$: $d = 2$. $c$’nin komşuları $d$ ($d = 3$, $f = 4$) ve $e$ ($d = 5$, $f = 6$). Sonra $c$ biter ($f = 7$), $a$ biter ($f = 8$).' },
            { title: 'b’den devam', body: '$b$ henüz beyaz: $d = 9$. Tek komşusu $c$ zaten siyah; $b$ biter ($f = 10$).' },
            { title: 'Azalan bitiş zamanı', body: '$b$ (10), $a$ (8), $c$ (7), $e$ (6), $d$ (4). Her kenar $u \\to v$ için $f(u) > f(v)$ olduğundan bu bir topolojik sıradır: $b, a, c, e, d$.' },
            { title: 'Tek değil', body: '$a$ ile $b$ ve $d$ ile $e$ kendi aralarında yer değiştirebilir: bu DAG’in tam 4 topolojik sırası vardır. DFS’nin hangisini bulduğu, düğümleri hangi sırayla denediğine bağlıdır.' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Bu DAG’in ($a \\to c$, $b \\to c$, $c \\to d$, $c \\to e$) kaç farklı topolojik sırası vardır?',
              answer: 4,
              hint: '$c$ ortada olmak zorunda.',
              explanation: '$c$’den önce $a$ ve $b$ (2 sıra), sonra $d$ ve $e$ (2 sıra): $2 \\cdot 2 = 4$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Bitiş zamanını keşif anında vermek: $f(v)$, $v$’nin **tüm** komşuları tarandıktan sonra atanır.
- Topolojik sırayı bitiş zamanına göre **artan** yazmak: doğru olan azalan sıradır.
- Yönsüz grafikte ebeveyne geri giden kenarı döngü sanmak: yönsüz grafikte $u$–$p(u)$ kenarı iki kez taranır, bu bir döngü değildir.
- DFS($s$)’in tüm grafiği gezdiğini sanmak: yalnızca $s$’den ulaşılabilenleri gezer; tüm grafik için DFS($G$) gerekir.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'numeric',
          prompt: 'Notlardaki DFS örneğinde ikinci arama $e$’den başlar. $d(e)$ kaçtır?',
          answer: 9,
          hint: '$f(a) = 8$; DFS($G$) döngüsü $t$’yi bir artırır.',
          explanation: '$a$’dan başlayan arama 8’de biter, $t = 9$ olur: $d(e) = 9$, $d(f) = 10$, $f(f) = 11$, $f(e) = 12$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Yönlü bir grafikte DFS sırasında **gri** bir düğüme giden bir kenar bulundu. Bu ne gösterir?',
          options: ['Grafik bir ağaçtır.', 'Grafikte yönlü bir döngü vardır.', 'Grafik bağlantısızdır.', 'Hiçbir şey; olağan bir durumdur.'],
          answer: 1,
          hint: 'Gri düğümler, şu anki yolun üzerindedir.',
          explanation: 'Gri $v$, yığındaki bir atadır; $v \\leadsto u \\to v$ bir döngüdür (geri kenar).',
        },
        {
          id: 'q3',
          kind: 'order',
          prompt: 'Kendi örneğimiz: kenarları a→b, a→c, b→d, c→d, c→e, d→f, e→f olan DAG’de DFS’i $a$’dan başlatıp komşuları alfabetik tarayınca oluşan topolojik sırayı yazın.',
          items: ['a', 'c', 'e', 'b', 'd', 'f'],
          hint: 'Bitiş sırası: önce f, sonra d, b, e, c, a.',
          explanation: 'Bitiş zamanları (notlardaki zaman kuralıyla): $f$ 5, $d$ 6, $b$ 7, $e$ 10, $c$ 11, $a$ 12. Azalan sırada: a, c, e, b, d, f. Her kenar soldan sağa gider. Görselleştiricinin “Topolojik sıra” modunda aynı grafiği izleyebilirsiniz.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Yönsüz bir grafikte bağlı bileşen sayısını bulmanın en hızlı yolu hangisidir?',
          options: ['Her düğüm çiftine BFS: $O(n^2(n+m))$', 'DFS($G$): her yeni arama bir bileşen, toplam $O(n + m)$', 'Kenarları sıralamak: $O(m \\log m)$', 'Komşuluk matrisinin determinantı'],
          answer: 1,
          hint: 'Her arama bir bileşeni tamamen boyar.',
          explanation: 'DFS($G$), beyaz kalan her düğümden yeni arama başlatır; arama sayısı bileşen sayısıdır. Süre $O(n + m)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: dersler arası önkoşullar Kalkülüs → Olasılık, Kalkülüs → Lineer Cebir, Ayrık Mat → Algoritmalar, Olasılık → Algoritmalar, Lineer Cebir → Makine Öğrenmesi, Algoritmalar → Makine Öğrenmesi. Bu grafiğin bir DAG olduğunu gösterin ve DFS ile bir topolojik sıra bulun.`,
          hints: ['DFS’i Kalkülüs’ten başlatın, sonra beyaz kalan Ayrık Mat’tan.', 'Bitiş zamanına göre azalan sırada yazın.'],
          solution: `Kalkülüs’ten DFS (komşular alfabetik: Lineer Cebir, Olasılık): Lineer Cebir → Makine Öğrenmesi biter; Lineer Cebir biter; Olasılık → Algoritmalar (Makine Öğrenmesi zaten siyah) biter; Olasılık biter; Kalkülüs biter. Sonra Ayrık Mat (Algoritmalar siyah) biter. Bitiş sırası: MÖ, LC, Alg, Ol, Kal, AM. Azalan sıra: **Ayrık Mat, Kalkülüs, Olasılık, Algoritmalar, Lineer Cebir, Makine Öğrenmesi.** DFS hiç gri düğüme giden kenar görmediği için grafik döngüsüzdür.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: yönlü kenarlar $a \\to b$, $b \\to c$, $c \\to d$, $d \\to b$, $a \\to e$. DFS’yi $a$’dan başlatıp (komşular alfabetik sırayla) her düğümün $d$ ve $f$ zamanlarını yazın. Grafikte döngü var mı? DFS bunu nasıl fark eder?`,
          hints: ['$d \\to b$ kenarı incelenirken $b$ hangi renktedir?', 'Gri bir düğüme giden kenar bir **geri kenar**dır.'],
          solution: `$a$: 1/10, $b$: 2/7, $c$: 3/6, $d$: 4/5, $e$: 8/9. $d$ işlenirken $d \\to b$ kenarı **gri** olan $b$’ye gider: $b$ hâlâ yığında, yani $b \\leadsto d \\to b$ bir döngüdür ($b \\to c \\to d \\to b$). Kural: yönlü bir grafikte döngü vardır ancak ve ancak DFS bir geri kenar bulursa. Bu yüzden DFS hem döngü testi hem de (döngü yoksa) topolojik sıra için $O(n + m)$’de çalışır.`,
        },
      ],
      sources: [SRC.l9.notes, SRC.l9.slides, SRC.l9.notebook, SRC.l9.concept],
    },
  ],
}
