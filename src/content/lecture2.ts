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
      minutes: 40,
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
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Elinizde sıralı 2, 5, 9 kartları var ve yeni gelen kart 6. Kartı yerine koymak için kaç kart bir sağa kaydırılır?',
              answer: 1,
              hint: '6’dan büyük olan kartlar kayar.',
              explanation: 'Yalnızca 9 kayar; 6, 5 ile 9 arasına girer: 2, 5, 6, 9.',
            },
          ],
          label: 'intuition',
          body: `Elinizdeki iskambil kartlarını sıralar gibi: soldaki kartlar zaten sıralı; sağdan yeni bir kart alıp (\`current\`) solundaki daha büyük kartları birer sağa kaydırarak doğru yere yerleştirirsiniz. Her turda sıralı bölge bir büyür.`,
        },
        {
          kind: 'viz',
          title: 'Sıralama görselleştiricisi (InsertionSort ↔ MergeSort)',
          tasks: [
            '“Ders örneği”nde **Tahmin modu**nu aç ve her turda `current`’ın yerleşeceği indeksi tahmin et.',
            '“Ters sıralı (en kötü)” ile “Neredeyse sıralı”nın karşılaştırma sayılarını kıyasla. Fark neden bu kadar büyük?',
            '“Tekrarlı” örnekte eşit değerlerin göreli sırasının korunduğunu izle (kararlılık).',
          ],
          viz: 'sortingLab',
          body: `Kendi dizinizi girin veya örnek seçin. **Tahmin modu**nu açarsanız, her turdan önce \`current\` değerinin nereye yerleşeceğini tahmin etmeniz istenir. Üstteki seçiciden aynı girdiyle MergeSort’a geçip karşılaştırma sayılarını kıyaslayabilirsiniz.`,
        },
        {
          kind: 'pseudocode',
          title: 'Sözde kod (Ders 2 notlarındaki Python sürümü)',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Python’da döngü koşulundaki `j >= 0` unutulursa (`while A[j] > current`) ne olur?',
              options: [
                'Hiçbir şey değişmez.',
                '`j = -1` olduğunda `A[-1]`, yani dizinin **son** elemanı okunur; karşılaştırmalar yanlış elemanla yapılır ve sonuç bozulabilir.',
                'Program her zaman hata verip durur.',
                'Algoritma ters sıralar.',
              ],
              answer: 1,
              hint: 'Python’da negatif indeks diziyi sondan sayar.',
              explanation: 'Python `A[-1]`’i hata vermeden son eleman olarak okur. Örneğin `[2, 1]`’de `current = 1` başa ulaşınca `A[-1]` ile karşılaştırılır; bu tür hatalar sessizce yanlış çıktı üretir. Sınır koşulları kanıtta da açıkça yer almalıdır.',
            },
          ],
          code: INSERTION_SORT_CODE,
        },
        {
          kind: 'correctness',
          title: 'Doğruluk: döngü değişmezi',
          check: [
            {
              id: 'c3',
              kind: 'order',
              prompt: 'Bir döngü değişmezi kanıtının parçalarını sıraya koyun.',
              items: [
                'Değişmezi açıkça yaz: “$i$. iterasyondan sonra $A[:i+1]$ sıralıdır.”',
                'Başlangıç: döngüden önce (i = 0) değişmez doğru.',
                'Koruma: bir iterasyon değişmezi bozmaz (tümevarım adımı).',
                'Sonlanma: döngü bittiğinde değişmez, istenen sonucu verir.',
              ],
              hint: 'Tümevarımın taban–adım–sonuç yapısını düşünün.',
              explanation: 'Değişmez → başlangıç (taban) → koruma (adım) → sonlanma (değişmezi hedefe bağlama).',
            },
          ],
          label: 'formalProof',
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
          kind: 'viz',
          title: 'Ters çiftler: kaydırma sayısının sırrı',
          viz: 'inversions',
          body: `$i < j$ iken $A[i] > A[j]$ olan $(i, j)$ çiftine **ters çift** (inversion) denir. Ters çift sayısı $I$, dizinin sıralı olmaktan ne kadar uzak olduğunu ölçer: sıralı dizide $0$, farklı elemanlı ters sıralı dizide $\\frac{n(n-1)}{2}$.

InsertionSort’un her kaydırması, \`current\` ile ondan büyük **komşu** bir elemanın yerini değiştirir: tam olarak **bir** ters çifti yok eder, başka hiçbir çiftin sırasını değiştirmez. Öyleyse

$$\\text{kaydırma sayısı} = I, \\qquad \\text{çalışma süresi} = \\Theta(n + I).$$

Rastgele bir dizide her çift $\\tfrac12$ olasılıkla terstir, yani beklenen $I = \\frac{n(n-1)}{4}$: ortalama durum da $\\Theta(n^2)$. Her elemanın doğru yerinden en fazla $k$ uzakta olduğu “neredeyse sıralı” dizide ise $I = O(nk)$ ve süre $O(nk)$’ya iner.`,
          tasks: [
            'Varsayılan dizide **Bir kaydırma yap**’a art arda bas: “kalan + yapılan” toplamı hiç değişiyor mu?',
            '5, 4, 3, 2, 1 dizisinde toplam kaç kaydırma oldu? $\\frac{n(n-1)}{2}$ ile karşılaştır.',
            '1, 2, 4, 3, 5 dizisinde kaç ters çift var? InsertionSort bu dizide neden bu kadar hızlı?',
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'InsertionSort $[4, 1, 3, 2]$’yi sıralarken toplam kaç kaydırma yapar? (Ters çiftleri sayarak bulun.)',
              answer: 4,
              hint: '4 kendinden sonraki kaç elemandan büyük? 3?',
              explanation: 'Ters çiftler: (4,1), (4,3), (4,2), (3,2) → $I = 4$, dolayısıyla 4 kaydırma.',
            },
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'Her elemanın doğru konumundan en fazla $k$ uzakta olduğu bir dizide InsertionSort’un süresi nedir?',
              options: ['$O(n\\log n)$', '$O(nk)$', '$O(n^2)$ her zaman', '$O(k^2)$'],
              answer: 1,
              hint: 'Bir eleman en fazla kaç elemanla ters çift oluşturabilir?',
              explanation: 'Her eleman yalnızca kendi etrafındaki $O(k)$ elemanla ters çift olabilir: $I = O(nk)$, süre $\\Theta(n + I) = O(nk)$.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: InsertionSort nerede yaşıyor?',
          body: `$\\Theta(n^2)$ en kötü durumuna rağmen InsertionSort gerçek sistemlerde sıkça kullanılır:

- **Küçük diziler:** döngüsü çok sade, sabit çarpanları küçüktür. Birkaç düzine elemana kadar çoğu zaman “daha iyi” algoritmalardan hızlıdır.
- **Karma algoritmalar:** Python’un \`sorted\` fonksiyonu ve Java’nın nesne dizileri için kullandığı **Timsort**, kısa parçaları ikili aramalı bir InsertionSort ile sıralayıp sonra MergeSort gibi birleştirir. Yaygın C++ \`std::sort\` uygulamaları da küçük parçalarda InsertionSort’a geçer.
- **Neredeyse sıralı veri:** süre $\\Theta(n + I)$ olduğu için birkaç kaydı değişmiş bir sıralama tablosunu çok hızlı düzeltir.
- **Çevrimiçi (online) sıralama:** elemanlar birer birer gelirken her yeni eleman sıralı kısma eklenebilir.`,
          check: [
            {
              id: 'c6',
              kind: 'mcq',
              prompt: 'Timsort (Python `sorted`) InsertionSort’u ne için kullanır?',
              options: ['Tüm diziyi sıralamak için', 'Kısa parçaları (run) sıralamak için; sonra parçalar birleştirilir', 'Yalnızca ters sıralı girdiler için', 'Hiç kullanmaz'],
              answer: 1,
              hint: 'Küçük $n$’de sabit çarpanlar önemlidir.',
              explanation: 'Timsort kısa parçaları InsertionSort (ikili aramalı sürümü) ile sıralar ve parçaları MergeSort gibi birleştirir: iki algoritmanın güçlü yanlarını birleştirir.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'En iyi, en kötü ve ortalama durum',
          box: 'formal',
          label: 'formal',
          body: `InsertionSort’un işi ters çift sayısı $I$ ile belirlenir: tam $I$ kaydırma ve en fazla $I + (n - 1)$ karşılaştırma.

- **En iyi durum (sıralı dizi):** $I = 0$ ve her $i$ için tek karşılaştırma: $n - 1$ karşılaştırma, $\\Theta(n)$.
- **En kötü durum (ters sıralı dizi):** her çift ters, $I = \\frac{n(n-1)}{2}$: $\\Theta(n^2)$.
- **Ortalama durum (rastgele permütasyon):** iki elemanın göreli sırası eşit olasılıklıdır, yani her çift olasılık $\\tfrac12$ ile terstir. Beklentinin doğrusallığıyla $E[I] = \\binom{n}{2} \\cdot \\frac12 = \\frac{n(n-1)}{4}$: yine $\\Theta(n^2)$, en kötü durumun tam yarısı.

“Ortalamada hızlıdır” umudu InsertionSort’u kurtarmaz; ama girdi **neredeyse sıralıysa** ($I$ küçükse) gerçekten hızlıdır. Bu dersin en kötü duruma odaklanması da bu yüzden makuldür: ortalama çoğu zaman aynı mertebededir.`,
          check: [
            {
              id: 'c7',
              kind: 'numeric',
              prompt: 'Rastgele sıralanmış 8 farklı elemanlı bir dizide InsertionSort ortalama kaç kaydırma yapar?',
              answer: 14,
              hint: '$E[I] = \\frac{n(n-1)}{4}$.',
              explanation: '$\\frac{8 \\cdot 7}{4} = 14$: 28 çiftin ortalama yarısı terstir.',
            },
          ],
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
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Zaten sıralı $n$ elemanlı bir dizide InsertionSort kaç karşılaştırma (`A[j] > current`) yapar?',
          options: ['$0$', '$n - 1$', '$n\\log_2 n$', '$\\frac{n(n-1)}{2}$'],
          answer: 1,
          hint: 'Her $i$ için iç döngünün koşulu kaç kez test edilir?',
          explanation: 'Her $i$ için `A[i-1] > current` bir kez test edilir ve yanlış çıkar: toplam $n - 1$, yani $\\Theta(n)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: Döngü koşulunu \`while j >= 0 and A[j] >= current\` olarak değiştirirsek algoritma hâlâ sıralar mı? Eşit anahtarlarla \`[(3,a), (1,b), (3,c)]\` (anahtar, etiket) girdisinde ne değişir?`,
          hints: ['Doğruluk kanıtında $A[j^*] \\le$ `current` koşulunu nasıl değiştirirsiniz?', 'İkinci 3 (c) içeri alınırken önceki 3’ün (a) önüne geçer mi?'],
          solution: `Evet, hâlâ sıralar (kanıtta $j^*$’yi “$A[j^*] < $ current olan en büyük indeks” olarak tanımlamak yeterli). Ancak eşit anahtarlar artık birbirinin önüne geçer: çıktı $[(1,b), (3,c), (3,a)]$ olur. Orijinal \`>\` sürümü $[(1,b), (3,a), (3,c)]$ verir ve **kararlıdır** (stable). Kararlılık Ders 6’da RadixSort için kritik olacak.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: “İkili InsertionSort”, yeni elemanın yerini sıralı önekte **ikili arama** ile bulur. Ters sıralı 8 elemanlı dizide en fazla kaç karşılaştırma ve kaç kaydırma yapar? Çalışma süresi değişir mi?`,
          hints: ['$i$ elemanlı sıralı önekte ikili arama en fazla $\\lceil \\log_2(i + 1) \\rceil$ karşılaştırma yapar.', 'Kaydırma sayısı yine ters çift sayısıdır.'],
          solution: `Karşılaştırmalar: $i = 1, \\dots, 7$ için en fazla $1 + 2 + 2 + 3 + 3 + 3 + 3 = 17$ (normal InsertionSort’ta 28). Ama kaydırmalar değişmez: her ters çift için bir kaydırma, $\\binom{8}{2} = 28$. Genel olarak karşılaştırmalar $O(n \\log n)$’e iner, kaydırmalar $\\Theta(n^2)$ kalır: toplam süre yine $\\Theta(n^2)$. Karşılaştırmanın pahalı olduğu durumlarda (örneğin uzun metinler) yine de işe yarar; Timsort küçük parçalarda tam bunu kullanır.`,
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
      minutes: 45,
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
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: '16 elemanlı bir dizide MergeSort kaç **taban durumu** (uzunluğu 1 olan) çağrısı yapar?',
              answer: 16,
              hint: 'Özyineleme ağacının yaprakları.',
              explanation: 'Her eleman sonunda tek başına bir yaprak olur: 16 taban durumu ($2^4$).',
            },
          ],
          label: 'intuition',
          body: `Diziyi ikiye bölün, iki yarıyı (sihirli bir şekilde, özyinelemeyle) sıralayın, sonra iki sıralı yarıyı fermuar gibi birleştirin. Birleştirme kolaydır: iki listenin önündeki elemanlardan küçük olanı alırsınız.

Kötümser bakış: her seviyede çağrı sayısı ikiye katlanıyor. İyimser bakış: her seviyede alt problem boyutu yarıya iniyor. Notların dediği gibi, “bugün iyimserler kazanıyor”.`,
        },
        {
          kind: 'viz',
          title: 'MergeSort görselleştiricisi',
          tasks: [
            '**Tahmin modu**nda her birleştirme adımından önce S’e eklenecek değeri tahmin et.',
            '“Ters sıralı” ile “Ders örneği”nin karşılaştırma sayılarını kıyasla. InsertionSort’taki gibi büyük bir fark var mı? Neden?',
            '“Tekrarlı” örnekte eşit iki değerin birleştirmede hangi sırayla S’e girdiğine bak: eşitlikte L’nin seçilmesi neyi garanti ediyor?',
          ],
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
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: '$L = [2, 7]$ ve $R = [3, 5]$ birleştirilirken kaç anahtar karşılaştırması yapılır?',
              answer: 3,
              hint: 'Bir liste bittiğinde kalanlar karşılaştırmasız eklenir.',
              explanation: '2<3 (2 eklenir), 7>3 (3), 7>5 (5); R bitti, 7 karşılaştırmasız eklenir: 3 karşılaştırma. İki listenin toplam boyu $m$ ise en fazla $m - 1$ karşılaştırma.',
            },
          ],
          label: 'proofIdea',
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
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: '$n = 32$ için MergeSort özyineleme ağacında kaç seviye vardır?',
              answer: 6,
              hint: '$\\log_2 32 + 1$.',
              explanation: 'Seviyeler $0, 1, \\dots, 5$: toplam 6.',
            },
          ],
          label: 'formalProof',
          body: `$n$’nin 2’nin kuvveti olduğunu varsayalım (notlardaki gerekçe: diziyi en yakın 2’nin kuvvetine $\\infty$ ile tamamlamak boyutu en fazla iki katına çıkarır). Boyutu $m$ olan bir çağrı en fazla $11m$ işlem yapar (taban kontrolü, kopyalama, Merge).

- Seviye $t$’de $2^t$ alt problem var, her biri $n/2^t$ boyutunda.
- Seviye $t$’deki toplam iş: $2^t \\cdot 11\\,\\frac{n}{2^t} = 11n$ — **seviyeden bağımsız**.
- $\\log_2 n + 1$ seviye var.

$$\\text{Toplam} \\le 11n(\\log_2 n + 1) = 11n\\log_2 n + 11n = O(n\\log n).$$

Bu bir **en kötü durum** sınırıdır: girdinin ne olduğuna bakılmaksızın geçerlidir. Bağıntı olarak: $T(n) = 2T(n/2) + O(n)$ (Ders 3’te Master Teoremi ile de çözeceğiz).`,
        },
        {
          kind: 'text',
          title: 'Pratikte: birleştirme fikri her yerde',
          body: `- **Dış bellek (external) sıralama:** belleğe sığmayan bir dosya (ör. 1 TB kayıt) parçalar hâlinde okunur, her parça bellekte sıralanıp diske yazılır, sonra parçalar **k-yollu birleştirme** ile tek bir sıralı dosyada birleştirilir. Veritabanları büyük \`ORDER BY\` sorgularında bunu yapar.
- **Bağlı listeler:** rastgele erişim gerekmediği için MergeSort bağlı listeleri sıralamanın doğal yoludur.
- **Kararlılık:** MergeSort kararlıdır; bu yüzden nesne sıralamada (ör. önce isme, sonra bölüme göre) tercih edilir. Timsort da birleştirmeye dayanır.
- **Paralel sıralama:** iki yarı birbirinden bağımsız sıralanabilir; MapReduce gibi sistemlerdeki dağıtık sıralama aynı fikre dayanır.
- **Ters çift sayma:** birleştirme sırasında R’den alınan her eleman, L’de kalanların hepsiyle ters çift oluşturur; böylece ters çift sayısı $O(n\\log n)$’de sayılabilir.`,
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Belleğe sığmayan çok büyük bir dosyayı sıralamanın standart yolu hangisidir?',
              options: [
                'Dosyayı satır satır InsertionSort ile sıralamak',
                'Belleğe sığan parçaları ayrı ayrı sıralayıp diske yazmak, sonra parçaları birleştirmek',
                'Önce dosyayı sıkıştırmak',
                'Rastgele pivotlu QuickSort’u doğrudan diskte çalıştırmak',
              ],
              answer: 1,
              hint: 'MergeSort’un “birleştir” adımı yalnızca listelerin önüne bakar.',
              explanation: 'Dış bellek MergeSort’u: Merge yalnızca parçaların baştaki elemanlarına sıralı erişim ister; bu, disk için idealdir.',
            },
            {
              id: 'c5',
              kind: 'numeric',
              prompt: '8 sıralı parça, her turda parçaları ikişer ikişer birleştirerek tek parçaya indiriliyor. Kaç tur gerekir?',
              answer: 3,
              hint: 'Her turda parça sayısı yarıya iner.',
              explanation: '8 → 4 → 2 → 1: $\\log_2 8 = 3$ tur.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Kararlılık ve ek bellek',
          body: `İki özellik MergeSort’u pratikte tanımlar:

- **Kararlılık:** Merge eşitlikte sol listeden alır (\`L[i] <= R[j]\`). Eşit anahtarlı iki kayıttan girdide önce geleni hep soldadır, bu yüzden çıktıda da önce gelir. Kayıtları önce isme, sonra bölüme göre sıralamak gibi çok anahtarlı işler buna dayanır.
- **Ek bellek:** Merge sonucu yeni bir listeye yazar: $\\Theta(n)$ ek alan. InsertionSort ve QuickSort ise dizinin içinde çalışır. Yerinde birleştirme yöntemleri vardır ama karmaşıktır ve sabitleri büyüktür; kütüphaneler genellikle ek belleği kabul eder.`,
          check: [
            {
              id: 'c6',
              kind: 'mcq',
              prompt: 'Merge eşitlikte sağ listeden alsaydı (yalnızca `L[i] < R[j]` ise L’den) ne değişirdi?',
              options: ['Dizi artık sıralanmazdı', 'Hâlâ sıralar ama kararlı olmaz', 'Çalışma süresi $\\Theta(n^2)$ olurdu', 'Hiçbir şey değişmezdi'],
              answer: 1,
              hint: 'Eşit anahtarların göreli sırasına bakın.',
              explanation: 'Çıktı yine sıralıdır ve süre aynıdır; ama eşit anahtarlarda sağdaki (girdide sonra gelen) önce yazılır, yani göreli sıra bozulabilir.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: $n = 8$ için MergeSort en kötü durumda tam olarak kaç anahtar karşılaştırması yapar? Hangi girdi bu sayıya ulaşır?`,
          hints: ['Toplam uzunluğu $m$ olan iki listeyi birleştirmek en fazla $m - 1$ karşılaştırma ister.', 'Seviyeleri ayrı ayrı toplayın: 2’şer elemanlı dört, 4’er elemanlı iki ve 8 elemanlı bir birleştirme.'],
          solution: `Seviyeler: 2’şer elemanlı dört birleştirme ($4 \\cdot 1$), 4’er elemanlı iki birleştirme ($2 \\cdot 3$), 8 elemanlı bir birleştirme ($7$): toplam $4 + 6 + 7 = 17$. Genel olarak $n = 2^k$ için $n\\log_2 n - n + 1$. Örneğin $[1, 5, 3, 7, 2, 6, 4, 8]$ her birleştirmede iki listeyi dönüşümlü tüketir ve tam 17 karşılaştırma yapar.`,
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
      minutes: 45,
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
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Hangisi bir **en kötü durum** garantisidir?',
              options: [
                '“Rastgele girdilerde ortalama $n\\log n$ adım.”',
                '“Her $n$ elemanlı girdide en fazla $11n\\log_2 n + 11n$ adım.”',
                '“Test ettiğimiz 1000 girdide en fazla 5 saniye.”',
                '“Sıralı girdide $n - 1$ karşılaştırma.”',
              ],
              answer: 1,
              hint: 'Rakip hangi girdiyi seçerse seçsin geçerli olmalı.',
              explanation: 'Yalnızca ikinci ifade **her** girdi için konuşuyor. Diğerleri bir dağılıma, sonlu bir teste ya da tek bir girdiye bağlı.',
            },
          ],
          label: 'intuition',
          body: `Bir rakiple oyun oynadığımızı düşünün: biz bir algoritma ve bir süre sınırı $T(n)$ söyleriz; rakip, algoritmamızı en çok yavaşlatacak $n$ boyutlu girdiyi seçer. Rakip ne seçerse seçsin süre $T(n)$’yi aşmıyorsa kazanırız. Bu, **her girdi için** geçerli, çok güçlü bir garantidir.

Ortalama durum analizi (girdiler üzerinde bir dağılım varsayar) daha zordur ve girdiye dair güçlü varsayımlar ister; bu ders ağırlıklı olarak en kötü durumla çalışır.`,
        },
        {
          kind: 'formal',
          title: 'Asimptotik gösterim (Ders 2 notları)',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: '$f(n) = 5n^3 + 2n\\log n + 7$ için hangisi doğrudur?',
              options: ['$f(n) = \\Theta(n^3)$', '$f(n) = O(n^2)$', '$f(n) = \\Omega(n^4)$', '$f(n) = \\Theta(n\\log n)$'],
              answer: 0,
              hint: 'En hızlı büyüyen terim hangisi?',
              explanation: '$n \\ge 1$ için $5n^3 \\le f(n) \\le 14n^3$: tanıklar $c = 5$ ve $c = 14$, $n_0 = 1$.',
            },
            {
              id: 'c3',
              kind: 'order',
              prompt: 'Fonksiyonları büyüme hızına göre yavaştan hızlıya sıralayın.',
              items: ['$\\log n$', '$\\sqrt{n}$', '$n$', '$n\\log n$', '$n^2$', '$2^n$', '$n!$'],
              hint: 'Her üstel fonksiyon her polinomu, her polinom her logaritmayı sonunda geçer.',
              explanation: '$\\log n \\ll \\sqrt n \\ll n \\ll n\\log n \\ll n^2 \\ll 2^n \\ll n!$.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `$T(n)$ ve $f(n)$ negatif olmayan fonksiyonlar olsun.

$$T(n) = O(f(n)) \\iff \\exists\\, c > 0,\\ n_0 \\ \\text{öyle ki}\\ \\forall n \\ge n_0:\\ 0 \\le T(n) \\le c\\,f(n)$$
$$T(n) = \\Omega(f(n)) \\iff \\exists\\, c > 0,\\ n_0 \\ \\text{öyle ki}\\ \\forall n \\ge n_0:\\ 0 \\le c\\,f(n) \\le T(n)$$
$$T(n) = \\Theta(f(n)) \\iff T(n) = O(f(n)) \\text{ ve } T(n) = \\Omega(f(n))$$

Sezgisel olarak: O bir **üst sınır**, Ω bir **alt sınır**, Θ ise **sıkı** sınırdır.`,
        },
        {
          kind: 'viz',
          title: 'Büyüme hızı gezgini',
          tasks: [
            '$n\\log_2 n$ ve $n^2$’yi seç, üst sınırı 1024 yap: oran yaklaşık kaç?',
            '$2^n$’yi ekle ve logaritmik ekseni kapat. Diğer eğrilere ne oldu?',
            'Logaritmik eksende $\\log n$ ile $n$’nin arasındaki mesafenin $n$ büyüdükçe nasıl değiştiğine bak.',
          ],
          viz: 'growth',
          body: `Fonksiyonları seçip $n$ arttıkça nasıl ayrıştıklarını görün. Logaritmik eksen, çok farklı büyüklükleri tek grafikte gösterir.`,
        },
        {
          kind: 'viz',
          title: 'Tanık (c, n₀) denetleyicisi',
          tasks: [
            '$3n^2 + 5n + 10 = O(n^2)$ için $c = 4$ seç ve geçen en küçük $n_0$’ı bul.',
            '$11n\\log_2 n + 11n = O(n)$ iddiasını farklı $c$ değerleriyle “kurtarmaya” çalış. İlk karşı örnek nasıl kayıyor? Neden hiçbir $c$ yetmiyor?',
            '**Ω** moduna geç ve $100n + 1000 = \\Omega(n)$ için bir tanık bul.',
          ],
          viz: 'bigO',
          body: `Bir $T(n)$, bir iddia ve $c$, $n_0$ seçin. Araç $n \\le 2000$ için koşulun sağlanıp sağlanmadığını kontrol eder ve ilk karşı örneği gösterir. Örneğin $3n^2 + 5n + 10 = O(n^2)$ için $c = 4$ hangi $n_0$ ile çalışır? $c = 30, n_0 = 1$ (notlardaki $c = (k+1)\\max_i|a_i|$ yöntemi: $k = 2$, $\\max_i|a_i| = 10$) ne olur? $11n\\log_2 n + 11n = O(n)$ iddiasını hangi $c$ kurtarabilir?`,
        },
        {
          kind: 'correctness',
          title: 'İki örnek kanıt (notlardaki iddialar)',
          label: 'formalProof',
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
          tasks: ['**Yeni rastgele girdiler**’e birkaç kez bas: InsertionSort noktaları $n^2/4$ eğrisinin etrafında mı kalıyor? Bu bir kanıt mı?'],
          viz: 'empiricalSorting',
        },
        {
          kind: 'text',
          title: 'Pratikte: sabitler ne zaman önemlidir?',
          body: `Asimptotik gösterim büyük $n$’de neyin kazanacağını söyler; gerçek bir programda ise $n$ sınırlıdır ve sabitler de rol oynar.

- $100n$ ile $n^2$: $n \\le 100$ iken $n^2$ daha küçüktür. Bu yüzden kütüphaneler küçük girdilerde basit yöntemlere geçer (InsertionSort, okul yöntemiyle çarpma).
- **Bellek ve önbellek:** aynı sayıda işlem yapan iki algoritmadan belleğe sırayla erişen çoğu zaman çok daha hızlıdır; asimptotik analiz bunu görmez.
- **“Galaktik” algoritmalar:** Harvey–van der Hoeven’in $O(n\\log n)$ çarpma algoritması kuramsal olarak en iyisidir, ama yalnızca evrendeki atom sayısını aşan boyutlarda kazanır.
- **Taban önemsizdir:** $\\log_2 n = \\log_{10} n / \\log_{10} 2$; tabanlar arasında yalnızca sabit çarpan farkı vardır, bu yüzden $O(\\log n)$ yazarken taban belirtilmez.

İyi bir mühendis önce asimptotik olarak doğru algoritmayı seçer, sonra ölçerek sabitleri iyileştirir.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: '$n^2 > 100n$ eşitsizliğini sağlayan en küçük pozitif tam sayı $n$ kaçtır?',
              answer: 101,
              hint: '$n^2 > 100n \\iff n > 100$.',
              explanation: '$n = 100$’de eşitlik var; $n = 101$’den itibaren $n^2$ büyüktür.',
            },
            {
              id: 'c5',
              kind: 'mcq',
              prompt: '$\\log_2 n$ ile $\\log_{10} n$ arasındaki ilişki için hangisi doğrudur?',
              options: ['$\\log_2 n = \\Theta(\\log_{10} n)$', '$\\log_2 n = O(\\log_{10} n)$ ama tersi yanlış', 'Karşılaştırılamazlar', '$\\log_2 n = \\Theta(n)$'],
              answer: 0,
              hint: 'Taban değiştirme formülü.',
              explanation: '$\\log_2 n = \\log_{10} n / \\log_{10} 2 \\approx 3.32\\,\\log_{10} n$: yalnızca sabit çarpan farkı.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: $\\frac{n^2}{2} - 3n = \\Theta(n^2)$',
          label: 'formalProof',
          proof: [
            { title: 'Hedef', body: 'İki tanık çifti bulmalıyız: üst sınır için $(c_1, n_1)$, alt sınır için $(c_2, n_2)$.' },
            { title: 'Üst sınır', body: '$n \\ge 1$ için $-3n \\le 0$, yani $\\frac{n^2}{2} - 3n \\le \\frac12 n^2$: $c_1 = \\frac12$, $n_1 = 1$.' },
            { title: 'Alt sınır: c seç', body: 'Baştaki katsayıdan küçük bir sabit seçelim: $c_2 = \\frac14$. İstenen: $\\frac{n^2}{2} - 3n \\ge \\frac{n^2}{4}$.' },
            { title: 'Alt sınır: n₀ bul', body: '$\\frac{n^2}{4} \\ge 3n \\iff n \\ge 12$: $n_2 = 12$. ($n = 12$’de iki taraf da 36.)' },
            { title: 'Sonuç', body: '$n \\ge 12$ için $\\frac14 n^2 \\le \\frac{n^2}{2} - 3n \\le \\frac12 n^2$: $\\Theta(n^2)$. Tanıklar tek değildir: $c_2$ baştaki katsayıya ($\\frac12$) yaklaştıkça gereken $n_0$ büyür.' },
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: '$c_2 = \\frac15$ seçilirse $\\frac{n^2}{2} - 3n \\ge \\frac{n^2}{5}$ en küçük hangi $n$’den itibaren sağlanır?',
              answer: 10,
              hint: '$\\frac{n^2}{2} - \\frac{n^2}{5} = \\frac{3n^2}{10} \\ge 3n$.',
              explanation: '$\\frac{3n^2}{10} \\ge 3n \\iff n \\ge 10$. Daha küçük $c_2$ daha küçük bir $n_0$ verir.',
            },
          ],
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
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: $2^{n+5} = O(2^n)$ midir? Peki $3^n = O(2^n)$?`,
          hints: ['Oranlara bakın: $2^{n+5} / 2^n$ ve $3^n / 2^n$.', 'Big-O, oranın bir sabitle sınırlı kalmasını ister.'],
          solution: `$2^{n+5} = 32 \\cdot 2^n$: $c = 32$, $n_0 = 1$ ile $O(2^n)$. Ama $3^n / 2^n = (3/2)^n$ sınırsız büyür; hangi $c$’yi seçerseniz seçin $(3/2)^n > c$ olan bir $n$ vardır, yani $3^n \\ne O(2^n)$. Üsse **eklenen** bir sabit, sabit bir çarpandır; **tabandaki** fark ise değildir.`,
        },
      ],
      sources: [SRC.l2.notes, SRC.l2.slides, SRC.l2.conceptAsym, SRC.sec.s1, SRC.hw.hw2],
    },
  ],
}
