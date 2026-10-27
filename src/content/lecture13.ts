import type { Lecture } from './types'
import { SRC } from './sources'
import { KNAPSACK01_CODE, LCS_CODE, MWIS_CODE } from '../engines/dp'

export const lecture13: Lecture = {
  n: 13,
  title: 'Daha fazla dinamik programlama: LCS, sırt çantası, bağımsız küme',
  titleEn: 'More Dynamic Programming: LCS, Knapsack, Independent Set',
  date: '23 Şubat 2026',
  blurb: 'Alt problemi bulmak için bir tarif: önekler, kapasiteler ve alt ağaçlar.',
  lessons: [
    {
      id: 'l13-lcs',
      lecture: 13,
      title: 'En uzun ortak altdizi (LCS)',
      titleEn: 'Longest common subsequence (LCS)',
      summary: 'Öneklerin tablosu, üç komşudan bir değer ve geriye doğru izleme.',
      minutes: 45,
      objectives: [
        'Bir DP algoritması tasarlamanın beş adımını sıralamak.',
        'LCS için öneklerden oluşan alt problemleri ve $C[i, j]$ bağıntısını türetmek.',
        'Tabloyu doldurup geri izlemeyle ortak altdiziyi bulmak.',
        'Sürenin $O(mn)$, geri izlemenin $O(m + n)$ olduğunu göstermek.',
      ],
      prerequisites: ['Dinamik programlama fikri (Ders 12)'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: iki dizinin ortak iskeleti',
          label: 'intuition',
          body: `$Z$, $X$’ten bazı semboller **silinerek** elde edilebiliyorsa $X$’in bir **altdizisidir** (harfler sırasını korur ama yan yana olmak zorunda değildir): “baab”, “abracadabra”nın altdizisidir. İki dizinin **en uzun ortak altdizisi** (LCS), ikisinin de altdizisi olan en uzun dizidir. Notlardaki örnek: abracadabra ve bxqrabry’nin LCS’si “brabr”.

Uygulamalar: yazım denetimi, \`diff\` gibi dosya karşılaştırma araçları, DNA dizilerinin benzerliği.

Tüm altdizileri denemek üsteldir ($2^m$ altdizi). DP fikri: problemi **öneklere** böl. $X$ ile $Y$’nin son harflerine bakmak, problemi daha kısa öneklere indirir.`,
        },
        {
          kind: 'steps',
          title: 'Bir DP algoritması nasıl tasarlanır? (Ders 13 notları)',
          body: `1. **Optimal alt yapıyı bul:** optimal çözüm, alt problemlerin optimal çözümlerine nasıl ayrılır? Alt problemler örtüşmeli.
2. **Optimumun değerini özyinelemeli tanımla.**
3. **Optimum değeri bul:** bağıntıyı bir tablo dolduran algoritmaya çevir.
4. **Optimal çözümün kendisini bul:** tabloda yeterli bilgiyi tutup geri izle.
5. **Uygulamayı iyileştir:** bellek ve süre (CS161 bu adıma az girer).`,
        },
        {
          kind: 'formal',
          title: 'Bağıntı',
          box: 'formal',
          label: 'formal',
          body: `$C[i, j]$ = $X[1..i]$ ile $Y[1..j]$’nin LCS uzunluğu.

- **Son harfler eşitse** ($x_i = y_j = \\ell$): her LCS $\\ell$ ile biter (bitmeyen bir ortak altdiziye $\\ell$ eklenebilirdi). $C[i, j] = C[i-1, j-1] + 1$.
- **Farklıysa:** LCS’nin son harfi $x_i$’den ya da $y_j$’den farklıdır; ikisinden biri LCS’de kullanılamaz: $C[i, j] = \\max(C[i-1, j],\\ C[i, j-1])$.
- **Taban:** $C[i, 0] = C[0, j] = 0$.

Her hücre yalnızca üç komşusuna bakar: üst, sol, sol-üst çapraz.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: '“abracadabra” ile “bxqrabry”nin LCS uzunluğu kaçtır?',
              answer: 5,
              hint: 'Notlardaki örnek: “brabr”.',
              explanation: '“brabr” her iki dizinin de altdizisidir ve daha uzun bir ortak altdizi yoktur: $C[11, 8] = 5$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'LCS tablosu görselleştiricisi',
          viz: 'lcs',
          tasks: [
            'Varsayılan girdide tabloyu doldurun: son hücre $C[7, 6]$ kaç?',
            'Geri izlemede hangi adımlarda çapraz, hangilerinde sola ya da yukarı gidiliyor?',
            'Kendi iki kelimenizi girin (ör. adınız ve soyadınız). LCS ne çıktı?',
            '**Tahmin modu**nda bazı hücrelerin değerini önceden hesaplayın.',
          ],
          body: `Satırlar $X$’in, sütunlar $Y$’nin harfleridir. Sarı hücre hesaplanan, mavi hücre kullandığı komşudur. Tablo dolunca $C[m, n]$’den geriye doğru yürünür; yeşil hücreler geri izleme yoludur.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'X = ABCBDAB ve Y = BDCABA için LCS uzunluğu kaçtır?',
              answer: 4,
              hint: 'Görselleştiricinin varsayılan girdisi.',
              explanation: '$C[7, 6] = 4$; örneğin BCBA ve BDAB ikisi de uzunluğu 4 olan ortak altdizilerdir. LCS tek olmak zorunda değildir.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'lenLCS ve geri izleme (notlar, Algoritma 1–2)',
          code: LCS_CODE,
          body: `Geri izleme: $X[i] = Y[j]$ ise harfi başa ekle ve çapraz git; değilse tablonun söylediği yöne (değer nereden geldiyse) git. Her adımda $i + j$ en az 1 azalır.`,
        },
        {
          kind: 'complexity',
          title: 'Süre',
          body: `Tabloda $(m + 1)(n + 1)$ hücre var, her biri $O(1)$: **$O(mn)$**. Geri izleme $O(m + n)$. Yalnızca uzunluk isteniyorsa iki satır yeter: $O(\\min(m, n))$ bellek.

Bu basit algoritma bilinen en iyisidir: $O(mn)$’yi polinom ölçüde iyileştirmek, önemli bir karmaşıklık varsayımını (SAT için güçlü üstel zaman hipotezi) çürütürdü.`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'Uzunlukları 6 ve 8 olan iki dizinin LCS tablosunda (boş önekler için 0. satır ve sütun dahil) kaç hücre vardır?',
              answer: 63,
              hint: '$(m + 1)(n + 1)$.',
              explanation: '$7 \\cdot 9 = 63$ hücre, her biri $O(1)$’de doldurulur.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: diff ve DNA',
          body: `- **\`diff\` ve sürüm kontrolü:** iki dosyanın satırları arasında en uzun ortak altdizi bulunur; ortak olmayan satırlar “silindi/eklendi” diye gösterilir. Git’in kullandığı algoritmalar (Myers) aynı probleme farklı bir yoldan, değişiklik az olduğunda çok hızlı çözüm getirir.
- **Biyoinformatik:** DNA ve protein dizilerini hizalamak (Needleman–Wunsch, Smith–Waterman) aynı tablo yapısını puanlarla kullanır.
- **Düzenleme uzaklığı (edit distance):** “kitap”tan “kitaplık”a kaç ekleme/silme/değiştirmeyle gidilir? Neredeyse aynı tablo; yazım önerileri böyle çalışır.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'İki dosya sırasıyla 10 000 ve 12 000 satır. LCS tablosu kaç hücre içerir (yaklaşık)?',
              options: ['$2.2 \\cdot 10^4$', '$1.2 \\cdot 10^8$', '$10^{12}$', '$2^{10000}$'],
              answer: 1,
              hint: '$(m + 1)(n + 1)$.',
              explanation: '$\\approx 1.2 \\cdot 10^8$ hücre: hızlı ama bellekte tutmak pahalı. Gerçek araçlar bu yüzden farklı uzaklığın küçük olduğu durumlara özel algoritmalar kullanır.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: akraba bir problem, düzenleme uzaklığı',
          label: 'formal',
          body: `Aynı tasarım tarifi (alt problemler, bağıntı, tablo) başka bir dizi problemine de uygulanır. **Düzenleme uzaklığı** (Levenshtein): $X$’i $Y$’ye çevirmek için gereken en az ekleme, silme ve değiştirme sayısı. Yazım denetleyicileri “bunu mu demek istediniz?” önerisini böyle bulur.`,
          proof: [
            { title: 'Alt problem', body: '$E[i][j]$: $X$’in ilk $i$ harfini $Y$’nin ilk $j$ harfine çevirmenin maliyeti. Taban: $E[i][0] = i$ ($i$ silme), $E[0][j] = j$ ($j$ ekleme).' },
            { title: 'Bağıntı', body: 'Son harfler eşitse $E[i][j] = E[i-1][j-1]$. Değilse üç seçenekten en ucuzu: $1 + \\min(E[i-1][j]$ (sil), $E[i][j-1]$ (ekle), $E[i-1][j-1]$ (değiştir)$)$. LCS’teki “iki durum”un neredeyse aynısı.' },
            { title: 'Örnek', body: 'SUNDAY → SATURDAY: S aynı; A ve T eklenir; U aynı; N, R ile değiştirilir; D, A, Y aynı. Toplam 3 işlem ve daha azı mümkün değil: tablonun sağ alt köşesi 3.' },
            { title: 'Süre', body: 'Yine $(m + 1)(n + 1)$ hücre, her biri $O(1)$: $O(mn)$. Geri izleme işlemlerin listesini verir.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'CAT ile CUT arasındaki düzenleme uzaklığı kaçtır?',
              answer: 1,
              hint: 'Hangi harfler farklı?',
              explanation: 'Yalnızca ortadaki harf farklı: A → U, tek bir değiştirme.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Altdiziyi alt**dize** (substring, bitişik) ile karıştırmak.
- Harfler farklıyken $C[i-1, j-1]$’den devam etmek: doğru olan, üst ve sol komşunun büyüğüdür.
- Geri izlemeyi baştan ($i = 1$) yapmaya çalışmak: tablo sondan başa doğru okunur.
- LCS’nin tek olduğunu sanmak: aynı uzunlukta birden çok LCS olabilir; geri izlemedeki eşitlik kuralı hangisinin bulunacağını belirler.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '$x_i \\ne y_j$ iken $C[i, j]$ nasıl hesaplanır?',
          options: ['$C[i-1, j-1] + 1$', '$\\max(C[i-1, j], C[i, j-1])$', '$C[i-1, j-1]$', '$\\min(C[i-1, j], C[i, j-1])$'],
          answer: 1,
          hint: 'Son harflerden biri LCS’de kullanılamaz.',
          explanation: 'Ya $x_i$ ya $y_j$ atılır; hangisi daha uzun LCS veriyorsa o seçilir.',
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: '“algoritma” ve “logaritma” kelimelerinin LCS uzunluğu kaçtır?',
          answer: 7,
          hint: 'İkisi de “...ritma” ile bitiyor.',
          explanation: 'Örneğin “lgritma” ya da “loritma”: 7 harf. Görselleştiricide “algoritma” ve “logaritma” girerek doğrulayabilirsiniz.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'LCS tablosunu doldurmanın süresi nedir ($|X| = m$, $|Y| = n$)?',
          options: ['$O(m + n)$', '$O(mn)$', '$O(2^{m})$', '$O(mn \\log n)$'],
          answer: 1,
          hint: 'Hücre sayısı × hücre başına iş.',
          explanation: '$(m+1)(n+1)$ hücre, her biri üç komşuya bakar: $O(mn)$.',
          feedback: { 2: 'Bu, tüm altdizileri tek tek denemenin süresidir.' },
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: '$X$’in uzunluğu 0 ise LCS uzunluğu nedir?',
          options: ['0', '$|Y|$', '1', 'Tanımsız'],
          answer: 0,
          hint: 'Taban durumu.',
          explanation: 'Boş diziyle her dizinin LCS’si boştur: $C[0, j] = 0$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: X = “KARTAL”, Y = “KATAR”. LCS tablosunu doldurun ve geri izlemeyle bir LCS bulun.`,
          hints: ['İlk satır (K) ve ilk sütun (K) eşleşmesiyle başlar.', 'Cevabın uzunluğu 4.'],
          solution: `Satırlar K, A, R, T, A, L; sütunlar K, A, T, A, R. Tablonun son hücresi $C[6, 5] = 4$. Geri izleme “KATA”yı verir: X’in 1, 2, 4, 5. harfleri ve Y’nin 1, 2, 3, 4. harfleri. “KAR” da ortak bir altdizidir ama uzatılamaz: X’te R’den sonra yalnızca T, A, L gelir, Y’de ise R son harftir. Görselleştiricide X = KARTAL, Y = KATAR girerek kontrol edin.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: yalnızca **ekleme ve silmeye** izin verilirse (değiştirme yok), SUNDAY’i SATURDAY’e çevirmek kaç işlem sürer? Bunu LCS ile nasıl hesaplarsınız?`,
          hints: ['LCS’teki harfler yerinde kalır; geri kalan her harf ya silinir ya eklenir.', 'LCS(SUNDAY, SATURDAY) = SUDAY.'],
          solution: `LCS’in harfleri dokunulmadan kalır; $X$’in geri kalan harfleri silinir, $Y$’nin geri kalanları eklenir. İşlem sayısı $|X| + |Y| - 2\\,|LCS|$. LCS = SUDAY (uzunluk 5): $6 + 8 - 10 = 4$ işlem (N’yi sil; A, T, R’yi ekle). Değiştirmeye izin verilince bir sil + ekle çifti (N → R) tek işleme iner ve düzenleme uzaklığı 3 olur. Unix’teki diff aracı tam bu ekle/sil sürümünü kullanır.`,
        },
      ],
      sources: [SRC.l13.notes, SRC.l13.slides, SRC.l13.concept],
    },
    {
      id: 'l13-knapsack',
      lecture: 13,
      title: 'Sırt çantası ve ağaçta bağımsız küme',
      titleEn: 'Knapsack and independent set in a tree',
      summary: 'Kapasiteye göre alt problemler, “al ya da alma” ve alt ağaçlarda iki değer.',
      minutes: 50,
      objectives: [
        'Sınırsız ve 0/1 sırt çantası için alt problemleri ve bağıntıları yazmak.',
        '0/1 sırt çantasında neden ikinci bir boyutun (eşya sayısı) gerektiğini açıklamak.',
        '$O(nW)$’nin neden “sözde polinom” olduğunu açıklamak.',
        'Bir ağaçta en ağır bağımsız kümeyi $A(u)$ ve $B(u)$ değerleriyle doğrusal zamanda bulmak.',
      ],
      prerequisites: ['LCS ve DP tarifi'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: hangi eşyaları alalım?',
          label: 'intuition',
          body: `$n$ eşyanın her birinin ağırlığı $w_i$ ve değeri $v_i$ var; sırt çantası en çok $W$ ağırlık taşır. Değeri en büyük yapmak istiyoruz. Notlardaki örnek ($W = 10$): A (6, 25), B (3, 13), C (4, 15), D (2, 8).

- **Sınırsız sırt çantası:** her eşyadan istediğimiz kadar. En iyisi 2 B + 2 D: ağırlık 10, değer 42.
- **0/1 sırt çantası:** her eşyadan en fazla bir tane. En iyisi A + C: ağırlık 10, değer 40.

“Değer/ağırlık oranı en yüksek olanı al” açgözlü kuralı burada yanılabilir (görselleştiricideki ikinci örneğe bakın); DP ise her zaman doğru.`,
        },
        {
          kind: 'formal',
          title: 'Bağıntılar',
          box: 'formal',
          label: 'formal',
          body: `**Sınırsız:** $K(x)$ = $x$ kapasiteli çantanın en iyi değeri. En iyi çantada $i$ eşyası varsa, geri kalanı $x - w_i$ kapasitenin en iyisidir:
$$K(x) = \\max_{i:\\ w_i \\le x} \\big(K(x - w_i) + v_i\\big),\\quad K(0) = 0.$$

**0/1:** artık her eşya bir kez kullanılabildiği için “hangi eşyalar hâlâ seçilebilir?” bilgisini de tutmalıyız. $K(x, j)$ = $x$ kapasite, yalnızca ilk $j$ eşya:
$$K(x, j) = \\max\\big(K(x, j-1),\\ K(x - w_j, j-1) + v_j\\big)$$
(ikinci seçenek yalnızca $w_j \\le x$ iken). Birinci terim “$j$’yi alma”, ikincisi “$j$’yi al”.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Notlardaki eşyalarla ($W = 10$) **sınırsız** sırt çantasının en iyi değeri kaçtır?',
              answer: 42,
              hint: 'B’nin ve D’nin değer/ağırlık oranları yüksek.',
              explanation: '2 B + 2 D: $2 \\cdot 13 + 2 \\cdot 8 = 42$, ağırlık $6 + 4 = 10$. 0/1 sürümünde aynı eşyalarla en iyisi 40’tır (A + C).',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Sırt çantası tablosu görselleştiricisi',
          viz: 'knapsack',
          tasks: [
            '0/1 sürümünde notlardaki örneği doldurun. Hangi satırda değer 25’ten 40’a sıçrıyor?',
            'Sınırsız sürüme geçin: $K[10]$ kaç? Hangi $K[x]$ değerlerinden geldi?',
            '“Oran açgözlüsü yanılır” örneğinde oranı en yüksek eşyayı (P) almak ne verir, DP ne buluyor?',
          ],
          body: `0/1 sürümünde satırlar “ilk $j$ eşya”, sütunlar kapasite $x$’tir. Sarı hücre hesaplanan; mavi hücreler “alma” (bir üstteki) ve “al” (bir üst satırda $w_j$ sola) seçeneklerinin baktığı hücreler. Sonda yeşil yol, hangi eşyaların alındığını gösterir.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: '“Oran açgözlüsü yanılır” örneğinde (W = 8; P: 5 kg, 10; Q: 4 kg, 7; R: 4 kg, 7) 0/1 sırt çantasının en iyi değeri kaçtır?',
              answer: 14,
              hint: 'P’yi alınca 3 kg yer kalıyor.',
              explanation: 'Q + R: 8 kg, değer 14. Oranı en yüksek P’yi (2.0) almak yalnızca 10 verir.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'ZeroOneKnapsack (notlar, Algoritma 4)',
          code: KNAPSACK01_CODE,
          body: `Tablo $(W + 1)(n + 1)$ hücreli; her hücre $O(1)$: **$O(nW)$**. Seçilen eşyalar geri izlemeyle bulunur: $K(x, j) \\ne K(x, j - 1)$ ise $j$ alınmıştır ve $x$, $w_j$ azalır.`,
        },
        {
          kind: 'complexity',
          title: 'Sözde polinom süre',
          body: `$O(nW)$ polinom gibi görünür, ama girdi boyutu $W$’yi değil, $W$’yi yazmak için gereken $\\log W$ biti içerir. $W = 2^{60}$ ise tablo kullanılamaz. Bu tür algoritmalara **sözde polinom** denir.

Sırt çantası NP-zordur: gerçek anlamda polinom bir algoritma, birçok ünlü problemi de polinom zamanda çözerdi. Pratikte $W$ küçükse DP mükemmel çalışır.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Neden $O(nW)$ süreli sırt çantası algoritması “polinom” sayılmaz?',
              options: [
                'Çünkü $n$ çok büyük olabilir.',
                'Çünkü girdi boyutu $\\log W$’ye bağlıdır; $W$ bit sayısında üsteldir.',
                'Çünkü algoritma yanlış sonuç verebilir.',
                'Çünkü tablo doldurmak her zaman üsteldir.',
              ],
              answer: 1,
              hint: '$W$ sayısını yazmak kaç bit tutar?',
              explanation: '$W$ yaklaşık $\\log_2 W$ bitle yazılır; $W = 2^{\\text{bit}}$ olduğundan süre girdi uzunluğunda üstel olabilir.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Ağaçta en ağır bağımsız küme',
          box: 'formal',
          label: 'formal',
          body: `$S \\subseteq V$ kümesinin içindeki hiçbir iki düğüm arasında kenar yoksa $S$ **bağımsızdır**. Ağırlıkları toplamı en büyük bağımsız kümeyi bulmak genel grafiklerde NP-zordur, ama **ağaçlarda** doğrusal zamanda çözülür.

Ağacı bir $r$ düğümünden köklendirin; $T_u$, $u$’nun alt ağacıdır. İki değer tutun:

- $A(u)$ = $T_u$’daki en ağır bağımsız küme,
- $B(u)$ = $T_u \\setminus \\{u\\}$’daki en ağır bağımsız küme = $\\sum_{v \\text{ çocuk}} A(v)$.

$u$ kümede değilse çocuklar serbesttir: $\\sum A(v)$. $u$ kümedeyse çocukları olamaz: $w_u + \\sum B(v)$. Böylece
$$A(u) = \\max\\Big(\\sum_{v} A(v),\\ w_u + \\sum_{v} B(v)\\Big).$$
Değerler yapraklardan köke (post-order) hesaplanır; cevap $A(r)$.`,
        },
        {
          kind: 'viz',
          title: 'Bağımsız küme görselleştiricisi',
          viz: 'mwis',
          tasks: [
            'Yapraklardan köke doğru her düğümün $A$ ve $B$ değerlerini izleyin.',
            'Kökte “$a$’yı al” mı yoksa “alma” mı kazanıyor? Neden?',
            '**Tahmin modu**nda iç düğümlerin $A$ değerini önceden hesaplayın.',
          ],
          body: `Düğümün içindeki sayı ağırlığıdır; işlenen düğümlerin altında $A$ ve $B$ yazar. Sonda yeşil düğümler bulunan kümedir.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'Görselleştiricideki ağaçta en ağır bağımsız kümenin ağırlığı kaçtır?',
              answer: 25,
              hint: 'Kökte $\\max(\\sum A, 5 + \\sum B)$.',
              explanation: '$A(a) = \\max(11 + 2 + 9,\\ 5 + 11 + 0 + 9) = 25$: küme $\\{a, e, i, g, h\\}$.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'MaxWeightIndependentSet (notlar, Algoritma 5)',
          code: MWIS_CODE,
          body: `Her düğüm bir kez işlenir ve çocuklarının değerlerini toplar; her kenar bir kez sayılır: **$O(|V|)$**.`,
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: açgözlü neden yetmez?',
          label: 'formal',
          body: `Akla ilk gelen kural: değer/ağırlık oranı en yüksek eşyadan başla. Kendi örneğimiz: kapasite $W = 10$; A (ağırlık 6, değer 30), B (5, 20), C (5, 20).`,
          proof: [
            { title: 'Açgözlü', body: 'Oranlar: A 5, B 4, C 4. Önce A alınır (ağırlık 6); kalan 4 birime ne B ne C sığar. Değer: 30.' },
            { title: 'Optimal', body: 'A’yı almayıp B ve C’yi alırsak ağırlık tam 10, değer 40. Açgözlü seçim (A) hiçbir optimal çözümde yoktur: değiştirme argümanı burada çalışmaz.' },
            { title: 'DP neden kurtarır?', body: '$K[i][x]$ her kapasite $x$ için en iyi değeri tutar; A’yı “almak” ve “almamak” iki seçeneğini de dener. Tablo $K[3][10] = 40$ bulur.' },
            { title: 'Kesirli sürüm', body: 'Eşyaları bölebilseydik (toz, sıvı) açgözlü kural optimal olurdu: A’nın tamamı ve B’nin 4/5’i, değer $30 + 16 = 46$. Tam sayı kısıtı problemi zorlaştıran şeydir.' },
          ],
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'Bu örnekte (W = 10; A 6/30, B 5/20, C 5/20) 0/1 sırt çantasının optimal değeri kaçtır?',
              answer: 40,
              hint: 'A’sız seçenekleri de deneyin.',
              explanation: 'B + C: ağırlık 10, değer 40. A ile en fazla 30 (A + B ya da A + C kapasiteyi aşar).',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- 0/1 sırt çantasını tek boyutlu $K(x)$ ile çözmeye çalışmak: aynı eşya birden çok kez sayılır.
- Açgözlü oranı her zaman doğru sanmak (kesirli sırt çantasında doğrudur; 0/1’de değil).
- Bağımsız kümede $u$ alınınca yalnızca torunların $A$ değerlerine bakmak yerine $B(v)$’yi kullanmayı unutmak: $B$, torun alt problemlerini ayrıca çözme zahmetini ortadan kaldırır.
- $O(nW)$’yi gerçek polinom süre sanmak.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'numeric',
          prompt: 'Notlardaki eşyalarla ($W = 10$) **0/1** sırt çantasının en iyi değeri kaçtır?',
          answer: 40,
          hint: 'A ve C’nin ağırlıkları toplamı 10.',
          explanation: 'A + C: 25 + 15 = 40. B + C + D (9 kg) yalnızca 36 verir.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: '0/1 sırt çantasında $K(x, j)$’nin “al” seçeneği hangi hücreye bakar?',
          options: ['$K(x - w_j, j)$', '$K(x - w_j, j - 1)$', '$K(x, j - 1)$', '$K(x - 1, j)$'],
          answer: 1,
          hint: 'Eşya $j$ alındıysa geri kalan eşyalar hangileri olabilir?',
          explanation: '$j$ bir kez kullanıldı; geri kalan $x - w_j$ kapasite yalnızca ilk $j - 1$ eşyayla doldurulur. $K(x - w_j, j)$ sınırsız sürümün davranışıdır.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Ağaçta en ağır bağımsız küme algoritmasının süresi nedir?',
          options: ['$O(|V|)$', '$O(|V|\\log|V|)$', '$O(|V|^2)$', '$O(2^{|V|})$'],
          answer: 0,
          hint: 'Her düğüm bir kez.',
          explanation: 'Post-order dolaşım; her düğümde çocuk sayısı kadar iş: toplam $O(|V|)$.',
          feedback: { 3: 'Bu, tüm alt kümeleri denemenin süresidir; ağaç yapısı DP’ye izin verir.' },
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: 'Ağırlıkları sırasıyla 4, 1, 1, 4 olan 4 düğümlü bir yol grafiğinde (bir zincir) en ağır bağımsız kümenin ağırlığı kaçtır?',
          answer: 8,
          hint: 'Uçtaki iki düğüm komşu değil.',
          explanation: 'Uçlar $\\{1, 4\\}$: $4 + 4 = 8$. Açgözlü “ağır olanı al” burada çalışır ama 1, 3, 3, 1 gibi örneklerde dikkat gerekir.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: W = 7 ve eşyalar X (3 kg, 9), Y (4 kg, 11), Z (2 kg, 5). Hem 0/1 hem sınırsız sırt çantası için en iyi değeri ve seçimi bulun.`,
          hints: ['0/1: X + Y tam 7 kg.', 'Sınırsız: X + X + ? veya X + Z + Z?'],
          solution: `**0/1:** X + Y = 7 kg, değer 20 (X + Z = 14, Y + Z = 16). **Sınırsız:** $K(2) = 5$, $K(3) = 9$, $K(4) = 11$, $K(5) = 14$, $K(6) = 18$ (X + X) ve $K(7) = \\max(K(4) + 9,\\ K(3) + 11,\\ K(5) + 5) = \\max(20, 20, 19) = 20$, yani yine X + Y. Burada kopya almak işe yaramıyor.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: aynı eşyalar (A 6/30, B 5/20, C 5/20) ama her eşyadan **sınırsız** sayıda alınabiliyor, $W = 10$. Optimal değer nedir? $W = 11$ olsaydı?`,
          hints: ['Sınırsız sürümün bağıntısı: $K[x] = \\max_i (K[x - w_i] + v_i)$.', 'B’den iki tane alınabilir mi?'],
          solution: `$W = 10$: B iki kez (ağırlık 10, değer 40) ya da B + C, yine 40; A’yla en fazla 30 (A’dan sonra 4 birim kalır). Optimal 40. $W = 11$: A + B (ağırlık 11, değer 50) en iyisidir; iki B 40, tek A 30. Tablo: $K[x] = 0$ ($x < 5$), $20$ ($5 \\le x < 6$), $30$ ($6 \\le x < 10$), $40$ ($x = 10$), $50$ ($x = 11$). Kapasiteyi bir birim artırmak optimal çözümü tamamen değiştirebilir; açgözlü bir kural bunu yakalayamaz.`,
        },
      ],
      sources: [SRC.l13.notes, SRC.l13.slides, SRC.l13.concept],
    },
  ],
}
