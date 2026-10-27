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
      minutes: 50,
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
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: '$T(n) = 4T(n/2) + n^2$ için özyineleme ağacının $j$. seviyesindeki toplam iş nedir?',
              options: ['$n^2$ (her seviyede aynı)', '$n^2 / 2^j$', '$4^j n^2$', '$n^2 \\log n$'],
              answer: 0,
              hint: '$a^j \\cdot (n/b^j)^d$ ifadesini $a = 4$, $b = 2$, $d = 2$ ile hesaplayın.',
              explanation: '$4^j (n/2^j)^2 = n^2$: oran $a/b^d = 1$, her seviye eşit iş yapar ve sonuç $O(n^2\\log n)$.',
            },
          ],
          label: 'intuition',
          body: `$T(n) = a\\,T(n/b) + O(n^d)$ biçimindeki bir algoritmada iki kuvvet yarışır:

- **Dallanma** $a$: her seviyede alt problem sayısı $a$ katına çıkar.
- **Küçülme** $b^d$: her alt problemin özyinelemesiz işi $b^d$ kat azalır.

Seviye $j$’deki toplam iş $c\\,n^d (a/b^d)^j$’dir. Oran $1$ ise her seviye eşit iş yapar (MergeSort), $<1$ ise kök baskındır, $>1$ ise yapraklar baskındır (Karatsuba).`,
        },
        {
          kind: 'formal',
          title: 'Master Teoremi (Ders 3 notları, Teorem 1)',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Hangisi Master Teoremi’nin (Teorem 1) bir koşulu **değildir**?',
              options: ['$a \\ge 1$ bir tam sayı', '$b > 1$', 'Tüm alt problemler aynı boyutta ($n/b$)', '$d$ bir tam sayı olmalı'],
              answer: 3,
              hint: '$T(n) = 4T(n/2) + n^{1.5}$ gibi bağıntıları düşünün.',
              explanation: '$d \\ge 0$ herhangi bir gerçel sayı olabilir (ör. $d = 1/4$ ya da $2.5$). $a$ ise alt problem sayısı olduğu için tam sayıdır.',
            },
          ],
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
          tasks: [
            '**Parametreler** sekmesinde $a = 2$, $b = 2$ ile başla; $d$’yi $0.5$, $1$ ve $2$ yap. Her seferinde hangi durum seçiliyor ve seviye tablosu nasıl değişiyor?',
            '**Bağıntı yaz** sekmesinde “Select (MoM)” ve “T(n−1)” örneklerini dene. Araç neden çözmeyi reddediyor, ne öneriyor?',
            '“Boşluk durumu” örneğini çalıştır: genel sürüm (Teorem 3) ne diyor?',
            'Ağaç derinliği kaydırıcısıyla $n$’yi büyüt: “Göreli” sütunu hangi seviyenin baskın olduğunu nasıl gösteriyor?',
          ],
          viz: 'master',
          body: `**Parametreler** sekmesinde $a$, $b$, $d$’yi ayrı ayrı girin; **Bağıntı yaz** sekmesinde kendi bağıntınızı yazın. Araç koşulları denetler, durumu seçer, nedenini gösterir ve özyineleme ağacının seviye toplamlarını listeler. Koşullar sağlanmıyorsa (farklı boyutlu alt problemler, $T(n-1)$, log çarpanlı boşluk durumu) sonucu sessizce uydurmaz; nedenini açıklar.`,
        },
        {
          kind: 'correctness',
          title: 'Kanıt fikri: özyineleme ağacı',
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: '$a = 8$, $b = 2$, $d = 2$ için ardışık seviye toplamlarının oranı $a/b^d$ kaçtır?',
              answer: 2,
              hint: '$b^d = 4$.',
              explanation: '$8/4 = 2 > 1$: seviye işleri her seviyede ikiye katlanır, yapraklar baskın: $O(n^{\\log_2 8}) = O(n^3)$.',
            },
          ],
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
          kind: 'text',
          title: 'Pratikte: Master Teoremi ile tanıdık algoritmalar',
          body: `- **İkili arama:** $T(n) = T(n/2) + O(1)$; $a = 1 = 2^0 = b^d$ → $O(\\log n)$.
- **Strassen matris çarpımı:** $T(n) = 7T(n/2) + O(n^2)$; $7 > 4$ → $O(n^{\\log_2 7}) \\approx O(n^{2.81})$. Basit özyinelemeli matris çarpımı ise $8T(n/2) + O(n^2) = O(n^3)$.
- **FFT** (polinom çarpımı, sinyal işleme) ve **en yakın nokta çifti:** $T(n) = 2T(n/2) + O(n)$ → $O(n\\log n)$.
- **Ağaç tabanlı toplama** (ör. tam ikili ağaçta her düğümü bir kez ziyaret): $T(n) = 2T(n/2) + O(1)$ → $O(n)$.

Alt problemler farklı boyutlardaysa Master Teoremi yetmez; yerine koyma yöntemi ya da daha genel **Akra–Bazzi** teoremi kullanılır. Hızlı bir kontrol için bağıntıyı küçük bir programla sayısal olarak hesaplayıp $T(n)/f(n)$ oranına bakmak da iyi bir alışkanlıktır.`,
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'İkili aramanın bağıntısı $T(n) = T(n/2) + O(1)$ Master Teoremi’nin hangi durumuna girer?',
              options: ['$a = b^d$ → $O(\\log n)$', '$a < b^d$ → $O(1)$', '$a > b^d$ → $O(n)$', 'Uygulanamaz'],
              answer: 0,
              hint: '$a = 1$, $b = 2$, $d = 0$.',
              explanation: '$b^d = 2^0 = 1 = a$: $O(n^0\\log n) = O(\\log n)$.',
            },
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'Basit özyinelemeli matris çarpımı $T(n) = 8T(n/2) + O(n^2)$’nin çözümü $O(n^k)$ biçimindedir. $k$ kaçtır?',
              answer: 3,
              hint: '$\\log_2 8$.',
              explanation: '$8 > 2^2$ → $O(n^{\\log_2 8}) = O(n^3)$: bölmek tek başına kazandırmaz; Strassen 7 alt çarpımla üssü düşürür.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Teorem uygulanamadığında: $T(n) = 2T(n/2) + n\\log_2 n$',
          label: 'proofIdea',
          proof: [
            { title: 'Neden uymuyor?', body: 'İş terimi $n\\log n$, hiçbir $d$ için $\\Theta(n^d)$ değildir: $n$’den hızlı, her $n^{1+\\varepsilon}$’dan yavaş büyür. Teorem 1’in koşulu sağlanmaz; ama özyineleme ağacı hâlâ çalışır.' },
            { title: 'Seviye j', body: '$2^j$ alt problem, her biri $n/2^j$ boyutunda ve $\\frac{n}{2^j}\\log_2\\frac{n}{2^j}$ iş yapıyor: seviye toplamı $n(\\log_2 n - j)$.' },
            { title: 'Toplam', body: '$L = \\log_2 n$ ile $\\sum_{j=0}^{L-1} n(L - j) = n\\,(L + (L-1) + \\dots + 1) = n\\frac{L(L+1)}{2}$.' },
            { title: 'Sonuç', body: '$T(n) = \\Theta(n\\log^2 n)$: ne $n\\log n$ ne de $n^{1+\\varepsilon}$. Seviyeler eşit değil ama yavaşça küçülüyor, bu yüzden toplam “seviye sayısı × kök” mertebesinde kalıyor.' },
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: '$n = 8$ için yapraklar hariç seviye toplamlarının toplamı $\\sum_{j=0}^{2} n(\\log_2 n - j)$ kaçtır?',
              answer: 48,
              hint: '$8 \\cdot 3 + 8 \\cdot 2 + 8 \\cdot 1$.',
              explanation: '$24 + 16 + 8 = 48 = 8 \\cdot \\frac{3 \\cdot 4}{2}$.',
            },
          ],
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
      minutes: 40,
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
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Yerine koyma yönteminde sabit $D$ ne zaman belirlenir?',
              options: ['En başta, rastgele seçilir', 'Kanıtı yazarken ortaya çıkan koşullardan, en sonda', 'Her seviyede ayrı ayrı', 'Hiç gerekmez'],
              answer: 1,
              hint: 'Önce adımın neyi gerektirdiğine bakarız.',
              explanation: 'Tümevarım adımı $D$ üzerinde bir koşul verir (ör. $D \\ge 10c$); taban durumunun koşuluyla birleştirip tek bir sabit seçeriz. Sabit, $n$’ye ya da seviyeye göre değişemez.',
            },
          ],
          label: 'intuition',
          body: `Özyineleme ağacı karmaşıklaşınca (alt problemler farklı boyutlardaysa) cevabı **tahmin edip** tümevarımla doğrularız. Tahmin $T(n) \\le D\\cdot g(n)$ biçimindedir; $D$’yi önceden bilmeyiz — kanıtı yazarken $D$’nin hangi koşulu sağlaması gerektiğini **keşfederiz**.`,
        },
        {
          kind: 'formal',
          title: 'Yöntem (Ders 3–4 notları)',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: '$T(n) \\le T(n/2) + T(n/4) + n$, $T(1) = 1$ için $T(n) \\le Dn$ tahmininin tümevarım adımı en küçük hangi $D$ ile tutar?',
              answer: 4,
              hint: '$\\tfrac{D}{2} + \\tfrac{D}{4} + 1 \\le D$.',
              explanation: '$\\tfrac34 D + 1 \\le D \\iff D \\ge 4$; taban $D \\ge 1$ ile birlikte $D = 4$.',
            },
          ],
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
          tasks: [
            '“Özgün örnek”te adımları tek tek aç ve 6. adımdaki koşulu kendin çözmeye çalış; sonra 7. adımla karşılaştır.',
            '“Başarısız tahmin: 2T(n/2)+n” örneğinde çelişki adımını oku. Tahmin neden fazla küçük?',
            'Kendi terimlerini gir: $T(n/2) + T(n/3) + T(n/6) + n$. Oranların toplamı kaç? Araç ne diyor?',
          ],
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
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'Aynı yöntemi $T(n) \\le T(n/4) + T(n/2) + n$ için uygulayın. $T(n) \\le D\\,n$ adımının çalışması için en küçük $D$ kaçtır?',
              answer: 4,
              hint: 'Alt problemlerin toplamı $n/4 + n/2 = 3n/4$.',
              explanation: '$D\\frac{n}{4} + D\\frac{n}{2} + n = \\left(\\frac{3}{4}D + 1\\right)n \\le D\\,n \\iff D \\ge 4$. Taban için $D \\ge 1$ de gerekir: $D = 4$, yani $T(n) \\le 4n$.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: hangi bağıntıya hangi yöntem?',
          body: `Bir bağıntıyla karşılaştığınızda şu sırayla düşünmek işe yarar:

1. **Alt problemler aynı boyutta mı ($aT(n/b)$)?** Master Teoremi; iş terimi log çarpanı içeriyorsa genel sürüm.
2. **Farklı boyutlar, oranların toplamı $< 1$ mi?** (ör. $T(n/5) + T(7n/10)$) Doğrusal tahminle yerine koyma: $D = c/(1 - \\sum)$.
3. **Oranların toplamı tam $1$ mi?** (ör. $T(n/4) + T(3n/4) + n$) Her seviye $\\approx n$ iş: $n\\log n$ tahmin edip yerine koyma ya da özyineleme ağacı.
4. **Boyut sabit miktar azalıyor mu ($T(n-1)$)?** Bağıntıyı açıp toplamı hesaplayın.
5. **Emin değil misiniz?** Bağıntıyı küçük bir programla sayısal olarak hesaplayın, $T(n)/g(n)$ oranının sınırlı kalıp kalmadığına bakın; sonra kanıtlayın.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: '$T(n) = T(n/4) + T(3n/4) + n$ için en uygun yaklaşım hangisidir?',
              options: [
                'Master Teoremi',
                '$T(n) \\le Dn$ ile yerine koyma',
                '$T(n) \\le Dn\\log n$ tahmini ile yerine koyma (ya da özyineleme ağacı)',
                'Bağıntıyı $T(n-1)$ gibi açmak',
              ],
              answer: 2,
              hint: '$\\tfrac14 + \\tfrac34 = 1$.',
              explanation: 'Oranların toplamı 1 olduğundan her tam seviye $n$ iş yapar ve $\\Theta(\\log n)$ seviye vardır: $\\Theta(n\\log n)$. Doğrusal tahmin $\\tfrac{D}{4}n + \\tfrac{3D}{4}n + n \\le Dn$ gerektirir — imkânsız.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Klasik tuzak: Big-O’yu tümevarımın içine koymak',
          label: 'proofIdea',
          proof: [
            { title: 'Yanlış iddia', body: '“$T(n) = 2T(n/2) + n$ ise $T(n) = O(n)$.” Gerçekte $T(n) = \\Theta(n\\log n)$, yani aşağıdaki kanıtta bir hata olmalı.' },
            { title: 'Sahte kanıt', body: 'Hipotez: $m < n$ için $T(m) = O(m)$. O hâlde $T(n) = 2\\,O(n/2) + n = O(n) + n = O(n)$.' },
            { title: 'Hata', body: 'Her satırdaki $O$ farklı bir sabit saklıyor. Hipotezi $T(m) \\le c\\,m$ diye açık yazarsak adım $T(n) \\le cn + n = (c + 1)n$ verir: hipotezdeki **aynı** $c$ ile $T(n) \\le cn$ elde edilemedi.' },
            { title: 'Sabit büyüyor', body: 'Her seviyede sabit 1 artar: $c, c + 1, c + 2, \\dots$; $\\log_2 n$ seviye sonra $c + \\log_2 n$ olur. Bu bir sabit değildir ve karşımıza çıkan $n\\log n$’nin ta kendisidir.' },
            { title: 'Kural', body: 'Tümevarım hipotezini **her zaman açık bir sabitle** yazın ($T(m) \\le D\\,m$) ve adımın sonunda aynı $D$’yi elde edin. $O(\\cdot)$ yalnızca sonuç cümlesinde kullanılır.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Bir öğrenci $T(n) = T(n-1) + n$ için “hipotez $T(n-1) = O(n)$, dolayısıyla $T(n) = O(n) + n = O(n)$” yazıyor. Hangisi doğrudur?',
              options: [
                'Kanıt doğrudur: $T(n) = O(n)$',
                'Kanıt yanlıştır; gerçekte $T(n) = \\Theta(n^2)$ ve hata, $O$’nun her adımda farklı bir sabit saklaması',
                'Kanıt doğrudur ama taban durumu eksiktir',
                'Kanıt yanlıştır; gerçekte $T(n) = \\Theta(n\\log n)$',
              ],
              answer: 1,
              hint: 'Bağıntıyı açın: $n + (n-1) + \\dots$',
              explanation: '$T(n) = n + (n-1) + \\dots + 1 = \\Theta(n^2)$. Açık sabitle: $T(n-1) \\le c(n-1)$ ise $T(n) \\le cn - c + n$ ve bu, $c \\ge n$ olmadıkça $cn$’yi aşar; $c$ sabit kalamaz.',
            },
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
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: $T(n) = 4T(n/2) + n$, $T(1) = 1$. $T(n) \\le cn^2$ tahmini tümevarımda neden takılır? Hipotezi güçlendirerek $T(n) = O(n^2)$ olduğunu kanıtlayın.`,
          hints: ['Yerine koyun: $4c(n/2)^2 + n = ?$', '$T(n) \\le cn^2 - dn$ deneyin.'],
          solution: `$4c\\frac{n^2}{4} + n = cn^2 + n > cn^2$: fazladan $n$’den kurtulamıyoruz. Daha güçlü hipotez $T(m) \\le cm^2 - dm$: $4\\left(c\\frac{n^2}{4} - d\\frac{n}{2}\\right) + n = cn^2 - 2dn + n \\le cn^2 - dn \\iff d \\ge 1$. Taban $T(1) = 1 \\le c - d$; örneğin $d = 1$, $c = 2$. Böylece $T(n) \\le 2n^2 - n = O(n^2)$; aslında $n$ ikinin kuvvetiyken eşitlik vardır ($T(2) = 6$, $T(4) = 28$). Master Teoremi de $a = 4 > b^d = 2$ ile $\\Theta(n^2)$ der.`,
        },
      ],
      sources: [SRC.l3.notes, SRC.l3.slides, SRC.l4.notes, SRC.l3.concept, SRC.sec.s2],
    },
  ],
}
