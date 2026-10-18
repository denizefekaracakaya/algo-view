import type { Lecture } from './types'
import { SRC } from './sources'

export const lecture1: Lecture = {
  n: 1,
  title: 'Neden buradayız?',
  titleEn: 'Why are you here?',
  date: '5 Ocak 2026',
  blurb: 'Algoritmalar neden önemli, çalışma süresini nasıl ölçeriz ve ilk böl-ve-fethet sürprizi: Karatsuba çarpımı.',
  lessons: [
    {
      id: 'l1-why',
      lecture: 1,
      title: 'Algoritmalar ve çalışma süresini ölçmek',
      titleEn: 'Algorithms and how we measure running time',
      summary: 'Bir algoritmayı “daha iyi” yapan nedir? Saniye yerine büyüme hızını neden ölçeriz?',
      minutes: 15,
      objectives: [
        'Algoritma tasarımı ve analizinin bilgisayar biliminin her alanında neden yer aldığını açıklamak.',
        'Bir algoritmanın çalışma süresini milisaniyeyle değil, girdi büyüklüğüne göre ölçeklenmesiyle ifade etmenin nedenini anlamak.',
        'Sabit çarpanların büyük n için üs farkını telafi edemeyeceğini somut bir örnekle görmek.',
      ],
      prerequisites: ['Temel programlama', 'Üslü ifadeler ve logaritma'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: neden algoritmalar?',
          label: 'intuition',
          body: `Ders 1 notları üç neden sayar: algoritmalar bilgisayar biliminin **temelidir** (işletim sistemleri, ağlar, makine öğrenmesi, kriptografi ve hesaplamalı biyoloji hep algoritmik fikirlere dayanır), **faydalıdır** (donanım hızlandıkça hızlı ve yavaş algoritma arasındaki fark _büyür_) ve **eğlencelidir** (yaratıcılık ile matematiksel kesinliğin birleşimi; “daha iyi bir algoritma var mı?” sorusu sürekli sürprizler doğurur).

Bu derste algoritmayı yalnızca “çalışan kod” olarak değil, **iki soruya cevap verilmesi gereken bir nesne** olarak ele alacağız:

- **Doğru mu?** Her geçerli girdi için doğru çıktıyı üretiyor mu?
- **Verimli mi?** Girdi büyüdükçe ne kadar iş yapıyor?`,
        },
        {
          kind: 'formal',
          title: 'Çalışma süresini nasıl ölçeriz?',
          box: 'formal',
          label: 'formal',
          body: `Çalışma süresini milisaniye ile ölçmek, algoritmayı değil **algoritma + gerçekleştirim + donanım** üçlüsünü ölçer. Okul yöntemiyle çarpma elle de bilgisayarda da aynı algoritmadır.

Bunun yerine, işin girdi büyüklüğü $n$ ile **nasıl ölçeklendiğine** bakarız. İki $n$ basamaklı sayıyı okul yöntemiyle çarparken her basamak çifti çarpılır: $n^2$ tek basamaklı çarpma. Bu yüzden okul yönteminin çalışma süresi “$n^2$ gibi ölçeklenir”. (Kesin tanımı Ders 2’de Big-O ile yapacağız.)`,
        },
        {
          kind: 'viz',
          title: 'Etkileşim: sabit çarpan mı, üs mü?',
          viz: 'handVsComputer',
          body: `Ders notlarındaki düşünce deneyi: elle çalışmak bilgisayardan $10^4$ kat yavaş olsun. $n^{1.6}$ ölçeğinde bir algoritmayı elle, $n^2$ ölçeğindekini bilgisayarda çalıştıralım. Kaydırıcılarla yavaşlama katsayısını ve üssü değiştirin; kesişme noktası nereye kayıyor?`,
        },
        {
          kind: 'text',
          title: 'Önceden hesaplama neden işe yaramaz?',
          body: `Akla gelen bir “hile”: tüm $n$ basamaklı çarpımları bir tabloda saklamak. Notların belirttiği gibi bu, $10^{2n}$ girdi demektir; $n = 100$ için $10^{200}$ satır — evrendeki atom sayısının (yaklaşık $10^{80}$) çok ötesinde. Gerçekten daha akıllı bir **algoritma** gerekir.

**“Algoritma” kelimesi** 9. yüzyılda Bağdat’taki Beytü’l-Hikme’de çalışan Harezmî’nin (al-Khwarizmi) adından gelir; onun Hint-Arap rakamlarıyla hesap yapmayı anlatan kitabı, bugün kullandığımız konumsal sayı sistemini Avrupa’ya taşımıştır. İyi bir **veri gösterimi** (Roma rakamları yerine onluk sistem) çarpmayı kolaylaştırır — veri yapısı seçiminin önemine dair erken bir örnek.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- “Bilgisayarım hızlı, algoritma önemli değil.” — Donanım hızlandıkça daha büyük problemler çözmek isteriz; büyüme hızı farkı o zaman daha çok hissedilir.
- “Bir kez ölçtüm, X algoritması daha hızlı.” — Tek bir ölçüm, belirli bir girdi ve makineye aittir; ölçeklenme hakkında genel bir iddia değildir.
- “Sabit çarpan her zaman önemsizdir.” — Pratikte önemli olabilir; ama bu dersin odağı büyük $n$ için davranıştır.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Okul yöntemiyle iki $n$ basamaklı sayı çarpılırken kaç basamak çifti çarpılır?',
          options: ['$2n - 1$', '$n^2$', '$n^3$', '$n \\log n$'],
          answer: 1,
          hint: 'Birinci sayının her basamağı, ikinci sayının her basamağıyla bir kez çarpılır.',
          explanation: '$n$ basamağın her biri diğer sayının $n$ basamağıyla çarpılır: $n \\cdot n = n^2$ çift.',
          feedback: { 0: '$2n-1$, sonuçtaki “sütun” sayısıdır; çarpılan çift sayısı değil.', 2: 'Her çift yalnızca bir kez çarpılır; üçüncü bir boyut yok.' },
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Neden çalışma süresini milisaniye yerine girdi büyüklüğüne göre ölçekleme ile ifade ederiz?',
          options: [
            'Milisaniye ölçmek imkânsızdır.',
            'Ölçeklenme; programlama diline, gerçekleştirime ve donanıma bağlı değildir.',
            'Büyük girdiler için tüm algoritmalar aynı hızda çalışır.',
            'Çünkü sabit çarpanlar her zaman sıfırdır.',
          ],
          answer: 1,
          hint: 'Aynı algoritmayı elle ve bilgisayarda çalıştırdığınızı düşünün.',
          explanation: 'Milisaniye, algoritmayla birlikte makineyi ve gerçekleştirimi de ölçer. Büyüme hızı ise algoritmanın kendisine ait bir özelliktir.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: '$10^4 \\cdot n^{1.6}$ ile $n^2$ karşılaştırılıyor. Hangisi doğrudur?',
          options: [
            'Her $n$ için $10^4 n^{1.6} > n^2$.',
            'Yeterince büyük $n$ için $10^4 n^{1.6} < n^2$.',
            'İkisi yalnızca $n = 10^4$’te eşittir ve sonra yine $10^4 n^{1.6}$ büyüktür.',
            'Karşılaştırılamazlar.',
          ],
          answer: 1,
          hint: '$n^2 / n^{1.6} = n^{0.4}$; bu oran sınırsız büyür mü?',
          explanation: '$n^{0.4} > 10^4 \\iff n > 10^{10}$. Bu noktadan sonra $n^2$ her zaman daha büyüktür; sabit çarpan üs farkını yalnızca bir süre geciktirebilir.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Bir algoritma $100\\,n\\log_2 n$, diğeri $n^2$ adım atıyor. $n = 2^k$ biçimindeki değerler için ilk algoritma hangi $n$’den itibaren kesinlikle daha hızlıdır? (Kendi örneğimiz; ders notlarında yoktur.)`,
          hints: ['$100 n \\log_2 n < n^2 \\iff 100 \\log_2 n < n$.', '$n = 2^k$ koyun: $100k < 2^k$ eşitsizliğini sağlayan en küçük $k$ nedir?'],
          solution: `$100k < 2^k$: $k = 9$ için $900 > 512$, $k = 10$ için $1000 < 1024$. Dolayısıyla $n = 2^{10} = 1024$ ve sonrasında (2’nin kuvvetleri arasında) ilk algoritma daha hızlıdır. Bu sınır gerçek olsa da asimptotik kıyas $n \\log n$’in $n^2$’den yavaş büyüdüğünü söyler; kesişmenin tam yeri sabitlere bağlıdır.`,
        },
      ],
      sources: [SRC.l1.notes, SRC.l1.slides, SRC.l1.concept],
    },
    {
      id: 'l1-karatsuba',
      lecture: 1,
      title: 'Böl ve fethet: Karatsuba çarpımı',
      titleEn: 'Divide and conquer: Karatsuba integer multiplication',
      summary: 'Dört alt çarpım yerine üç: küçük bir cebirsel gözlem, büyük bir asimptotik kazanç.',
      minutes: 30,
      objectives: [
        'Böl-ve-fethet (divide and conquer) paradigmasını tamsayı çarpımına uygulamak.',
        'Dört alt problemli Mult1 algoritmasının okul yönteminden asimptotik olarak daha iyi olmadığını görmek.',
        'Karatsuba’nın $ad + bc = (a+b)(c+d) - ac - bd$ gözlemiyle üç alt problemle yetindiğini ve $n^{\\log_2 3} \\approx n^{1.585}$ işe indiğini açıklamak.',
      ],
      prerequisites: ['Özyineleme (recursion)', 'Logaritma kuralları: $a^{\\log_b n} = n^{\\log_b a}$'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi',
          label: 'intuition',
          body: `$1234 \\times 5678$’i $\\big((12\\cdot 100) + 34\\big)\\big((56 \\cdot 100) + 78\\big)$ olarak yazabiliriz. Genel olarak $x = 10^{n/2} a + b$, $y = 10^{n/2} c + d$ ise

$$x \\cdot y = 10^{n}\\,ac + 10^{n/2}(ad + bc) + bd.$$

Bu, $n/2$ basamaklı **dört** çarpım ($ac, ad, bc, bd$) ve birkaç ucuz toplama demektir. Şaşırtıcı bir şekilde bu tek başına kazanç getirmez. Karatsuba’nın fikri: aslında $ad$ ve $bc$’yi ayrı ayrı değil, yalnızca **toplamlarını** istiyoruz.`,
        },
        {
          kind: 'formal',
          title: 'İki algoritma',
          box: 'formal',
          label: 'formal',
          body: `**Mult1:** $ac, ad, bc, bd$’yi özyinelemeli hesapla. Yalnızca tek basamaklı çarpmaları sayarsak (notlardaki maliyet modeli) $T(n) = 4\\,T(n/2)$, $T(1) = 1$.

**Karatsuba:** $z_1 = ac$, $z_2 = bd$, $z_3 = (a+b)(c+d)$ hesapla; $ad + bc = z_3 - z_1 - z_2$. Bu $T(n) = 3\\,T(n/2)$ verir.

$n = 2^s$ için açarsak:
$$T(n) = 3T(n/2) = 3^2 T(n/4) = \\dots = 3^s T(1) = 3^{\\log_2 n} = n^{\\log_2 3} \\approx n^{1.585}.$$
Mult1 için aynı açılım $4^{\\log_2 n} = n^2$ verir — okul yöntemiyle aynı.`,
        },
        {
          kind: 'viz',
          title: 'Görselleştirme: özyineleme ağacı',
          viz: 'karatsuba',
          body: `Kendi sayılarınızı girin ve iki algoritmayı karşılaştırın. Ağaçtaki her kutu bir özyinelemeli çağrıdır; yapraklar tek basamaklı çarpmalardır. Sayaçlar ve aşağıdaki grafik, işlem sayısının basamak sayısıyla nasıl büyüdüğünü gösterir.`,
        },
        {
          kind: 'pseudocode',
          title: 'Sözde kod (Ders 3 notlarındaki Algoritma 2’ye dayanır)',
          code: [
            'Karatsuba(x, y):',
            '    if x and y are 1-digit: return x·y',
            '    split x = 10^m·a + b,  y = 10^m·c + d',
            '    z1 = Karatsuba(a, c)',
            '    z2 = Karatsuba(b, d)',
            '    z3 = Karatsuba(a + b, c + d)',
            '    z4 = z3 − z1 − z2          # = ad + bc',
            '    return z1·10^(2m) + z4·10^m + z2',
          ],
        },
        {
          kind: 'correctness',
          title: 'Neden doğru?',
          label: 'proofIdea',
          body: `Cebirsel özdeşlik: $(a+b)(c+d) = ac + ad + bc + bd$, dolayısıyla $z_3 - z_1 - z_2 = ad + bc$. Özyinelemeli çağrıların doğru çarptığını varsayarsak (tümevarım hipotezi), döndürülen değer tam olarak $10^{2m}ac + 10^m(ad+bc) + bd = xy$ olur. Özyineleme sonlanır çünkü alt problemlerdeki sayıların değeri küçülür ve sonunda tek basamaklı sayılara ulaşılır.`,
        },
        {
          kind: 'complexity',
          title: 'Karmaşıklık ve varsayımlar',
          body: `- **Ölçülen parametre:** $n$ = basamak sayısı. **Maliyet modeli:** tek basamaklı çarpma sayısı (toplamalar Ders 3’te $O(n)$ terimi olarak eklenecek).
- **Mult1:** $n^2$ — okul yönteminden iyi değil. **Karatsuba:** $n^{\\log_2 3} \\approx n^{1.585}$.
- Notlardaki analiz bilerek “özensiz”dir: $(a+b)$ ve $(c+d)$ aslında $n/2 + 1$ basamaklı olabilir ve toplama maliyeti yok sayıldı. Ders 3’te $T(n) = 3T(n/2) + O(n)$ bağıntısını Master Teoremi ile titizlikle çözeceğiz; sonuç değişmez: $O(n^{\\log_2 3})$.
- Tarihçe (notlardan): Toom–Cook $O(n^{1.465})$, Schönhage–Strassen $O(n \\log n \\log\\log n)$, Harvey–van der Hoeven (2019) $O(n \\log n)$.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- “Böl ve fethet her zaman hızlandırır.” — Mult1 bölüyor ama hâlâ $n^2$; kazanç alt problem **sayısını** azaltmaktan geliyor.
- “Karatsuba daha çok toplama yapıyor, o yüzden yavaş.” — Toplamalar $O(n)$; asimptotik olarak çarpımların yanında önemsiz.
- $3^{\\log_2 n}$ ile $n^3$’ü karıştırmak: $3^{\\log_2 n} = n^{\\log_2 3}$, yani $n^{1.585}$.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Her çağrıda $t$ tane $n/2$ basamaklı alt çarpım yapan bir böl-ve-fethet algoritması için tek basamaklı çarpma sayısı $n = 2^s$ iken nedir?',
          options: ['$t \\cdot n$', '$t^{\\log_2 n} = n^{\\log_2 t}$', '$n^t$', '$2^t n$'],
          answer: 1,
          hint: '$T(n) = t\\,T(n/2)$ bağıntısını $s$ kez açın.',
          explanation: '$T(n) = t^s T(1) = t^{\\log_2 n} = n^{\\log_2 t}$. $t=4$ için $n^2$, $t=3$ için $n^{1.585}$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Önceki sorudaki algoritma, çok büyük $n$ için hangi $t$ değerlerinde okul yönteminden ($n^2$) **daha az** tek basamaklı çarpma yapar?',
          options: ['Tüm $t$ değerlerinde', 'Yalnızca $t = 1, 2$', '$t = 1, 2, 3$', '$t = 1, 2, 3, 4$'],
          answer: 2,
          hint: '$n^{\\log_2 t} < n^2 \\iff \\log_2 t < 2$.',
          explanation: '$\\log_2 t < 2 \\iff t < 4$. $t = 4$ tam olarak $n^2$ verir (Mult1), daha iyi değil.',
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: '$x = 1234$, $y = 5678$ için Karatsuba’nın ilk seviyesinde $z_3 = (a+b)(c+d)$ kaçtır?',
          answer: 6164,
          hint: '$a = 12, b = 34, c = 56, d = 78$.',
          explanation: '$a + b = 46$, $c + d = 134$, $46 \\cdot 134 = 6164$. Kontrol: $ac = 672$, $bd = 2652$, $6164 - 672 - 2652 = 2840 = ad + bc$.',
        },
        {
          id: 'q4',
          kind: 'order',
          prompt: 'Karatsuba’nın bir çağrısındaki adımları doğru sıraya koyun.',
          items: [
            'Taban durumunu kontrol et (tek basamak mı?)',
            '$x$ ve $y$’yi $a, b, c, d$ olarak ikiye böl',
            '$z_1 = ac$, $z_2 = bd$, $z_3 = (a+b)(c+d)$ özyinelemeli hesapla',
            '$ad + bc = z_3 - z_1 - z_2$',
            '$10^{2m}z_1 + 10^m(ad+bc) + z_2$ döndür',
          ],
          hint: 'Önce durup durmayacağımıza karar veririz; birleştirme en sonda.',
          explanation: 'Taban durumu → bölme → üç özyinelemeli çağrı → çıkarma ile orta terim → birleştirme.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: $x = 47$, $y = 83$ için Karatsuba’yı elle çalıştırın. Kaç tek basamaklı çarpma yapılır? Aynı çarpımı Mult1 kaç tane ile yapar?`,
          hints: ['$a = 4, b = 7, c = 8, d = 3$.', '$a + b = 11$ ve $c + d = 11$ iki basamaklıdır; $z_3$ kendi içinde bir özyineleme daha yapar.'],
          solution: `$z_1 = 4\\cdot 8 = 32$ (1 çarpma), $z_2 = 7 \\cdot 3 = 21$ (1 çarpma), $z_3 = 11 \\cdot 11$: bu da bölünür ($1\\cdot1$, $1\\cdot1$, $2\\cdot2$ → 3 çarpma) ve $121$ verir. $ad + bc = 121 - 32 - 21 = 68$. Sonuç $3200 + 680 + 21 = 3901 = 47 \\cdot 83$. Toplam **5** tek basamaklı çarpma; Mult1 ise **4** yapar! Küçük girdilerde ve “taşma basamağı” yüzünden Karatsuba’nın avantajı görünmeyebilir; kazanç büyük $n$ için asimptotiktir. (Görselleştiricide 47 × 83’ü deneyin.)`,
        },
      ],
      sources: [SRC.l1.notes, SRC.l1.slides, SRC.l1.notebook, SRC.l1.concept, SRC.l3.notes],
    },
  ],
}
