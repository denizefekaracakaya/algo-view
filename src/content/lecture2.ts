import type { Lecture } from './types'
import { SRC } from './sources'
import { INSERTION_SORT_CODE } from '../engines/insertionSort'
import { MERGE_SORT_CODE } from '../engines/mergeSort'

export const lecture2: Lecture = {
  n: 2,
  title: 'Asimptotik analiz, en kötü durum ve MergeSort',
  titleEn: 'Asymptotics, Worst-Case Analysis, and MergeSort',
  date: '7 Ocak 2026',
  blurb: 'InsertionSort’un doğruluğu, MergeSort ile böl-ve-fethet, özyineleme ağacı ve Big-O / Ω / Θ.',
  lessons: [
    {
      id: 'l2-insertion',
      lecture: 2,
      title: 'InsertionSort ve döngü değişmezi',
      titleEn: 'InsertionSort and loop invariants',
      summary: 'Basit bir sıralama algoritmasının doğru olduğunu tümevarımla kanıtlamak.',
      minutes: 25,
      objectives: [
        'InsertionSort’un her adımda ne yaptığını izlemek ve tahmin etmek.',
        '“Her iterasyondan sonra A[:i+1] sıralıdır” döngü değişmezini (loop invariant) ifade etmek.',
        'Değişmezi tümevarımla kanıtlayıp doğruluk sonucuna bağlamak.',
        'En kötü durumda yaklaşık $n^2/2$ işlem yapıldığını görmek.',
      ],
      prerequisites: ['Diziler ve döngüler', 'Matematiksel tümevarım'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi',
          label: 'Sezgi',
          body: `Elinizdeki iskambil kartlarını sıralar gibi: soldaki kartlar zaten sıralı; sağdan yeni bir kart alıp (\`current\`) solundaki daha büyük kartları birer sağa kaydırarak doğru yere yerleştirirsiniz. Her turda sıralı bölge bir büyür.`,
        },
        {
          kind: 'viz',
          title: 'Sıralama görselleştiricisi (InsertionSort ↔ MergeSort)',
          viz: 'sortingLab',
          body: `Kendi dizinizi girin veya örnek seçin. **Tahmin modu**nu açarsanız, her turdan önce \`current\` değerinin nereye yerleşeceğini tahmin etmeniz istenir. Üstteki seçiciden aynı girdiyle MergeSort’a geçip karşılaştırma sayılarını kıyaslayabilirsiniz.`,
        },
        {
          kind: 'pseudocode',
          title: 'Sözde kod (Ders 2 notlarındaki Python sürümü)',
          code: INSERTION_SORT_CODE,
        },
        {
          kind: 'correctness',
          title: 'Doğruluk: döngü değişmezi',
          label: 'Biçimsel kanıt',
          body: `**Değişmez (inductive hypothesis):** $i$. iterasyondan sonra $A[:i+1]$ sıralıdır. Kanıtı adım adım açın; her adımı görmeden önce ne olması gerektiğini düşünün.`,
          proof: [
            { title: 'Taban durumu (i = 0)', body: 'Döngüye girmeden önce $A[:1]$ tek elemanlıdır; tek elemanlı her liste sıralıdır.' },
            {
              title: 'Tümevarım adımı: varsayım',
              body: '$A[:i]$’nin $(i-1)$. iterasyondan sonra sıralı olduğunu varsayalım. $i$. iterasyonda $A[i]$ alınır (`current`).',
            },
            {
              title: 'İç döngünün etkisi',
              body: '$j^*$, $\\{0,\\dots,i-1\\}$ içinde $A[j^*] \\le A[i]$ olan en büyük indeks olsun (yoksa $-1$). İç döngü $A[j^*+1..i-1]$’i bir sağa kaydırır ve `current`’ı $j^*+1$ konumuna yazar.',
            },
            {
              title: 'Yeni önek sıralı',
              body: '`current` solundaki her elemandan büyük ya da eşittir (çünkü $A[j^*] \\le$ `current` ve önek sıralı), sağındaki her elemandan küçüktür ($j^*$’nin seçimi gereği). Diğer elemanların sırası değişmedi. Dolayısıyla $A[:i+1]$ sıralıdır.',
            },
            { title: 'Sonuç', body: 'Değişmez $i = n-1$ için de geçerlidir: $A[:n]$ — yani tüm dizi — algoritma bittiğinde sıralıdır.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Çalışma süresi',
          body: `$i$. iterasyonda en fazla $i$ eleman kaydırılır: toplam $\\sum_{i=1}^{n-1} i = \\frac{n(n-1)}{2}$ karşılaştırma ve kaydırma — **en kötü durumda** (ters sıralı girdi) yaklaşık $n^2/2$. Ders bunun ötesine geçmek ister: $n^2$’den asimptotik olarak daha hızlı sıralayabilir miyiz? (Cevap: MergeSort, $n\\log n$.)

**Not:** Neredeyse sıralı girdide InsertionSort az iş yapar; ama en kötü durum analizi her girdi için geçerli bir garanti verir.`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Değişmezi “$A[:i+1]$ dizinin en küçük $i+1$ elemanını içerir” sanmak. Hayır: yalnızca **kendi içinde** sıralıdır; daha küçük elemanlar sağda bekliyor olabilir.
- Taban durumunu atlamak veya sonuç adımında “döngü bittiğinde $i = n-1$” bağlantısını kurmamak.
- Döngü koşulundaki karşılaştırmayı \`A[j] >= current\` yapmak: algoritma yine sıralar ama eşit anahtarların sırası bozulur (kararlılık kaybolur).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '$A = [5, 2, 4, 6, 1, 3]$ için $i = 2$ iterasyonu bittikten hemen sonra $A$ nedir?',
          options: ['$[2, 4, 5, 6, 1, 3]$', '$[2, 5, 4, 6, 1, 3]$', '$[1, 2, 4, 5, 6, 3]$', '$[2, 4, 5, 1, 3, 6]$'],
          answer: 0,
          hint: '$i = 1$’den sonra $[2,5,4,\\dots]$; $i = 2$’de 4 yerleştirilir.',
          explanation: '$i=1$: 2 yerleşir → $[2,5,4,6,1,3]$. $i=2$: 4, 5’in soluna geçer → $[2,4,5,6,1,3]$.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'InsertionSort’un doğruluk kanıtında kullanılan değişmez hangisidir?',
          options: [
            '$i$. iterasyondan sonra $A[:i+1]$ dizinin en küçük $i+1$ elemanıdır.',
            '$i$. iterasyondan sonra $A[:i+1]$ sıralıdır.',
            '$i$. iterasyondan sonra $A[i:]$ sıralıdır.',
            'Her iterasyonda en az bir takas yapılır.',
          ],
          answer: 1,
          hint: 'Henüz sağdaki elemanlara hiç bakılmadı.',
          explanation: 'Önek sıralıdır ama sağda daha küçük elemanlar olabilir; bu yüzden “en küçük elemanlar” iddiası yanlıştır.',
          feedback: { 0: 'Yanlış: örn. $[5, 1]$ için $i=0$’dan sonra $A[:1] = [5]$ ama en küçük eleman 1.' },
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'Ters sıralı 8 elemanlı bir dizide InsertionSort kaç karşılaştırma (`A[j] > current`) yapar?',
          answer: 28,
          hint: 'Her $i$ için `current` dizinin başına kadar gider: $i$ karşılaştırma.',
          explanation: '$\\sum_{i=1}^{7} i = 28 = \\frac{8\\cdot 7}{2}$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Döngü koşulunu \`while j >= 0 and A[j] >= current\` olarak değiştirirsek algoritma hâlâ sıralar mı? Eşit anahtarlarla \`[(3,a), (1,b), (3,c)]\` (anahtar, etiket) girdisinde ne değişir?`,
          hints: ['Doğruluk kanıtında $A[j^*] \\le$ `current` koşulunu nasıl değiştirirsiniz?', 'İkinci 3 (c) içeri alınırken önceki 3’ün (a) önüne geçer mi?'],
          solution: `Evet, hâlâ sıralar (kanıtta $j^*$’yi “$A[j^*] < $ current olan en büyük indeks” olarak tanımlamak yeterli). Ancak eşit anahtarlar artık birbirinin önüne geçer: çıktı $[(1,b), (3,c), (3,a)]$ olur. Orijinal \`>\` sürümü $[(1,b), (3,a), (3,c)]$ verir ve **kararlıdır** (stable). Kararlılık Ders 6’da RadixSort için kritik olacak.`,
        },
      ],
      sources: [SRC.l2.pre, SRC.l2.notes, SRC.l2.slides, SRC.l2.proof, SRC.l2.notebook, SRC.l2.conceptSort],
    },
    {
      id: 'l2-mergesort',
      lecture: 2,
      title: 'MergeSort ve özyineleme ağacı',
      titleEn: 'MergeSort and the recursion tree',
      summary: 'Böl, özyinele, birleştir — ve her seviyede eşit iş: $O(n\\log n)$.',
      minutes: 30,
      objectives: [
        'MergeSort’un bölme ve birleştirme aşamalarını adım adım izlemek.',
        'Merge’ün iki sıralı listeyi doğrusal zamanda birleştirdiğini görmek ve tükenen liste durumunu ele almak.',
        'Özyineleme değişmezi ile doğruluğu açıklamak.',
        'Özyineleme ağacıyla “her seviyede $O(n)$ iş, $\\log n + 1$ seviye” argümanını kurmak.',
      ],
      prerequisites: ['InsertionSort dersi', 'Özyineleme', '$\\log_2$'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi',
          label: 'Sezgi',
          body: `Diziyi ikiye bölün, iki yarıyı (sihirli bir şekilde, özyinelemeyle) sıralayın, sonra iki sıralı yarıyı fermuar gibi birleştirin. Birleştirme kolaydır: iki listenin önündeki elemanlardan küçük olanı alırsınız.

Kötümser bakış: her seviyede çağrı sayısı ikiye katlanıyor. İyimser bakış: her seviyede alt problem boyutu yarıya iniyor. Notların dediği gibi, “bugün iyimserler kazanıyor”.`,
        },
        {
          kind: 'viz',
          title: 'MergeSort görselleştiricisi',
          viz: 'mergeSort',
          body: `Her satır bir özyineleme seviyesidir; kutular alt dizileri orijinal konumlarında gösterir. Merge sırasında alt panelde L, R işaretçileri (i, j) ve oluşan S listesi görünür. Tahmin modunda her birleştirme adımından önce hangi elemanın S’e ekleneceğini tahmin edin.`,
        },
        {
          kind: 'pseudocode',
          title: 'Sözde kod',
          code: MERGE_SORT_CODE,
          body: `Notlardaki Merge sözde kodu bilerek eksiktir (L ya da R bittiğinde ne olacağını söylemez). Buradaki sürüm bu durumu ele alır ve eşitlikte L’yi seçer (\`<=\`); böylece MergeSort kararlı olur.`,
        },
        {
          kind: 'correctness',
          title: 'Doğruluk: özyineleme değişmezi',
          label: 'Kanıt fikri',
          proof: [
            { title: 'Hipotez', body: '“MergeSort, uzunluğu $< i$ olan her girdi için sıralı bir dizi döndürür.”' },
            { title: 'Taban durumu', body: 'Uzunluğu 0 ya da 1 olan dizi zaten sıralıdır ve aynen döndürülür.' },
            { title: 'Adım', body: 'Uzunluk $i \\ge 2$ ise iki yarının uzunluğu $< i$’dir; hipotezle $L$ ve $R$ sıralıdır.' },
            { title: 'Merge’ün doğruluğu', body: 'Merge iki sıralı listeyi alıp tüm elemanlarını içeren sıralı bir liste döndürür (bu da ayrı bir tümevarımla kanıtlanır; bkz. CLRS 2.3.1). Böylece MergeSort uzunluk $i$ için de doğrudur.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Çalışma süresi: özyineleme ağacı',
          label: 'Biçimsel kanıt',
          body: `$n$’nin 2’nin kuvveti olduğunu varsayalım (notlardaki gerekçe: diziyi en yakın 2’nin kuvvetine $\\infty$ ile tamamlamak boyutu en fazla iki katına çıkarır). Boyutu $m$ olan bir çağrı en fazla $11m$ işlem yapar (taban kontrolü, kopyalama, Merge).

- Seviye $t$’de $2^t$ alt problem var, her biri $n/2^t$ boyutunda.
- Seviye $t$’deki toplam iş: $2^t \\cdot 11\\,\\frac{n}{2^t} = 11n$ — **seviyeden bağımsız**.
- $\\log_2 n + 1$ seviye var.

$$\\text{Toplam} \\le 11n(\\log_2 n + 1) = 11n\\log_2 n + 11n = O(n\\log n).$$

Bu bir **en kötü durum** sınırıdır: girdinin ne olduğuna bakılmaksızın geçerlidir. Bağıntı olarak: $T(n) = 2T(n/2) + O(n)$ (Ders 3’te Master Teoremi ile de çözeceğiz).`,
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Merge’de bir liste bittiğinde dizinin sonuna erişmeye çalışmak (notlardaki sözde kodun bilerek bıraktığı boşluk).
- Seviye sayısını $\\log n$ sanmak: $\\log_2 n + 1$ seviye vardır (0’dan $\\log_2 n$’ye).
- “MergeSort sıralı girdiyi daha hızlı sıralar.” — Hayır; girdiye bakmaksızın tüm seviyeleri çalıştırır. Bu, en kötü durum garantisinin bir “özelliği”dir.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: '$L = [1, 4, 7]$ ve $R = [2, 3, 9]$ birleştirilirken (eşitlikte L tercih edilir) S’e eklenen 4. değer nedir?',
          options: ['3', '4', '7', '9'],
          answer: 1,
          hint: 'S sırasıyla 1, 2, 3, … diye büyür.',
          explanation: 'S = 1, 2, 3, 4, 7, 9. Dördüncü eklenen 4.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: '$n = 16$ için MergeSort özyineleme ağacında kaç seviye vardır ve seviye 2’de kaç alt problem bulunur?',
          options: ['4 seviye, 4 alt problem', '5 seviye, 4 alt problem', '5 seviye, 8 alt problem', '16 seviye, 2 alt problem'],
          answer: 1,
          hint: 'Seviyeler $0, 1, \\dots, \\log_2 16$.',
          explanation: '$\\log_2 16 + 1 = 5$ seviye; seviye $t$’de $2^t$ alt problem → seviye 2’de 4 alt problem, her biri 4 elemanlı.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'MergeSort analizinde seviye $t$’deki toplam iş neden $t$’ye bağlı değildir?',
          options: [
            'Çünkü Merge sabit zaman alır.',
            'Alt problem sayısı $2^t$ kat artarken her birinin boyutu $2^t$ kat azalır ve Merge işi boyutla doğrusal.',
            'Çünkü yalnızca bir seviye vardır.',
            'Çünkü sıralı girdide iş yapılmaz.',
          ],
          answer: 1,
          hint: '$2^t \\cdot c\\,\\frac{n}{2^t}$ ifadesini sadeleştirin.',
          explanation: '$2^t \\cdot 11\\frac{n}{2^t} = 11n$: iki etki birbirini tam olarak dengeler (Ders 3’te bu “$a = b^d$” durumu olacak).',
        },
        {
          id: 'q4',
          kind: 'order',
          prompt: 'MergeSort([3, 1, 2]) çalışırken gerçekleşen olayları sıraya koyun.',
          items: ['[3] taban durumu olarak döner', '[1, 2] ikiye bölünür', '[1] ve [2] birleştirilerek [1, 2] olur', '[3] ve [1, 2] birleştirilerek [1, 2, 3] olur'],
          hint: '$n//2 = 1$: sol yarı [3], sağ yarı [1, 2].',
          explanation: 'Önce sol yarı ([3]) tamamen işlenir, sonra sağ yarı ([1,2]) bölünüp birleştirilir, en son kök birleştirmesi yapılır.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Bir arkadaşınız MergeSort’u diziyi **üç** eşit parçaya bölecek şekilde değiştiriyor (üç özyinelemeli çağrı + üç listeyi birleştiren doğrusal bir Merge3). Özyineleme ağacı argümanıyla çalışma süresini bulun. Bu, asimptotik olarak bir iyileşme midir?`,
          hints: ['Seviye $t$’de kaç alt problem, her biri hangi boyutta?', 'Kaç seviye var? $\\log_3 n$ ile $\\log_2 n$ arasındaki ilişki nedir?'],
          solution: `Seviye $t$’de $3^t$ alt problem, boyut $n/3^t$; Merge3 doğrusal olduğundan seviye işi $c\\cdot 3^t \\cdot n/3^t = cn$. $\\log_3 n + 1$ seviye var → $O(n\\log_3 n) = O(n \\log n)$, çünkü $\\log_3 n = \\log_2 n / \\log_2 3$ yalnızca sabit bir çarpan farkıdır. Asimptotik bir iyileşme **değildir**.`,
        },
      ],
      sources: [SRC.l2.notes, SRC.l2.slides, SRC.l2.notebook, SRC.l2.conceptSort, SRC.hw.hw2],
    },
    {
      id: 'l2-asymptotics',
      lecture: 2,
      title: 'En kötü durum ve asimptotik gösterim',
      titleEn: 'Worst-case analysis and asymptotic notation',
      summary: 'Big-O, Big-Ω ve Big-Θ: sabitleri ve düşük mertebeli terimleri neden ve nasıl yok sayarız?',
      minutes: 30,
      objectives: [
        'En kötü durum analizini “rakip (adversary) oyunu” olarak açıklamak.',
        'Big-O, Big-Ω, Big-Θ tanımlarını $c$ ve $n_0$ tanıkları (witness) ile yazmak ve uygulamak.',
        'Kuramsal büyüme fonksiyonları ile ampirik ölçümleri ayırt etmek.',
      ],
      prerequisites: ['Fonksiyonlar ve eşitsizlikler', 'MergeSort dersi'],
      sections: [
        {
          kind: 'intuition',
          title: 'En kötü durum analizi',
          label: 'Sezgi',
          body: `Bir rakiple oyun oynadığımızı düşünün: biz bir algoritma ve bir süre sınırı $T(n)$ söyleriz; rakip, algoritmamızı en çok yavaşlatacak $n$ boyutlu girdiyi seçer. Rakip ne seçerse seçsin süre $T(n)$’yi aşmıyorsa kazanırız. Bu, **her girdi için** geçerli, çok güçlü bir garantidir.

Ortalama durum analizi (girdiler üzerinde bir dağılım varsayar) daha zordur ve girdiye dair güçlü varsayımlar ister; bu ders ağırlıklı olarak en kötü durumla çalışır.`,
        },
        {
          kind: 'formal',
          title: 'Asimptotik gösterim (Ders 2 notları)',
          box: 'formal',
          label: 'Biçimsel',
          body: `$T(n)$ ve $f(n)$ negatif olmayan fonksiyonlar olsun.

$$T(n) = O(f(n)) \\iff \\exists\\, c > 0,\\ n_0 \\ \\text{öyle ki}\\ \\forall n \\ge n_0:\\ 0 \\le T(n) \\le c\\,f(n)$$
$$T(n) = \\Omega(f(n)) \\iff \\exists\\, c > 0,\\ n_0 \\ \\text{öyle ki}\\ \\forall n \\ge n_0:\\ 0 \\le c\\,f(n) \\le T(n)$$
$$T(n) = \\Theta(f(n)) \\iff T(n) = O(f(n)) \\text{ ve } T(n) = \\Omega(f(n))$$

Sezgisel olarak: O bir **üst sınır**, Ω bir **alt sınır**, Θ ise **sıkı** sınırdır.`,
        },
        {
          kind: 'viz',
          title: 'Büyüme hızı gezgini',
          viz: 'growth',
          body: `Fonksiyonları seçip $n$ arttıkça nasıl ayrıştıklarını görün. Logaritmik eksen, çok farklı büyüklükleri tek grafikte gösterir.`,
        },
        {
          kind: 'viz',
          title: 'Tanık (c, n₀) denetleyicisi',
          viz: 'bigO',
          body: `Bir $T(n)$, bir iddia ve $c$, $n_0$ seçin. Araç $n \\le 2000$ için koşulun sağlanıp sağlanmadığını kontrol eder ve ilk karşı örneği gösterir. Örneğin $3n^2 + 5n + 10 = O(n^2)$ için $c = 4$ hangi $n_0$ ile çalışır? $c = 30, n_0 = 1$ (notlardaki $c = (k+1)\\max_i|a_i|$ yöntemi: $k = 2$, $\\max_i|a_i| = 10$) ne olur? $11n\\log_2 n + 11n = O(n)$ iddiasını hangi $c$ kurtarabilir?`,
        },
        {
          kind: 'correctness',
          title: 'İki örnek kanıt (notlardaki iddialar)',
          label: 'Biçimsel kanıt',
          proof: [
            {
              title: 'İddia: derecesi $k$ olan polinomlar $O(n^k)$’dir',
              body: '$T(n) = a_k n^k + \\dots + a_0$ ve $a = \\max_i |a_i|$ olsun. $n \\ge 1$ için her $a_i n^i \\le a\\,n^k$. Toplam $k+1$ terim olduğundan $T(n) \\le (k+1)a\\,n^k$. Tanık: $c = (k+1)a$, $n_0 = 1$.',
            },
            {
              title: 'İddia: $n^k$, $O(n^{k-1})$ değildir',
              body: 'Çelişki: $n^k \\le c\\,n^{k-1}$ tüm $n \\ge n_0$ için sağlansın. Sadeleştirince $n \\le c$ — ama $n = \\max(n_0, \\lceil c \\rceil + 1)$ için bu yanlış. $c$ sabit olduğundan çelişki.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Ampirik ölçüm: karşılaştırma sayıları',
          viz: 'empiricalSorting',
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- $O$’yu “tam olarak” anlamında kullanmak: $n = O(n^2)$ doğrudur ama sıkı değildir; sıkılık için $\\Theta$ kullanılır.
- Tanıkta $c$’nin $n$’ye bağlı seçilmesi ($c = n$ gibi): $c$ sabit olmak zorundadır.
- Birkaç ölçümle “bu algoritma $O(n\\log n)$” sonucuna varmak: ölçüm bir kanıt değildir.
- En kötü durumu “ortalama girdi” ile karıştırmak.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Hangisi **yanlıştır**?',
          options: ['$n\\log n = O(n^2)$', '$n^2 = \\Omega(n \\log n)$', '$2^{n+1} = O(2^n)$', '$n^2 = O(n\\log n)$'],
          answer: 3,
          hint: 'Her birinde $c$ ve $n_0$ bulmayı deneyin.',
          explanation: '$n^2 \\le c\\,n\\log n \\iff n \\le c\\log n$, büyük $n$ için yanlış. Diğerleri doğrudur ($2^{n+1} = 2\\cdot 2^n$, tanık $c = 2$).',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: '$T(n) = 3n^2 + 5n + 10$ için $T(n) \\le 4n^2$ hangi $n_0$’dan itibaren her $n$ için sağlanır?',
          options: ['$n_0 = 1$', '$n_0 = 4$', '$n_0 = 7$', 'Hiçbir $n_0$ için'],
          answer: 2,
          hint: '$4n^2 - T(n) = n^2 - 5n - 10 \\ge 0$ ne zaman?',
          explanation: '$n^2 - 5n - 10 \\ge 0$: $n = 6$’da $-4$, $n = 7$’de $4$. Dolayısıyla $n_0 = 7$ (tanık $c = 4$).',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'En kötü durum analizi bize ne garanti eder?',
          options: [
            'Rastgele bir girdide beklenen süreyi.',
            'Algoritmanın her $n$ boyutlu girdide en fazla $T(n)$ sürede çalıştığını.',
            'En hızlı girdide süreyi.',
            'Belirli bir bilgisayarda saniye cinsinden süreyi.',
          ],
          answer: 1,
          hint: 'Rakip, girdiyi biz algoritmayı söyledikten sonra seçiyor.',
          explanation: 'Sınır, rakibin seçebileceği her girdi için geçerlidir; bu yüzden en kötü durum garantisi girdiye dair hiçbir varsayım gerektirmez.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Grafikte InsertionSort’un ölçülen noktaları $n^2/4$ eğrisine yakın çıktı. Bundan ne sonuç çıkarabiliriz?',
          options: [
            'InsertionSort’un en kötü durumu $\\Theta(n^2/4)$’tür, kanıtlandı.',
            'Ölçümler, bu rastgele girdilerde davranışın $n^2$ ölçeğinde olduğuyla tutarlıdır; kanıt yerine geçmez.',
            'InsertionSort her girdide tam $n^2/4$ karşılaştırma yapar.',
            'MergeSort’tan her zaman daha yavaştır.',
          ],
          answer: 1,
          hint: 'Ampirik gözlem ile matematiksel garanti arasındaki farkı düşünün.',
          explanation: 'Sonlu sayıda ölçüm, iddiayla tutarlılığı gösterir ama hiçbir asimptotik iddiayı kanıtlamaz. (Ayrıca sıralı girdide InsertionSort yalnızca $n-1$ karşılaştırma yapar.)',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: $T(n) = 11n\\log_2 n + 11n$ için $T(n) = \\Theta(n\\log n)$ olduğunu tanıklarla gösterin ($n \\ge 2$).`,
          hints: ['Üst sınır: $n \\ge 2$ için $n \\le n\\log_2 n$.', 'Alt sınır için $c = 11$ deneyin.'],
          solution: `**O:** $n \\ge 2$ için $\\log_2 n \\ge 1$, yani $11n \\le 11n\\log_2 n$; dolayısıyla $T(n) \\le 22\\,n\\log_2 n$. Tanık $c = 22$, $n_0 = 2$.

**Ω:** $T(n) \\ge 11\\,n\\log_2 n$ her $n \\ge 1$ için. Tanık $c = 11$, $n_0 = 1$.

İkisi birlikte $T(n) = \\Theta(n\\log n)$ verir.`,
        },
      ],
      sources: [SRC.l2.notes, SRC.l2.slides, SRC.l2.conceptAsym, SRC.sec.s1, SRC.hw.hw2],
    },
  ],
}
