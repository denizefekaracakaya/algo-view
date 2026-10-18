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
      minutes: 55,
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
          title: 'Neden seçme? Medyan ve sıra istatistikleri',
          label: 'intuition',
          body: `Bir kargo şirketi bir günde teslim ettiği 50 000 paketin teslim sürelerini inceliyor. “Paketlerin yarısı X saatten kısa sürede ulaşıyor” demek için **medyanı**, “paketlerin %95’i Y saatten kısa sürede ulaşıyor” demek için **95. yüzdeliği** bilmek gerekir. İkisi de aynı sorunun örneğidir: dizi sıralansaydı $k$. sırada duracak değer nedir?

- **Medyan** bu derste $\\lceil n/2 \\rceil$. en küçük elemandır. $n$ çiftse iki ortadan küçüğü (alt medyan) alınır; algoritmalarda dizinin kendisinden bir eleman isteriz, iki elemanın ortalamasını değil.
- Medyan **aykırı değerlere** (outlier) dayanıklıdır: tek bir paket yanlışlıkla 900 saat sürmüş görünse ortalama fırlar, medyan neredeyse kıpırdamaz.
- Yüzdelikler (ör. bir web servisinin p99 yanıt süresi) $k = \\lceil 0.99\\,n \\rceil$ için seçme problemidir.

İlk akla gelen çözüm diziyi sıralayıp $k$. elemanı almaktır: $O(n\\log n)$. Ama sıralama $n$ sorunun cevabını birden verir; bize yalnızca biri lazım. Daha az işle yetinebilir miyiz?`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: '$A = [14, 3, 8, 21, 5, 11]$ dizisinin bu dersteki tanıma göre medyanı ($k = \\lceil n/2 \\rceil$) hangisidir?',
              options: ['$8$', '$11$', '$9.5$', '$14$'],
              answer: 0,
              hint: 'Sıralı hâli $[3, 5, 8, 11, 14, 21]$; $n = 6$ için $k = 3$.',
              explanation: '$\\lceil 6/2 \\rceil = 3$. en küçük eleman $8$’dir (alt medyan).',
              feedback: { 2: '$9.5$ istatistikteki “iki ortanın ortalaması”. Seçme probleminde dizinin bir elemanını, alt medyanı alırız.', 1: '$11$ üst medyandır; bu ders $\\lceil n/2 \\rceil$. elemanı kullanır.' },
            },
          ],
        },
        {
          kind: 'intuition',
          title: 'Sezgi: sırasız dizide ikili arama',
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Elemanlar farklı ve pivot $p$ için $|A_<| = 9$. $p$ dizinin kaçıncı en küçük elemanıdır?',
              answer: 10,
              hint: '$p$’den küçük kaç eleman var?',
              explanation: '$p$’den küçük tam 9 eleman olduğundan $p$, 10. en küçüktür. Genel olarak pivotun sırası $|A_<| + 1$’dir.',
            },
          ],
          label: 'intuition',
          body: `Bir pivot $p$ seçin ve diziyi $p$’den küçükler ($A_<$) ile büyükler ($A_>$) olarak ayırın. $|A_<|$’yi bilince, aradığımız $k$. elemanın hangi tarafta olduğunu kesin olarak biliriz — diğer tarafı tamamen **atabiliriz**. İkili aramaya benzer; ama dizi sıralı değil, her adımda bölümleme yaparız.

Özel durum $k = 1$ (minimum): tek bir tarama $O(n)$’de yeter ve her deterministik algoritma her elemana bakmak zorunda olduğundan $\\Omega(n)$ gerekir. Genel $k$ için de $O(n)$ mümkün mü? Evet!`,
        },
        {
          kind: 'text',
          title: 'Küçük k ve bir alt sınır',
          label: 'proofIdea',
          body: `**k = 1 (minimum).** Diziyi bir kez tarayıp şimdiye kadarki en küçüğü tutmak $n-1$ karşılaştırma yapar. Daha azı mümkün değildir: minimum dışındaki her eleman en az bir karşılaştırmada “büyük” çıkmış olmalıdır. Hiç kaybetmemiş bir elemanı her şeyden küçük bir değerle değiştirirsek algoritma aynı soruları sorar, aynı cevapları alır ve artık yanlış olan aynı çıktıyı verir. Her karşılaştırmanın tek bir kaybedeni olduğundan $n-1$ kaybeden için en az $n-1$ karşılaştırma gerekir.

**Küçük k.** Şimdiye kadarki en küçük $k$ elemanı sıralı bir listede tutarsak her yeni eleman en fazla $k$ karşılaştırma ister: $O(kn)$. Sabit $k$ için doğrusaldır; ama medyan için ($k \\approx n/2$) $O(n^2)$ olur — sıralamaktan da kötü.

**Her algoritma $\\Omega(n)$ ister.** Doğru bir algoritma bir elemanı hiç okumadan cevap verirse, o elemanı değiştirip cevabın sırasını kaydırabiliriz (örneğin onu her şeyden küçük yaparak). Algoritma o elemanı okumadığı için yine aynı cevabı verir ve yanılır. Demek ki her elemana bakılmalıdır; $O(n)$ bir seçme algoritması asimptotik olarak en iyisidir.`,
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: '50 farklı sayının en küçüğünü yalnızca karşılaştırma yaparak bulan her algoritma, en kötü durumda en az kaç karşılaştırma yapmak zorundadır?',
              answer: 49,
              hint: 'Minimum dışındaki her eleman en az bir kez “kaybetmeli”.',
              explanation: '49 eleman en az birer kez kaybetmeli ve her karşılaştırmanın tek kaybedeni var: en az $n - 1 = 49$ karşılaştırma. Basit tarama tam bu kadar yapar.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Problem ve algoritma',
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: '$A = [15, 4, 22, 9, 31, 7, 18, 2]$, $k = 6$ ve pivot $9$ seçildi. Select bir sonraki adımda ne yapar?',
              options: ['Select$(A_>, 2)$', 'Select$(A_>, 3)$', 'Select$(A_<, 6)$', '$9$’u döndürür'],
              answer: 0,
              hint: '$A_< = [4, 7, 2]$, $A_> = [15, 22, 31, 18]$.',
              explanation: '$|A_<| + 1 = 4 < 6$, aranan $A_>$’de. Atılan $3 + 1 = 4$ eleman aranandan küçük: $k\' = 6 - 4 = 2$. Gerçekten sıralı dizi $2, 4, 7, 9, 15, 18, \\dots$ ve 6. eleman $18$, $A_>$’nin 2. en küçüğü.',
              feedback: { 1: 'Pivotu da saymayı unutmayın: $6 - 3 - 1 = 2$.' },
            },
          ],
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
          tasks: [
            '“Sıralı (ilk-eleman kötü)” örneğini seç, pivot kuralını **İlk eleman** yap ve **Sona git** ile toplam Select çağrısı sayısına bak. Aynısını **Medyanların medyanı** ile tekrarla.',
            '**Tahmin modu**nu aç: her bölümlemeden sonra $|A_<|$, $|A_=|$ ve $k$’ye bakarak hangi dala gidileceğini tahmin et.',
            '**Tekrarlı** örnekte $|A_=| > 1$ olan bir adım bul ve cevabın neden doğrudan $p$ olabildiğini açıkla.',
            'Kendi dizinle $k = 1$ ve $k = n$’yi dene. Rastgele pivotta tohumu değiştirince çağrı sayısı nasıl değişiyor?',
          ],
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
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'Bir öğrenci pivotu “en küçük ile en büyüğün ortası” olarak seçiyor (dizide olmayabilir). $A = [1, 2, 10]$ ve $k = 3$ için algoritma ne döndürür?',
              options: ['$5.5$ — yanlış bir cevap', '$10$', 'Sonsuz döngüye girer', '$2$'],
              answer: 0,
              hint: '$p = 5.5$ için $A_< = [1, 2]$; $|A_<| = k - 1$ mi?',
              explanation: '$|A_<| = 2 = k - 1$ olduğundan algoritma $p = 5.5$’i döndürür — dizide bile olmayan bir değer. Kanıt $p \\in A$ koşulunu kullanıyordu ($n = |A_<| + 1 + |A_>|$); bu koşul bozulunca doğruluk da bozulur.',
            },
          ],
          label: 'formalProof',
          proof: [
            { title: 'Hipotez', body: '$n$ boyutlu her dizi ve $k \\in \\{1..n\\}$ için Select $k$. en küçüğü döndürür.' },
            { title: 'Taban (n = 1)', body: '$k = 1$ olmak zorunda; tek eleman döndürülür — doğru.' },
            { title: 'Adım', body: 'Hipotez $n < i$ için doğru olsun; $|A| = i$. Üç durum: (1) $|A_<| = k-1$: tam $k-1$ eleman $p$’den küçük, $p$ cevaptır. (2) $|A_<| > k-1$: $k$. en küçük $A_<$ içindedir; $|A_<| < i$ olduğundan hipotez uygulanır. (3) $|A_<| < k-1$: cevap $A_>$ içinde sırası $k - |A_<| - 1$ olan elemandır; $1 \\le k - |A_<| - 1 \\le |A_>|$ ve $|A_>| < i$.' },
            { title: 'Pivot kuralı', body: 'Hiçbir adım $p$’nin nasıl seçildiğini kullanmadı: ChoosePivot doğruluğu değil yalnızca çalışma süresini etkiler.' },
          ],
        },
        {
          kind: 'viz',
          title: 'Pivot kalitesi: ardışık çağrıların boyu',
          viz: 'pivotCompare',
          body: `Bölümleme her çağrıda dizinin boyu kadar iş yapar ve özyinelemenin hangi tarafa ineceğini $k$ belirler — biz seçemeyiz. Bu yüzden toplam iş, ardışık çağrıların **boylarının toplamı** ile orantılıdır.

- Pivot hep en küçük ya da en büyükse boy her adımda yalnızca 1 azalır: $n + (n-1) + \\dots + 1 = \\Theta(n^2)$.
- Pivot boyu her seferinde sabit bir **oranla** küçültürse (ör. en fazla $\\tfrac34$), toplam geometrik seridir: $n\\big(1 + \\tfrac34 + (\\tfrac34)^2 + \\dots\\big) = 4n$. Oran $\\tfrac{99}{100}$ bile olsa toplam $100n$ ile sınırlıdır; önemli olan sabit bir oran.
- Rastgele pivot yaklaşık yarı olasılıkla “ortadaki yarıdan” gelir ve boyu en fazla $\\tfrac34$’e indirir; bu yüzden beklenen toplam da doğrusal kalır (kesin hesap Ders 5’te).

Aşağıda her çubuk bir çağrıdır; uzunluğu o çağrıdaki dizi boyudur.`,
          tasks: [
            '**Kötü pivot** ile n = 48, k = 15: kaç çağrı yapıldı, boyların toplamı kaç? $n(n+1)/2$ ile karşılaştır.',
            '**Tam medyan**’a geç: toplam neden $2n$’nin altında kalıyor?',
            '**Rastgele**’de birkaç kez **Yeni tohum**’a bas. Toplam her seferinde değişir; kötü pivota hiç yaklaşıyor mu?',
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: '“Kötü pivot” kuralıyla $n = 48$ ve $k = 15$ için ardışık çağrıların boylarının toplamı kaçtır? (Aracı kullanmadan hesaplayıp sonra kontrol edin.)',
              answer: 1176,
              hint: 'Boy her adımda 1 azalır ve 1’e kadar iner.',
              explanation: '$48 + 47 + \\dots + 1 = \\frac{48 \\cdot 49}{2} = 1176$ — $\\Theta(n^2)$ davranışı.',
            },
            {
              id: 'c7',
              kind: 'mcq',
              prompt: 'Bir pivot kuralı pivotu $O(n)$ sürede buluyor ve iki parçanın büyüğünü her adımda en fazla $\\tfrac34 n$ tutuyor. Select’in en kötü durum süresi nedir?',
              options: ['$\\Theta(n)$', '$\\Theta(n\\log n)$', '$\\Theta(n^2)$', '$\\Theta(\\log n)$'],
              answer: 0,
              hint: '$T(n) \\le T(3n/4) + cn$; seviye işleri geometrik azalır.',
              explanation: '$cn(1 + \\tfrac34 + \\tfrac{9}{16} + \\dots) = 4cn$. Alt sınır $\\Omega(n)$ olduğundan $\\Theta(n)$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Medyanların medyanı adım adım',
          viz: 'momGrid',
          label: 'proofIdea',
          body: `Medyanların medyanı pivotu şöyle seçer: diziyi sırayla 5’erli gruplara ayır, her grubu sırala, grup medyanlarından oluşan küçük dizinin medyanını **Select’i özyinelemeli çağırarak** bul. Bu döngüsel görünür (Select pivot için kendini çağırıyor) ama iç çağrı yalnızca $\\lceil n/5\\rceil$ elemanlıdır.

Neden iyi bir pivot? Sütunları medyanlarına göre dizdiğimizi hayal edelim. Medyanı pivottan küçük olan her dolu sütunda medyan ve onun üstündeki iki eleman pivottan küçüktür: sütun başına en az 3 eleman. Bu sütunlar grupların yaklaşık yarısıdır; yani elemanların yaklaşık $\\tfrac12\\cdot\\tfrac35 = \\tfrac{3}{10}$’u **kesin** pivottan küçük, simetrik olarak $\\tfrac{3}{10}$’u kesin büyüktür. Her iki parça da en fazla yaklaşık $\\tfrac{7}{10}n$ olur (kesin hâli Lemma: $7n/10 + 5$).`,
          tasks: [
            'Adımları tek tek ilerlet; her adımda ekranda neyin değiştiğini kendi cümlenle söyle.',
            'Son adımda “kesin küçük” sayısını lemmanın verdiği alt sınırla karşılaştır. Fark nereden geliyor?',
            'Dizi boyunu 45 yap ve birkaç rastgele dizi dene: gerçek $|L|$ ya da $|R|$, $7n/10 + 5$ sınırını hiç aşıyor mu?',
          ],
          check: [
            {
              id: 'c8',
              kind: 'numeric',
              prompt: '55 elemanlı bir dizi 11 dolu 5’li gruba ayrıldı ve pivot medyanların medyanı. Pivottan **kesin** küçük en az kaç eleman vardır (pivotun kendi grubundakiler dahil)?',
              answer: 17,
              hint: 'Pivottan küçük medyan sayısı $\\lceil 11/2 \\rceil - 1$; her biri 3 eleman verir. Pivotun grubundan da 2 eleman.',
              explanation: '$\\lceil 11/2\\rceil - 1 = 5$ grup × 3 = 15, artı pivotun grubunda ondan küçük 2 eleman: 17.',
            },
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
          kind: 'viz',
          title: 'Neden 5’li gruplar?',
          viz: 'groupTree',
          body: `$q$ elemanlı gruplarla ($q$ tek) pivot, kabaca $\\tfrac{q+1}{4q}n$ elemandan kesin büyük ve o kadarından kesin küçüktür. İki özyinelemeli çağrının boyları $n/q$ (pivotu bulmak) ve yaklaşık $\\big(1 - \\tfrac{q+1}{4q}\\big)n$ (aramaya devam etmek) olur.

- $q = 3$: $\\tfrac13 + \\tfrac23 = 1$ → her tam seviye $\\approx n$ iş yapar; bu analiz yalnızca $O(n\\log n)$ üst sınırı verir.
- $q = 5$: $\\tfrac15 + \\tfrac{7}{10} = \\tfrac{9}{10}$ → $O(n)$; yerine koymada $C \\ge 10$.
- $q = 7$: $\\tfrac17 + \\tfrac57 = \\tfrac67$ → $O(n)$; $C \\ge 7$, ama 7 elemanlı grupları sıralamak daha pahalıdır.

Belirleyici olan çağrı sayısı değil, bir seviyedeki **toplam boy**dur. 5, bu basit analizle doğrusal garanti veren en küçük tek grup boyudur.`,
          tasks: ['Grup boyunu 3, 5, 7 ve 9 arasında değiştir; seviye toplamlarının nasıl azaldığına ya da sabit kaldığına bak.', 'Tablodaki 3’lü sütunun neden durmadan büyüdüğünü oranların toplamıyla açıkla.'],
          check: [
            {
              id: 'c9',
              kind: 'mcq',
              prompt: '9’lu gruplar için sade model $T(n) = T(n/9) + T(\\tfrac{13}{18}n) + n$ olsun. $T(n) \\le Cn$ kanıtının tümevarım adımı en küçük hangi $C$ ile tutar?',
              options: ['$6$', '$9$', '$10$', 'Hiçbir $C$ yetmez'],
              answer: 0,
              hint: '$\\tfrac{C}{9} + \\tfrac{13C}{18} + 1 \\le C$.',
              explanation: '$\\tfrac19 + \\tfrac{13}{18} = \\tfrac{15}{18} = \\tfrac56$, dolayısıyla $\\tfrac{C}{6} \\ge 1 \\iff C \\ge 6$.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: kütüphaneler ve uygulamalar',
          body: `Medyanların medyanı en kötü durumda $O(n)$’dir ama sabitleri büyüktür (grupları sıralamak, medyanları kopyalamak, iki özyineleme). Gerçek sistemler genellikle şunları kullanır:

- **Quickselect** (Hoare, 1961): rastgele pivotlu Select. Beklenen süre $O(n)$, sabiti küçük, bölmeyi dizinin içinde yapar.
- **Introselect** (Musser, 1997): Quickselect gibi başlar; parçalar yeterince hızlı küçülmezse medyanların medyanına geçer. Pratikte hızlı, en kötü durumda doğrusal.
- **Kütüphaneler:** C++ \`std::nth_element\`, NumPy \`np.partition\` ve \`np.median\` bu ailedendir.

Seçmenin kullanıldığı yerler:

- **Yüzdelikler:** p50, p95, p99 gecikme ölçümleri.
- **En iyi k:** en çok satan $k$ ürünü listelemek için $k$. en büyüğü seçip ondan büyükleri tek taramada ayırmak ve yalnızca onları sıralamak: $O(n + k\\log k)$.
- **Görüntü işleme:** medyan filtresi, gürültülü pikselleri komşularının medyanıyla değiştirir.
- **Veri yapıları:** k-d ağaçları noktaları her seviyede medyana göre ikiye böler.
- **QuickSort:** pivot olarak gerçek medyanı Select ile bulmak QuickSort’a en kötü durumda $O(n\\log n)$ garantisi verir (Ders 5).`,
          check: [
            {
              id: 'c10',
              kind: 'mcq',
              prompt: 'Bir izleme servisi milyonlarca ölçümün p95 değerini hesaplıyor. Sıradan girdilerde olabildiğince hızlı olmalı, ama kötü niyetli girdilerde bile doğrusal süre garantisi vermeli. Hangisi en uygundur?',
              options: ['Diziyi sıralayıp $\\lceil 0.95n \\rceil$. elemanı almak', 'Hep ilk elemanı pivot alan Select', 'Yalnızca medyanların medyanı', 'Introselect'],
              answer: 3,
              hint: 'İki isteği aynı anda karşılayan karma yöntem hangisi?',
              explanation: 'Introselect ortalamada Quickselect kadar hızlıdır ve işler kötüye giderse medyanların medyanına geçerek en kötü durumda da $O(n)$ kalır.',
            },
          ],
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
