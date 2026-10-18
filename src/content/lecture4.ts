import type { Lecture } from './types'
import { SRC } from './sources'
import { SELECT_CODE } from '../engines/select'

export const lecture4: Lecture = {
  n: 4,
  title: 'Medyan ve seçim',
  titleEn: 'Median and Selection',
  date: '14 Ocak 2026',
  blurb: 'k. en küçük elemanı doğrusal zamanda bulmak: pivotla böl, tek tarafa özyinele, medyanların medyanı.',
  lessons: [
    {
      id: 'l4-select',
      lecture: 4,
      title: 'Select: k. en küçük eleman',
      titleEn: 'Select: the k-th smallest element',
      summary: 'Sıralamadan, doğrusal zamanda sıra istatistiği (order statistic) bulmak.',
      minutes: 40,
      objectives: [
        'Seçim problemini (selection) 1 tabanlı $k$ ile tanımlamak ve sıralama tabanlı $O(n\\log n)$ çözümle karşılaştırmak.',
        'Pivot etrafında bölümlemenin neden yalnızca **bir** tarafa özyinelemeyi yettiğini açıklamak; $k$’nin nasıl güncellendiğini hesaplamak.',
        'Pivot seçiminin doğruluğu değil yalnızca çalışma süresini etkilediğini görmek.',
        'Medyanların medyanı ile $|A_<|, |A_>| \\le 7n/10 + 5$ garantisini ve $T(n) \\le T(n/5) + T(7n/10) + cn = O(n)$ sonucunu açıklamak.',
        'En kötü durum, beklenen süre ve deterministik garanti arasındaki farkı ayırt etmek.',
      ],
      prerequisites: ['Yerine koyma yöntemi', 'MergeSort', 'Güçlü tümevarım'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: sırasız dizide ikili arama',
          label: 'intuition',
          body: `Bir pivot $p$ seçin ve diziyi $p$’den küçükler ($A_<$) ile büyükler ($A_>$) olarak ayırın. $|A_<|$’yi bilince, aradığımız $k$. elemanın hangi tarafta olduğunu kesin olarak biliriz — diğer tarafı tamamen **atabiliriz**. İkili aramaya benzer; ama dizi sıralı değil, her adımda bölümleme yaparız.

Özel durum $k = 1$ (minimum): tek bir tarama $O(n)$’de yeter ve her deterministik algoritma her elemana bakmak zorunda olduğundan $\\Omega(n)$ gerekir. Genel $k$ için de $O(n)$ mümkün mü? Evet!`,
        },
        {
          kind: 'formal',
          title: 'Problem ve algoritma',
          box: 'formal',
          label: 'formal',
          body: `**Girdi:** $n$ sayıdan oluşan $A$ dizisi ve $k \\in \\{1, \\dots, n\\}$. **Çıktı:** $A$’nın $k$. en küçük elemanı.

Notlar elemanların farklı olduğunu varsayar. Aşağıdaki sürüm tekrarlı değerlerde de doğru çalışsın diye $A_= = \\{A[i] = p\\}$ kümesini de oluşturur; elemanlar farklıysa $A_= = \\{p\\}$ olur ve notlardaki algoritmayla aynıdır:

- $|A_<| \\ge k$ ise cevap $A_<$ içindeki $k$. eleman.
- $|A_<| < k \\le |A_<| + |A_=|$ ise cevap $p$.
- Aksi hâlde cevap $A_>$ içindeki $(k - |A_<| - |A_=|)$. eleman.`,
        },
        {
          kind: 'viz',
          title: 'Seçim görselleştiricisi',
          viz: 'select',
          body: `Dizi ve $k$ girin, pivot stratejisini seçin. Elenen elemanlar taralı ve ✕ ile gösterilir; konumları orijinal dizide korunur. **Tahmin modu**nda her bölümlemeden sonra algoritmanın hangi dalı seçeceğini tahmin edin. “Sıralı” örnekte “ilk eleman” stratejisinin kaç çağrı yaptığını “medyanların medyanı” ile karşılaştırın.`,
        },
        {
          kind: 'pseudocode',
          title: 'Sözde kod',
          code: SELECT_CODE,
        },
        {
          kind: 'steps',
          title: 'Bir tarafı atmak neden güvenli?',
          label: 'proofIdea',
          body: `Pivot $p$’den küçük tam olarak $|A_<|$ eleman var. Dizinin sıralı hâlinde $A_<$’nin elemanları ilk $|A_<|$ konumu, $p$’ye eşitler sonraki $|A_=|$ konumu, $A_>$ kalan konumları kaplar. Aradığımız $k$. konum bu üç bloktan tam olarak birine düşer; diğer bloklardaki hiçbir eleman $k$. konumda olamaz. $A_>$’ye geçerken, atılan $|A_<| + |A_=|$ elemanın hepsi aranandan küçük (veya eşit) olduğundan sıra $k' = k - |A_<| - |A_=|$ olur.`,
        },
        {
          kind: 'correctness',
          title: 'Doğruluk (güçlü tümevarım, Ders 4 notları)',
          label: 'formalProof',
          proof: [
            { title: 'Hipotez', body: '$n$ boyutlu her dizi ve $k \\in \\{1..n\\}$ için Select $k$. en küçüğü döndürür.' },
            { title: 'Taban (n = 1)', body: '$k = 1$ olmak zorunda; tek eleman döndürülür — doğru.' },
            { title: 'Adım', body: 'Hipotez $n < i$ için doğru olsun; $|A| = i$. Üç durum: (1) $|A_<| = k-1$: tam $k-1$ eleman $p$’den küçük, $p$ cevaptır. (2) $|A_<| > k-1$: $k$. en küçük $A_<$ içindedir; $|A_<| < i$ olduğundan hipotez uygulanır. (3) $|A_<| < k-1$: cevap $A_>$ içinde sırası $k - |A_<| - 1$ olan elemandır; $1 \\le k - |A_<| - 1 \\le |A_>|$ ve $|A_>| < i$.' },
            { title: 'Pivot kuralı', body: 'Hiçbir adım $p$’nin nasıl seçildiğini kullanmadı: ChoosePivot doğruluğu değil yalnızca çalışma süresini etkiler.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Karmaşıklık: pivot seçimi her şeyi değiştirir',
          body: `**Ölçülen parametre:** $n$ = dizi boyutu; maliyet: karşılaştırma/temel işlem.

- **Kötü pivot (her seferinde min ya da maks):** $T(n) = T(n-1) + \\Theta(n) = \\Theta(n^2)$ — **en kötü durum**. Sıralı dizide “ilk eleman” kuralı bunu yapar.
- **Mükemmel pivot (tam medyan):** $T(n) \\le T(n/2) + cn \\le 2cn = O(n)$ — ama medyanı bulmak çözmeye çalıştığımız problemin ta kendisi.
- **Rastgele pivot:** en kötü durum yine $\\Theta(n^2)$ (çok şanssız seçimler), ama **her girdi için beklenen** süre $O(n)$ (notlar sonucu belirtir; Ders 5 kavram kontrolü bunu QuickSelect olarak inceler).
- **Medyanların medyanı (Blum–Floyd–Pratt–Rivest–Tarjan, 1973):** **deterministik en kötü durum** $O(n)$.

**Lemma (notlar):** $|A_<| \\le \\frac{7n}{10} + 5$ ve $|A_>| \\le \\frac{7n}{10} + 5$. Sezgi: grupların yaklaşık yarısının medyanı $p$’den küçüktür ve bu grupların her birinde en az 3 eleman $p$’den küçüktür → elemanların yaklaşık %30’u $p$’den küçük, yani $A_>$ en fazla ~%70.

Bağıntı: $T(n) \\le cn + T(n/5) + T(7n/10)$ (sadeleştirilmiş). Master Teoremi uygulanamaz (farklı boyutlar), ama yerine koyma ile $T(n) \\le Dn$, $D = \\max(1, 10c)$ ⇒ $O(n)$. Anahtar: $\\frac15 + \\frac{7}{10} = \\frac{9}{10} < 1$.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- $A_>$’ye özyinelerken $k$’yi güncellemeyi unutmak (ya da 1 yerine $|A_=|$ çıkarmayı unutmak).
- 0 tabanlı ve 1 tabanlı $k$’yi karıştırmak: bu derste $k = 1$ en küçük elemandır.
- “Rastgele pivot en kötü durumda $O(n)$” demek: hayır, garanti **beklenen** süre içindir.
- Medyanların medyanının gerçek medyan olduğunu sanmak: yalnızca “yeterince ortada” olduğu garanti edilir.
- 5’li gruplarda $\\frac15 + \\frac{7}{10} < 1$ olduğu için kanıt işler; 3’lü gruplarda $\\frac13 + \\frac23 = 1$ olur ve doğrusal sınır kaybolur.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '$n = 20$, $k = 12$. Pivotla bölümleme sonrası $|A_<| = 7$, $|A_>| = 12$ (elemanlar farklı). Algoritma ne yapar?',
          options: ['Select($A_<$, 12)', 'p’yi döndürür', 'Select($A_>$, 4)', 'Select($A_>$, 5)'],
          answer: 2,
          hint: '$|A_<| + 1 = 8 < 12$; atılan eleman sayısı 8.',
          explanation: '$k' + "'" + ' = 12 - 7 - 1 = 4$: $A_>$ içinde 4. en küçük eleman aranır.',
          feedback: { 3: 'Pivotu da atmayı unutmayın: $12 - 7 - 1 = 4$.' },
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Bölümleme sonrası $|A_<| = k - 1$ ise ne olur?',
          options: ['$A_<$ içinde özyinelenir', 'Pivot $p$ cevaptır', '$A_>$ içinde $k$ ile özyinelenir', 'Algoritma hata verir'],
          answer: 1,
          hint: 'Kaç eleman $p$’den küçük?',
          explanation: 'Tam $k-1$ eleman $p$’den küçük olduğundan $p$’nin kendisi $k$. en küçüktür.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Rastgele pivotlu Select için hangisi doğrudur?',
          options: [
            'En kötü durum $O(n)$’dir.',
            'Her girdi için beklenen süre $O(n)$, en kötü durum $\\Theta(n^2)$’dir.',
            'Yalnızca rastgele girdilerde doğru sonuç verir.',
            'Beklenen süre $O(n \\log n)$’dir.',
          ],
          answer: 1,
          hint: 'Beklenti, algoritmanın kendi rastgele seçimleri üzerindendir; doğruluk pivottan bağımsızdır.',
          explanation: 'Çok şanssız seçimler $\\Theta(n^2)$ verebilir ama olasılığı düşüktür; beklenen süre her girdi için $O(n)$. Doğruluk her zaman garanti.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Select’i 7’li gruplarla yazarsak bağıntı ($T(n) = O(n) + T(n/a) + T(bn/c)$) en küçük tam sayılarla nasıl olur?',
          options: ['$T(n/7) + T(5n/7)$', '$T(n/7) + T(6n/7)$', '$T(n/5) + T(7n/10)$', '$T(n/7) + T(4n/7)$'],
          answer: 0,
          hint: 'Grupların yarısında en az 4 eleman pivottan küçüktür: $\\frac12 \\cdot \\frac{n}{7}\\cdot 4 = \\frac{2n}{7}$.',
          explanation: 'Pivot en az $\\approx 2n/7$ elemandan büyük (ve küçük), bu yüzden diğer taraf en fazla $\\approx 5n/7$. $\\frac17 + \\frac57 = \\frac67 < 1$ → yine $O(n)$.',
        },
        {
          id: 'q5',
          kind: 'mcq',
          prompt: '3’lü gruplarla Select’in bağıntısı $T(n) = n + T(n/3) + T(2n/3)$ olur. Hangisi doğrudur?',
          options: ['$T(n) = \\Theta(n)$', '$T(n) = \\Theta(n\\log n)$', '$T(n) = \\Theta(n^2)$', '$T(n) = \\Theta(\\log n)$'],
          answer: 1,
          hint: 'Alt problem boyutlarının toplamı tam $n$; özyineleme ağacının her seviyesi $\\approx n$ iş yapar.',
          explanation: '$\\frac13 + \\frac23 = 1$: her seviye $n$ iş yapar ve yaklaşık $\\log_{3/2} n$ seviye vardır → $\\Theta(n\\log n)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: $A = [9, 3, 15, 1, 12, 7, 4, 11, 6, 2, 14, 8]$ ve $k = 6$. İlk pivot olarak 8 seçilirse $A_<$, $A_>$ ve yeni $k$ ne olur? Sonra $A_<$ içinde pivot 4 seçilirse?`,
          hints: ['8’den küçükler: 3, 1, 7, 4, 6, 2.', '$|A_<| = 6 \\ge k = 6$ → $A_<$’de kal.'],
          solution: `$A_< = [3, 1, 7, 4, 6, 2]$, $|A_<| = 6 \\ge 6$ → $k$ değişmez, $A_<$’de devam. Pivot 4: $A_< = [3, 1, 2]$ ($|A_<| = 3$), $A_> = [7, 6]$. $3 + 1 = 4 < 6$ → $A_>$’ye, $k' = 6 - 3 - 1 = 2$. $A_> = [7, 6]$’nın 2. en küçüğü **7**. Kontrol: sıralı $A$ = 1 2 3 4 6 **7** 8 9 11 12 14 15 ✓. (Görselleştiricide bu diziyi deneyin.)`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: $k$. en küçük elemandan küçük **tüm** elemanları (sırasız) $O(n)$ zamanda nasıl döndürürsünüz?`,
          hints: ['Önce $k$. elemanı bulun.'],
          solution: `Select ile $x = k$. en küçük elemanı $O(n)$’de bulun, sonra diziyi bir kez tarayıp $x$’ten küçük elemanları toplayın: $O(n) + O(n) = O(n)$.`,
        },
      ],
      sources: [SRC.l4.pre, SRC.l4.notes, SRC.l4.slides, SRC.l4.notebook, SRC.l4.concept, SRC.sec.s2, SRC.hw.hw3],
    },
  ],
}
