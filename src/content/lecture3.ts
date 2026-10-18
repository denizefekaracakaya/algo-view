import type { Lecture } from './types'
import { SRC } from './sources'

export const lecture3: Lecture = {
  n: 3,
  title: 'Özyineleme bağıntılarını çözmek ve Master Teoremi',
  titleEn: 'Solving Recurrences and the Master Theorem',
  date: '12 Ocak 2026',
  blurb: 'Özyineleme ağaçları, Master Teoremi’nin üç durumu ve tahmin-et-doğrula: yerine koyma yöntemi.',
  lessons: [
    {
      id: 'l3-master',
      lecture: 3,
      title: 'Özyineleme ağaçları ve Master Teoremi',
      titleEn: 'Recursion trees and the Master Theorem',
      summary: 'Seviye toplamlarının geometrik dizisi: eşit mi, azalan mı, artan mı?',
      minutes: 35,
      objectives: [
        'Böl-ve-fethet algoritmalarının çalışma süresini özyineleme bağıntısı (recurrence relation) olarak yazmak.',
        'Bir özyineleme ağacında seviye başına alt problem sayısını, boyutu ve toplam işi hesaplamak.',
        'Master Teoremi’nin koşullarını kontrol edip doğru durumu ve sınırı seçmek; neden o durumun geçerli olduğunu açıklamak.',
        'Master Teoremi’nin uygulanamadığı bağıntıları tanımak.',
      ],
      prerequisites: ['MergeSort özyineleme ağacı', 'Geometrik seriler', 'Logaritma kuralları'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: üç kuvvetin yarışı',
          label: 'intuition',
          body: `$T(n) = a\\,T(n/b) + O(n^d)$ biçimindeki bir algoritmada iki kuvvet yarışır:

- **Dallanma** $a$: her seviyede alt problem sayısı $a$ katına çıkar.
- **Küçülme** $b^d$: her alt problemin özyinelemesiz işi $b^d$ kat azalır.

Seviye $j$’deki toplam iş $c\\,n^d (a/b^d)^j$’dir. Oran $1$ ise her seviye eşit iş yapar (MergeSort), $<1$ ise kök baskındır, $>1$ ise yapraklar baskındır (Karatsuba).`,
        },
        {
          kind: 'formal',
          title: 'Master Teoremi (Ders 3 notları, Teorem 1)',
          box: 'formal',
          label: 'formal',
          body: `$a \\ge 1$ (tam sayı), $b > 1$, $d \\ge 0$ sabitler ve $T(n) = a\\cdot T\\!\\left(\\frac{n}{b}\\right) + O(n^d)$, $T(1) = O(1)$ olsun. O hâlde
$$T(n) = \\begin{cases} O(n^d \\log n) & a = b^d \\\\ O(n^d) & a < b^d \\\\ O(n^{\\log_b a}) & a > b^d. \\end{cases}$$

**Koşullar:** tüm alt problemler **aynı boyutta** ($n/b$), sabit sayıda, ve $b > 1$. (Not 2: $\\lfloor n/b\\rfloor$, $\\lceil n/b\\rceil$ ya da $n/b + 1$ gibi küçük farklar sonucu değiştirmez.)

**Genel sürüm (Teorem 3):** $T(n) = aT(n/b) + f(n)$ için: $f(n) = O(n^{\\log_b a - \\varepsilon})$ ise $\\Theta(n^{\\log_b a})$; $f(n) = \\Theta(n^{\\log_b a})$ ise $\\Theta(n^{\\log_b a}\\log n)$; $f(n) = \\Omega(n^{\\log_b a + \\varepsilon})$ ve düzenlilik koşulu $a f(n/b) \\le c f(n)$ ($c<1$) sağlanırsa $\\Theta(f(n))$.`,
        },
        {
          kind: 'viz',
          title: 'Master Teoremi gezgini ve bağıntı oyun alanı',
          viz: 'master',
          body: `**Parametreler** sekmesinde $a$, $b$, $d$’yi ayrı ayrı girin; **Bağıntı yaz** sekmesinde kendi bağıntınızı yazın. Araç koşulları denetler, durumu seçer, nedenini gösterir ve özyineleme ağacının seviye toplamlarını listeler. Koşullar sağlanmıyorsa (farklı boyutlu alt problemler, $T(n-1)$, log çarpanlı boşluk durumu) sonucu sessizce uydurmaz; nedenini açıklar.`,
        },
        {
          kind: 'correctness',
          title: 'Kanıt fikri: özyineleme ağacı',
          label: 'formalProof',
          proof: [
            { title: 'Kurulum', body: '$T(1) = 1$ ve $n$’nin $b$’nin kuvveti olduğunu varsayalım. Bir $c > 0$ için $T(n) \\le a\\,T(n/b) + c\\,n^d$.' },
            { title: 'Seviye j', body: '$a^j$ alt problem, her biri $n/b^j$ boyutunda ve en fazla $c(n/b^j)^d$ özyinelemesiz iş: seviye toplamı $a^j c (n/b^j)^d = c\\,n^d (a/b^d)^j$.' },
            { title: 'Toplam', body: '$\\log_b n + 1$ seviye: $T(n) \\le c\\,n^d \\sum_{j=0}^{\\log_b n} (a/b^d)^j$.' },
            { title: 'Durum a = b^d', body: 'Her terim 1: toplam $(\\log_b n + 1)\\,c\\,n^d = O(n^d\\log n)$.' },
            { title: 'Durum a < b^d', body: 'Azalan geometrik seri, sonsuz toplam $\\frac{1}{1 - a/b^d}$ ile sınırlı (bir sabit): $O(n^d)$. Kök seviyesi baskın.' },
            {
              title: 'Durum a > b^d',
              body: 'Artan geometrik seri, son terim baskın: $O\\!\\left(n^d (a/b^d)^{\\log_b n}\\right) = O\\!\\left(n^d \\cdot \\frac{a^{\\log_b n}}{n^d}\\right) = O(a^{\\log_b n}) = O(n^{\\log_b a})$. Yapraklar baskın.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Derste görülen örnekler',
          body: `- **Mult1:** $T(n) = 4T(n/2) + O(n)$, $a = 4 > 2^1$ → $O(n^{\\log_2 4}) = O(n^2)$.
- **Karatsuba:** $T(n) = 3T(n/2) + O(n)$, $a = 3 > 2$ → $O(n^{\\log_2 3}) \\approx O(n^{1.59})$.
- **MergeSort:** $T(n) = 2T(n/2) + O(n)$, $a = 2 = 2^1$ → $O(n\\log n)$.
- **Örnek:** $T(n) = 2T(n/2) + O(n^2)$, $a = 2 < 4$ → $O(n^2)$.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- $T(n) = T(n/5) + T(7n/10) + n$ gibi **farklı boyutlu** alt problemlere Master Teoremi uygulamak. (Ders 4’te bu tam olarak Select’in bağıntısı; yerine koyma yöntemiyle çözülür.)
- $T(n) = T(n-1) + n$’e uygulamak: boyut bir sabitle bölünmüyor.
- $a$ ile $b^d$ yerine $a$ ile $b$’yi karşılaştırmak.
- $T(n) = 2T(n/2) + n\\log n$’i “$a = b^d$, cevap $n\\log n$” diye çözmek: iş terimi $n^d$ biçiminde değil; üç durumun arasındaki boşluğa düşer.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '$T(n) = 5T(n/4) + 2n$ özyineleme ağacında seviye 4’te kaç alt problem vardır? (Kök seviye 0.)',
          options: ['$625$', '$125$', '$1024$', '$4096$'],
          answer: 0,
          hint: 'Seviye $j$’de $a^j$ alt problem.',
          explanation: '$5^4 = 625$. Her biri $n/4^4 = n/256$ boyutunda.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: '$T(n) = 5T(n/4) + 2n$ için seviye $i$’deki toplam iş nedir?',
          options: ['$(4/5)^i \\cdot 2n$', '$(5/4)^i \\cdot 2n$', '$5^i \\cdot 2n$', '$2n$'],
          answer: 1,
          hint: '$a^i \\cdot 2\\,(n/b^i)$.',
          explanation: '$5^i \\cdot 2n/4^i = (5/4)^i\\,2n$; oran $>1$ olduğundan yapraklar baskın: $\\Theta(n^{\\log_4 5})$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: '$T(n) = 3T(n/81) + 10\\,n^{1/4}$ için hangisi doğrudur?',
          options: ['$\\Theta(n)$', '$\\Theta(n^{1/4}\\log n)$', '$\\Theta(n^{1/4})$', 'Master Teoremi uygulanamaz.'],
          answer: 1,
          hint: '$b^d = 81^{1/4}$ kaçtır?',
          explanation: '$81^{1/4} = 3 = a$, yani $a = b^d$: $\\Theta(n^{1/4}\\log n)$.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Master Teoremi hangi bağıntıya **doğrudan** uygulanabilir?',
          options: ['$T(n) = T(n/3) + T(2n/3) + n$', '$T(n) = T(n-1) + 1$', '$T(n) = 7T(n/2) + O(n^2)$', '$T(n) = 2T(n/2) + n\\log n$ (temel sürüm)'],
          answer: 2,
          hint: 'Aynı boyutlu alt problemler ve $n^d$ biçiminde iş arayın.',
          explanation: '$a = 7$, $b = 2$, $d = 2$: $7 > 4$ → $O(n^{\\log_2 7}) \\approx O(n^{2.81})$. Diğerleri koşulları sağlamaz.',
        },
        {
          id: 'q5',
          kind: 'numeric',
          prompt: '$T(n) = 2T(n/2) + O(n)$ için $n = 64$ iken özyineleme ağacında kaç seviye vardır?',
          answer: 7,
          hint: 'Seviyeler $0, 1, \\dots, \\log_2 n$.',
          explanation: '$\\log_2 64 + 1 = 7$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Bir algoritma $n$ boyutlu problemi $n/3$ boyutlu **9** alt probleme bölüyor ve birleştirme $O(n^2)$ sürüyor. Bağıntıyı yazın, Master Teoremi’nin koşullarını kontrol edin ve sonucu bulun. Birleştirme $O(n)$’e düşürülürse ne değişir?`,
          hints: ['$a = 9$, $b = 3$. $b^d$’yi her iki $d$ için hesaplayın.'],
          solution: `$T(n) = 9T(n/3) + O(n^2)$: $a = 9$, $b^d = 3^2 = 9$ → $a = b^d$ → $O(n^2\\log n)$. Birleştirme $O(n)$ olursa $b^d = 3 < 9$ → yapraklar baskın: $O(n^{\\log_3 9}) = O(n^2)$. Birleştirmeyi hızlandırmak yalnızca $\\log n$ çarpanını kazandırır; darboğaz artık alt problem sayısıdır.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: $T(n) = 4T(n/2) + n^2\\sqrt{n}$ bağıntısını çözün. Hangi seviye(ler) baskındır?`,
          hints: ['$d = 2.5$.'],
          solution: `$a = 4$, $b^d = 2^{2.5} \\approx 5.66 > 4$ → kök baskın: $O(n^{2.5})$. Seviye toplamları $(4/5.66)^j \\approx 0.71^j$ oranıyla azalır.`,
        },
      ],
      sources: [SRC.l3.pre, SRC.l3.notes, SRC.l3.slides, SRC.l3.concept, SRC.sec.s2, SRC.hw.hw2],
    },
    {
      id: 'l3-substitution',
      lecture: 3,
      title: 'Yerine koyma yöntemi',
      titleEn: 'The substitution method',
      summary: 'Bir sınır tahmin et, tümevarımla doğrula — Master Teoremi işe yaramadığında.',
      minutes: 25,
      objectives: [
        'Yerine koyma (substitution) yönteminin adımlarını sıralamak: tahmin, taban durumu, tümevarım hipotezi, yerine koyma, sadeleştirme, sabit seçimi.',
        'Farklı boyutlu alt problemli bağıntılar için doğrusal (ya da polinom) bir sınırı kanıtlamak.',
        'Bir tahminin neden başarısız olabileceğini (yanlış sınır ya da yanlış biçim) ayırt etmek.',
      ],
      prerequisites: ['Güçlü tümevarım', 'Master Teoremi dersi'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi',
          label: 'intuition',
          body: `Özyineleme ağacı karmaşıklaşınca (alt problemler farklı boyutlardaysa) cevabı **tahmin edip** tümevarımla doğrularız. Tahmin $T(n) \\le D\\cdot g(n)$ biçimindedir; $D$’yi önceden bilmeyiz — kanıtı yazarken $D$’nin hangi koşulu sağlaması gerektiğini **keşfederiz**.`,
        },
        {
          kind: 'formal',
          title: 'Yöntem (Ders 3–4 notları)',
          box: 'formal',
          label: 'formal',
          body: `$T(n) \\le f(n) + \\sum_{i=1}^k T(n_i)$ için tahmin: $T(n) \\le D\\,g(n)$ ($n \\ge n_0$).

1. **Taban:** $T(n_0) \\le D\\,g(n_0)$ olacak şekilde $D$ seçilebilir (ör. $T(1) = 1 \\le D$).
2. **Hipotez:** her $m < n$ için $T(m) \\le D\\,g(m)$.
3. **Adım:** $f(n) + \\sum_i D\\,g(n_i) \\le D\\,g(n)$ olmasını sağlayan $D$’yi bul.

Önce tümevarım adımından $D$ üzerindeki koşulu çıkarın, sonra taban durumuyla birleştirin.`,
        },
        {
          kind: 'viz',
          title: 'Adım adım yerine koyma',
          viz: 'substitution',
          body: `Hazır örneklerden birini seçin ya da kendi terimlerinizi girin. Araç, tahmin $T(n) \\le D\\,n^p$ için her cebirsel adımı gösterir ve ya geçerli bir $D$ bulur ya da tahminin neden başarısız olduğunu açıklar.`,
        },
        {
          kind: 'steps',
          title: 'Özgün çalışılmış örnek: $T(n) \\le T(n/3) + T(n/2) + n$',
          label: 'formalProof',
          proof: [
            { title: 'Tahmin', body: '$T(n) \\le D\\,n$ (doğrusal). Neden doğrusal? Alt problem boyutlarının toplamı $n/3 + n/2 = 5n/6 < n$: ağaçta seviyeler geometrik olarak küçülür.' },
            { title: 'Taban', body: '$T(1) = 1 \\le D$ ise sağlanır.' },
            { title: 'Hipotez', body: '$m < n$ için $T(m) \\le D\\,m$.' },
            { title: 'Yerine koy', body: '$T(n) \\le D\\frac{n}{3} + D\\frac{n}{2} + n = \\left(\\frac{5}{6}D + 1\\right) n$.' },
            { title: 'Koşul', body: '$\\left(\\frac{5}{6}D + 1\\right)n \\le D\\,n \\iff 1 \\le \\frac{D}{6} \\iff D \\ge 6$.' },
            { title: 'Sonuç', body: '$D = \\max(1, 6) = 6$ hem tabanı hem adımı sağlar: $T(n) \\le 6n$, yani $T(n) = O(n)$.' },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Başarısız tahminler (notlardaki örnekler)',
          body: `- **Yanlış sınır:** $T(n) = 2T(n/2) + n$ için $T(n) \\le Dn$ denersek $n + Dn \\le Dn$ gerekir — imkânsız. Tahmin fazla küçük; doğru cevap $\\Theta(n\\log n)$.
- **Doğru sınır, yanlış biçim:** $T(n) \\le 2T(n/2) + 1$ için $T(n) \\le cn$ denersek $cn + 1 \\le cn$ gerekir — başarısız. Ama $T(n) \\le cn - 1$ denersek $2(cn/2 - 1) + 1 = cn - 1$ ✓. Düşük mertebeli bir terim çıkarmak tümevarımı kurtarır.
- $D$’yi adım adım değiştirmek (her seviyede biraz büyütmek): $D$ tek bir sabit olmalıdır.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'order',
          prompt: 'Yerine koyma yönteminin adımlarını sıraya koyun.',
          items: [
            'Bir sınır tahmin et: $T(n) \\le D\\,g(n)$',
            'Taban durumunu yaz',
            'Tümevarım hipotezini kur ($m < n$ için)',
            'Hipotezi bağıntıya yerine koy ve sadeleştir',
            '$D$ için gereken koşulu çöz ve $D$’yi seç',
          ],
          hint: 'Tahmin olmadan hipotez kuramayız; $D$ en sonda belirlenir.',
          explanation: 'Tahmin → taban → hipotez → yerine koyma → $D$ seçimi (taban koşuluyla birlikte).',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: '$T(n) = 2T(n/2) + 3T(n/3) + n^2$ için tümevarımla kanıtlanabilecek en sıkı tahmin hangisidir?',
          options: ['$T(n) \\le 12n$', '$T(n) \\le n^3$', '$T(n) \\le 6n^2$', '$T(n) \\le 2n^2$'],
          answer: 2,
          hint: '$T(n) \\le Dn^2$ koyun: $2D/4 + 3D/9 + 1 \\le D$.',
          explanation: '$\\frac{D}{2} + \\frac{D}{3} + 1 \\le D \\iff D \\ge 6$. $2n^2$ fazla küçük, $n^3$ gevşek, $12n$ ise $n^2$ terimini karşılayamaz.',
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'Select bağıntısı $T(n) \\le T(n/5) + T(7n/10) + cn$ için tahmin $T(n) \\le Dn$. $c = 3$ ise gereken en küçük $D$ kaçtır?',
          answer: 30,
          hint: '$\\frac{D}{5} + \\frac{7D}{10} + c \\le D$.',
          explanation: '$\\frac{9}{10}D + c \\le D \\iff D \\ge 10c = 30$.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: '$T(n) \\le 2T(n/2) + 1$ için $T(n) \\le cn$ tahmini tümevarımda başarısız oluyor. Bu ne anlama gelir?',
          options: [
            '$T(n)$, $O(n)$ değildir.',
            'Sınır doğru olabilir ama tahminin biçimi tümevarıma uygun değil; $cn - 1$ gibi daha güçlü bir hipotez denenmeli.',
            'Yerine koyma yöntemi bu bağıntı için hiç çalışmaz.',
            'Taban durumu yanlış seçilmiştir.',
          ],
          answer: 1,
          hint: 'Notlardaki ikinci başarısız örneği hatırlayın.',
          explanation: '$T(n) = O(n)$ doğrudur. $cn - 1$ hipotezi $2(cn/2 - 1) + 1 = cn - 1$ verir ve tümevarım tamamlanır.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: $T(n) \\le T(n/4) + T(n/2) + T(n/8) + n$, $T(1) = 1$. $T(n) = O(n)$ olduğunu yerine koyma ile gösterin ve uygun $D$’yi bulun.`,
          hints: ['$1/4 + 1/2 + 1/8 = ?$', 'Koşul $D(1 - s) \\ge 1$.'],
          solution: `$s = \\frac14 + \\frac12 + \\frac18 = \\frac78$. Adım: $\\frac78 D n + n \\le Dn \\iff D \\ge 8$. Taban $D \\ge 1$. Seçim $D = 8$: $T(n) \\le 8n$. (Aracı bu terimlerle çalıştırarak kontrol edin.)`,
        },
      ],
      sources: [SRC.l3.notes, SRC.l3.slides, SRC.l4.notes, SRC.l3.concept, SRC.sec.s2],
    },
  ],
}
