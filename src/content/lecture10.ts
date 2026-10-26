import type { Lecture } from './types'
import { SRC } from './sources'
import { SCC_CODE } from '../engines/scc'

export const lecture10: Lecture = {
  n: 10,
  title: 'Güçlü bağlı bileşenler',
  titleEn: 'Strongly Connected Components',
  date: '9 Şubat 2026',
  blurb: 'İki DFS geçişiyle yönlü bir grafiği güçlü bağlı bileşenlerine ayırmak: $O(n + m)$.',
  lessons: [
    {
      id: 'l10-scc',
      lecture: 10,
      title: 'Güçlü bağlı bileşenler (SCC)',
      titleEn: 'Strongly connected components (SCC)',
      summary: 'Bileşenlerin meta-grafiği bir DAG’dir; ters grafikte bitiş zamanları SCC’leri sırayla soyar.',
      minutes: 55,
      objectives: [
        'Yönsüz grafiklerde bağlı bileşeni ve yönlü grafiklerde güçlü bağlı bileşeni (SCC) tanımlamak.',
        'SCC’lerin meta-grafiğinin neden döngüsüz olduğunu açıklamak.',
        'İki geçişli algoritmayı (önce $G_{rev}$, sonra $f$’ye göre azalan sırayla $G$) adım adım çalıştırmak.',
        'Anahtar Lemma’yı ve doğruluk kanıtının tümevarım adımını açıklamak.',
      ],
      prerequisites: ['DFS ve bitiş zamanları (Ders 9)', 'Denklik bağıntıları'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: karşılıklı ulaşılabilirlik',
          label: 'intuition',
          body: `Yönsüz bir grafikte bileşen bulmak kolaydı: bir düğümden arama yap, ulaştığın her şey bir bileşen (Ders 9).

Yönlü grafikte “$u$’dan $v$’ye gidebilirim” ile “$v$’den $u$’ya gidebilirim” farklıdır. Bir **güçlü bağlı bileşen**, içindeki her düğümden diğer her düğüme yönlü bir yol bulunan **en büyük** düğüm kümesidir. Web’de birbirine karşılıklı bağlanan sayfa öbekleri, bir şehirde tek yönlü sokaklarla birbirine gidip gelinebilen bölgeler… hepsi SCC’dir.

Tek bir DFS yetmez: $u$’dan başlayan arama, $u$’nun SCC’sinin **dışına** da taşabilir. Çözüm, DFS’i doğru sırayla iki kez çalıştırmaktır.`,
        },
        {
          kind: 'formal',
          title: 'Tanımlar (Ders 10 notları)',
          box: 'formal',
          label: 'formal',
          body: `- **Bağlı bileşen (yönsüz):** $u \\sim v \\iff$ $u$’dan $v$’ye yol var. Bu bir denklik bağıntısıdır; denklik sınıfları bileşenlerdir.
- **Güçlü bağlı bileşen (yönlü):** $u \\sim v \\iff$ $u$’dan $v$’ye **ve** $v$’den $u$’ya yol var. Yine yansıyan, simetrik ve geçişli: SCC’ler denklik sınıflarıdır, her düğüm tam olarak bir SCC’dedir.
- **Zayıf bağlı bileşen:** yönler unutulunca oluşan yönsüz grafiğin bileşeni.

**Meta-grafik:** her SCC’yi tek bir düğüme sıkıştırın; $C_h$’den $C_\\ell$’ye, aralarında en az bir kenar varsa bir yay çizin. Bu meta-grafik **döngüsüzdür (DAG)**: bir döngü olsaydı döngüdeki tüm SCC’ler karşılıklı ulaşılabilir olur, yani tek bir SCC olurlardı.`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: '$n$ düğümlü bir DAG’de kaç güçlü bağlı bileşen vardır?',
              options: ['1', '$n$', '$n - 1$', 'Kenar sayısına bağlıdır'],
              answer: 1,
              hint: 'DAG’de iki farklı düğüm karşılıklı ulaşılabilir olabilir mi?',
              explanation: 'Karşılıklı ulaşılabilir iki farklı düğüm bir döngü oluştururdu. DAG’de döngü yok: her düğüm kendi başına bir SCC’dir, toplam $n$.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'İki geçişli algoritma (notlar, Algoritma 1–3)',
          code: SCC_CODE,
          body: `Notlar önce **ters grafikte** ($G_{rev}$) DFS yapıp bitiş zamanlarını hesaplar, sonra $G$’de düğümleri $f$’ye göre azalan sırada işler. CLRS ve derste sıra terstir (önce $G$, sonra $G_{rev}$); $G$ ile $G_{rev}$’in SCC’leri aynı olduğu için iki sürüm de aynı ayrışımı bulur (Remark 4).`,
        },
        {
          kind: 'viz',
          title: 'SCC görselleştiricisi',
          viz: 'scc',
          tasks: [
            '1. geçişi izleyin: ters grafikte hangi düğüm en büyük bitiş zamanını aldı?',
            '2. geçişte ilk DFS hangi düğümden başlıyor ve hangi düğümleri topluyor? Bu küme bir SCC mi?',
            'Her yeni DFS’in neden kendi SCC’sinin dışına taşamadığını, renkli bileşenlerin meta-grafiğine bakarak açıklayın.',
            '**Tahmin modu**nda 2. geçişteki her DFS’in başlangıç düğümünü tahmin edin.',
          ],
          body: `1. geçişte kenarlar ters çizilir ve her düğümün altına bitiş zamanı $f$ yazılır. 2. geçişte kenarlar asıl yönlerine döner; her renk bir SCC’dir ve ★ o SCC’nin liderini (DFS’in başladığı düğümü) gösterir.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Görselleştiricideki grafikte kaç güçlü bağlı bileşen var?',
              answer: 4,
              hint: '$a, b, c$ bir döngü oluşturuyor; $d$ ile $e$ birbirine bağlı; $f, g, h$ bir döngü.',
              explanation: '$\\{a, b, c\\}$, $\\{d, e\\}$, $\\{f, g, h\\}$ ve tek başına $\\{i\\}$: dört SCC. Meta-grafik: $\\{a,b,c\\} \\to \\{d,e\\} \\to \\{f,g,h\\}$ ve $\\{a,b,c\\} \\to \\{i\\}$.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Anahtar Lemma (Lemma 5)',
          label: 'formalProof',
          proof: [
            { title: 'İddia', body: '$C_1$ ve $C_2$ iki SCC, $G$’de $i \\in C_1$, $j \\in C_2$ olan bir $(i, j)$ kenarı var. $f$, $G_{rev}$ üzerindeki DFS-Loop’un bitiş zamanları olsun. O zaman $\\max_{v \\in C_1} f(v) < \\max_{v \\in C_2} f(v)$.' },
            { title: 'Kurulum', body: '$G_{rev}$’de kenar $(j, i)$ olur: $C_2 \\to C_1$. $G$ ve $G_{rev}$’in SCC’leri aynıdır. $v$, $C_1 \\cup C_2$’de DFS-Loop’un ilk ziyaret ettiği düğüm olsun.' },
            { title: 'Durum 1: v ∈ C1', body: 'Meta-grafik döngüsüz olduğundan $G_{rev}$’de $v$’den $C_2$’ye yol yoktur. DFS ulaşılabilen her şeyi ve yalnızca onu keşfeder: $C_1$’i bitirir, $C_2$’ye hiç dokunmaz. $C_1$’deki tüm bitiş zamanları $C_2$’dekilerden küçüktür.' },
            { title: 'Durum 2: v ∈ C2', body: '$v$’den $C_1 \\cup C_2$’nin tamamına ulaşılır ($C_2$ içinde her yere, sonra $(j, i)$ ile $C_1$’e). $v$’deki DFS çağrısı bunların hepsini bitirmeden bitmez: $f(v)$, $C_1 \\cup C_2$’deki en büyük bitiş zamanıdır.' },
            { title: 'Sonuç', body: 'İki durumda da $C_1$’in en büyük $f$’si, $C_2$’ninkinden küçüktür. Yani $G$’de bir SCC’den diğerine giden her kenar, en büyük $f$ değerini **artırır**.' },
          ],
        },
        {
          kind: 'correctness',
          title: 'Doğruluk: SCC’leri bir soğan gibi soymak',
          label: 'proofIdea',
          proof: [
            { title: 'Hipotez', body: '2. geçişte DFS $v$’de çağrılmadan önce keşfedilmiş $S$ kümesi, birkaç SCC’nin birleşimidir.' },
            { title: 'En azından kendi SCC’si', body: '$C$, $v$’nin SCC’si olsun. $v \\notin S$ ve $S$ SCC’lerin birleşimi olduğundan $C \\cap S = \\emptyset$: çağrı $C$’nin tamamını keşfeder.' },
            { title: 'Ama dışına taşmaz', body: '$C$’den çıkan her $(i, j)$ kenarı, Anahtar Lemma’ya göre en büyük $f$’si $f(v)$’den büyük olan bir $C\'$ SCC’sine gider. Düğümler azalan $f$ sırasıyla işlendiğinden o düğüm daha önce işlenmiş, yani $C\' \\subseteq S$. Çağrı $C\'$’ye giremez.' },
            { title: 'Sonuç', body: 'Her çağrı tam olarak bir SCC toplar ve $S$ yine SCC’lerin birleşimi kalır. Aynı lideri paylaşan düğümler tam olarak SCC’lerdir.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Çalışma süresi',
          body: `Ters grafiği kurmak $O(n + m)$; iki DFS-Loop çağrısı $O(n + m)$; 2. geçişin sırası için düğümleri $f$’ye göre sıralamak gerekmez: 1. geçişte biten düğümleri bir listeye eklemek ve listeyi tersten okumak yeter. Toplam **$O(n + m)$**, yani doğrusal.`,
        },
        {
          kind: 'text',
          title: 'Pratikte: SCC’ler nerede işe yarar?',
          body: `- **Web’in yapısı:** web grafiği büyük bir merkezi SCC, ona giren ve ondan çıkan sayfa kümelerinden oluşur (“papyon” yapısı).
- **2-SAT:** her değişkenin ve olumsuzunun bir düğüm olduğu bir “çıkarım grafiğinde” $x$ ile $\\neg x$ aynı SCC’deyse formül sağlanamaz; doğrusal zamanda karar verilir.
- **Kod analizi:** fonksiyonların birbirini çağırdığı grafikte SCC’ler karşılıklı özyinelemeli fonksiyon gruplarıdır; derleyiciler ve yükleyiciler bunları birlikte işler.
- **Sıkıştırma:** her SCC’yi tek düğüme indirmek grafiği bir DAG’e çevirir; DAG üzerinde topolojik sıra, en uzun yol gibi problemler kolaylaşır.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Bir grafiğin SCC’lerini sıkıştırdığınızda elde ettiğiniz meta-grafikte bir döngü bulduğunuzu düşünün. Bu ne anlama gelir?',
              options: ['Meta-grafik yanlış kurulmuştur: döngüdeki bileşenler aslında tek bir SCC olmalıydı.', 'Grafikte negatif bir döngü vardır.', 'Grafik yönsüzdür.', 'Normaldir; meta-grafiklerde döngü olabilir.'],
              answer: 0,
              hint: 'Döngüdeki bileşenlerden herhangi ikisi karşılıklı ulaşılabilir mi?',
              explanation: 'Döngü boyunca herkes herkese ulaşabilir; bu bileşenler aslında tek bir SCC’dir. Doğru kurulmuş bir meta-grafik her zaman bir DAG’dir.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: SCC grafiği (yoğunlaştırma)',
          label: 'formal',
          body: `Kendi örneğimiz: $a \\to b$, $b \\to c$, $c \\to a$, $c \\to d$, $d \\to e$, $e \\to d$, $e \\to f$. Her SCC’yi tek bir düğüme sıkıştırırsak ne elde ederiz?`,
          proof: [
            { title: 'Bileşenler', body: '$a \\to b \\to c \\to a$ bir döngü: $\\{a, b, c\\}$. $d \\leftrightarrow e$: $\\{d, e\\}$. $f$’den hiçbir yere gidilmez: $\\{f\\}$. Toplam 3 SCC.' },
            { title: 'Yoğunlaştırma', body: 'Her SCC bir düğüm olur; SCC’ler arasındaki kenarlar kalır: $\\{a,b,c\\} \\to \\{d,e\\} \\to \\{f\\}$. Bu grafik **her zaman bir DAG’dir**: SCC grafiğinde bir döngü olsaydı, o döngüdeki bileşenler karşılıklı ulaşılabilir olur ve tek bir SCC’de birleşirdi.' },
            { title: 'Algoritmayla bağlantı', body: 'İki geçişli algoritmanın ilk DFS’i, bu DAG’in topolojik sırasını (bitiş zamanlarıyla) bulur: en büyük bitiş zamanı kaynak bileşendedir. İkinci geçiş ters grafikte bu sırayla başladığı için her seferinde yalnızca bir bileşeni “soyar”.' },
            { title: 'Bir kenar eklemek', body: '$f \\to a$ eklenirse $a \\leadsto f \\to a$ bir döngü olur ve her şey tek bir SCC’de birleşir. $f \\to d$ eklemek ise yalnızca $\\{d, e, f\\}$’i birleştirir: 2 SCC.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'Bu grafiğe $f \\to d$ kenarı eklenince kaç SCC kalır?',
              answer: 2,
              hint: '$d$, $e$ ve $f$ artık karşılıklı ulaşılabilir mi? Ya $a$?',
              explanation: '$\\{a, b, c\\}$ ve $\\{d, e, f\\}$: $\\{d, e, f\\}$’den $\\{a, b, c\\}$’ye hâlâ kenar yok.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- 2. geçişte düğümleri bitiş zamanına göre **artan** sırada işlemek: o zaman ilk DFS bir “kaynak” SCC’den başlayıp birkaç SCC’yi birden toplayabilir.
- İki geçişi de aynı grafikte yapmak: geçişlerden biri $G_{rev}$ üzerinde olmalıdır.
- Bitiş zamanının en büyük olduğu düğümün kendi başına bir SCC olduğunu sanmak; yalnızca, onun SCC’sinin meta-grafikte bir uçta olduğunu biliriz.
- Zayıf ve güçlü bağlılığı karıştırmak: $a \\to b$ tek kenarı $a$ ile $b$’yi zayıf bağlı yapar, güçlü bağlı yapmaz.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Komşuluk listesiyle verilen yönlü bir grafiğin SCC’lerini bulmak ne kadar sürer?',
          options: ['$O(n + m)$', '$O((n + m)\\log n)$', '$O(n \\cdot m)$', '$O(n^3)$'],
          answer: 0,
          hint: 'Kaç DFS geçişi yapılıyor?',
          explanation: 'Ters grafiği kurmak ve iki DFS geçişi, hepsi doğrusal: $O(n + m)$.',
          feedback: { 2: 'Her düğümden ayrı bir arama yapmak bu kadar sürerdi; iki geçişli algoritma daha hızlıdır.' },
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: '10 düğümlü yönlü bir döngüye ($1 \\to 2 \\to \\dots \\to 10 \\to 1$) bir de $1 \\to 5$ kenarı eklenirse kaç SCC olur?',
          answer: 1,
          hint: 'Döngüde herkes herkese ulaşabilir mi?',
          explanation: 'Döngü zaten tüm düğümleri karşılıklı ulaşılabilir yapar; yeni bir kenar bunu bozmaz. Tek bir SCC.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'İki geçişli algoritmada 2. geçişin ilk DFS’i neden yalnızca **bir** SCC toplar?',
          options: [
            'Çünkü DFS hiçbir zaman bir SCC’den çıkamaz.',
            'Çünkü en büyük $f$’ye sahip düğümün SCC’sinden $G$’de dışarı çıkan bir kenar yoktur (Anahtar Lemma).',
            'Çünkü tüm kenarlar 2. geçişte silinir.',
            'Çünkü 1. geçiş tüm düğümleri siyaha boyamıştır.',
          ],
          answer: 1,
          hint: 'Dışarı çıkan bir kenar olsaydı, Lemma’ya göre hedef SCC’nin en büyük $f$’si ne olurdu?',
          explanation: 'Çıkan bir $(i, j)$ kenarı, en büyük $f$’si daha büyük olan bir SCC’ye giderdi — ama başladığımız düğüm zaten en büyük $f$’ye sahip. Demek ki böyle bir kenar yok.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Görselleştiricideki grafiğe $h \\to a$ kenarı eklenirse SCC’ler nasıl değişir?',
          options: ['Değişmez.', '$\\{a, b, c, d, e, f, g, h\\}$ tek SCC olur, $\\{i\\}$ ayrı kalır.', 'Tüm düğümler tek SCC olur.', '$\\{f, g, h\\}$ ikiye bölünür.'],
          answer: 1,
          hint: 'Meta-grafikte $\\{f,g,h\\} \\to \\{a,b,c\\}$ yayı bir döngü oluşturur.',
          explanation: '$\\{a,b,c\\} \\to \\{d,e\\} \\to \\{f,g,h\\} \\to \\{a,b,c\\}$ döngüsü üç bileşeni birleştirir. $i$’den hiçbir yere çıkış olmadığı için o ayrı kalır.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: kenarlar 1→2, 2→3, 3→1, 3→4, 4→5, 5→6, 6→4, 6→7. İki geçişli algoritmayı elle çalıştırın (1. geçişte $G_{rev}$’de düğümleri 7’den 1’e doğru deneyin). Bitiş zamanlarını, 2. geçişin sırasını ve SCC’leri yazın.`,
          hints: ['$G_{rev}$’de 7’den başlayan DFS: 7 → 6 → 5 → 4 → 3 → 2 → 1.', '2. geçiş en büyük $f$’den başlar; $G$’de o düğümden nereye gidilebilir?'],
          solution: `$G_{rev}$ kenarları: 2→1, 3→2, 1→3, 4→3, 5→4, 6→5, 4→6, 7→6. 7’den DFS: 7, 6, 5, 4, 3, 2, 1 sırayla keşfedilir (4’ün komşuları 3 ve 6; 6 zaten keşfedildi). Bitişler: 1 → 1, 2 → 2, 3 → 3, 4 → 4, 5 → 5, 6 → 6, 7 → 7. 2. geçiş sırası: 7, 6, 5, 4, 3, 2, 1. $G$’de 7’den çıkış yok: $\\{7\\}$. 6’dan: 6 → 4 → 5 (7 keşfedildi): $\\{4, 5, 6\\}$. Sonra 3’ten: 3 → 1 → 2: $\\{1, 2, 3\\}$. Üç SCC; meta-grafik $\\{1,2,3\\} \\to \\{4,5,6\\} \\to \\{7\\}$.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: yukarıdaki grafiğe ($a \\to b \\to c \\to a$, $c \\to d$, $d \\leftrightarrow e$, $e \\to f$) **tek bir kenar** ekleyerek onu güçlü bağlı yapmak istiyoruz. Hangi kenarlar işe yarar? Neden?`,
          hints: ['SCC grafiği bir zincir: $\\{a,b,c\\} \\to \\{d,e\\} \\to \\{f\\}$.', 'Yeni kenar, zincirin sonundan başına gitmeli.'],
          solution: `SCC grafiği bir zincir olduğu için tek kenarın zincirin **son** bileşeninden (\\{f\\}) **ilk** bileşenine (\\{a, b, c\\}) gitmesi gerekir: $f \\to a$, $f \\to b$ ya da $f \\to c$. Üçü de bütün düğümleri tek bir döngüde birleştirir. $f \\to d$ yalnızca son iki bileşeni birleştirir; $e \\to a$ ise $\\{f\\}$’yi dışarıda bırakır ($f$’den çıkış yok). Genel olarak SCC grafiği bir kaynağa ve bir kuyuya sahip bir zincirse tek kenar yeter; çok sayıda kaynak/kuyu varsa daha fazlası gerekir.`,
        },
      ],
      sources: [SRC.l10.notes, SRC.l10.slides, SRC.l10.pre, SRC.l10.notebook, SRC.l10.concept],
    },
  ],
}
