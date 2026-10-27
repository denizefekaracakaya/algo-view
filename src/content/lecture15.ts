import type { Lecture } from './types'
import { SRC } from './sources'
import { KRUSKAL_CODE, PRIM_CODE } from '../engines/mst'

export const lecture15: Lecture = {
  n: 15,
  title: 'Minimum yayılan ağaçlar',
  titleEn: 'Minimum Spanning Trees',
  date: '2 Mart 2026',
  blurb: 'Bir kesmeyi geçen en hafif kenar her zaman güvenlidir: Prim ve Kruskal bu tek fikrin iki uygulamasıdır.',
  lessons: [
    {
      id: 'l15-mst',
      lecture: 15,
      title: 'Minimum yayılan ağaçlar: Prim ve Kruskal',
      titleEn: 'Minimum spanning trees: Prim and Kruskal',
      summary: 'Kesmeler, hafif kenarlar, kesme özelliği; öncelik kuyruğu ve union-find.',
      minutes: 60,
      objectives: [
        'Minimum yayılan ağaç (MST) problemini ve genel “güvenli kenar ekle” şablonunu ifade etmek.',
        'Kesme, kesmeye saygı ve hafif kenar kavramlarını tanımlamak; kesme özelliğini (Teorem 1) kanıtlamak.',
        'Prim’in algoritmasını Dijkstra’ya benzer bir şekilde adım adım çalıştırmak.',
        'Kruskal’ın algoritmasını union-find ile çalıştırmak ve sürelerini karşılaştırmak.',
      ],
      prerequisites: ['Açgözlü algoritmalar (Ders 14)', 'Dijkstra (Ders 11)', 'Grafikler (Ders 9)'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: en ucuz bağlantı ağı',
          label: 'intuition',
          body: `Birkaç şehri fiber kabloyla birbirine bağlamak istiyoruz; her olası bağlantının bir maliyeti var. Her şehrin diğer her şehre (belki aracılar üzerinden) ulaşabilmesi gerekiyor ve toplam maliyet en az olmalı.

Bu, yönsüz ağırlıklı bir grafikte **minimum yayılan ağaç** (MST) problemidir: tüm düğümleri bağlayan, döngüsüz (bir **ağaç**) ve toplam kenar ağırlığı en küçük alt grafik. Döngü fazladan maliyettir: bir döngüden en ağır kenarı atınca hâlâ her şey bağlıdır.

İyi haber: bu problem açgözlü algoritmalarla, polinom zamanda ve çok sezgisel biçimde çözülür.`,
        },
        {
          kind: 'formal',
          title: 'Kesmeler ve hafif kenarlar (Ders 15 notları)',
          box: 'formal',
          label: 'formal',
          body: `- Bir **kesme** $(S, V - S)$, düğümleri iki ayrık kümeye ayırmaktır. Bir kenarın bir ucu $S$’de, diğeri $V - S$’de ise kenar **kesmeyi geçer**.
- Kesme, bir $A$ kenar kümesine **saygı duyar**: $A$’daki hiçbir kenar kesmeyi geçmiyorsa.
- Kesmeyi geçen kenarlar arasında ağırlığı en küçük olana **hafif kenar** denir.

**Şablon:** $A = \\emptyset$ ile başla; $A$ bir yayılan ağaç olana kadar “güvenli” bir kenar ekle. Değişmez: $A$’yı içeren bir MST hep vardır.

**Teorem 1 (kesme özelliği):** $A$ bir MST’nin parçası, $(S, V - S)$ $A$’ya saygı duyan bir kesme ve $(u, v)$ bu kesmeyi geçen bir hafif kenar olsun. O zaman $A \\cup \\{(u, v)\\}$’yi içeren bir MST vardır.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: '9 düğümlü bağlı bir grafiğin her yayılan ağacında kaç kenar vardır?',
              answer: 8,
              hint: 'Ağaç: bağlı ve döngüsüz.',
              explanation: '$n$ düğümlü bir ağaçta tam $n - 1 = 8$ kenar vardır.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Kesme özelliğinin kanıtı',
          label: 'formalProof',
          proof: [
            { title: 'Kurulum', body: '$T$, $A$’yı içeren bir MST olsun. $(u, v) \\in T$ ise bitti. Değilse $T$’ye $(u, v)$ eklemek bir döngü oluşturur.' },
            { title: 'Kesmeyi geçen başka bir kenar', body: '$T$’de $u$’dan $v$’ye bir $p$ yolu vardır; $u$ ve $v$ kesmenin farklı taraflarında olduğu için $p$ üzerinde kesmeyi geçen bir $(x, y)$ kenarı vardır. Kesme $A$’ya saygı duyduğundan $(x, y) \\notin A$.' },
            { title: 'Değiştirme', body: '$T\' = T - \\{(x, y)\\} \\cup \\{(u, v)\\}$. $(x, y)$’yi çıkarmak $T$’yi iki parçaya böler, $(u, v)$ onları yeniden bağlar: $T\'$ bir yayılan ağaçtır ve $A \\cup \\{(u, v)\\}$’yi içerir.' },
            { title: 'Hâlâ minimum', body: '$(u, v)$ hafif olduğundan $w(u, v) \\le w(x, y)$: $w(T\') \\le w(T)$. $T$ minimum olduğu için eşitlik: $T\'$ de bir MST’dir.' },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'Prim (notlar, Algoritma 2)',
          code: PRIM_CODE,
          body: `Prim’in $A$ kümesi **tek bir ağaçtır**: kök $r$’den başlar ve her adımda ağaçtan dışarı çıkan en hafif kenarla yeni bir düğüm ekler. Kesme: (ağaçtaki düğümler, geri kalanlar); bu kesme $A$’ya saygı duyar ve seçilen kenar hafiftir → Teorem 1. $key(v)$, $v$’yi ağaca bağlayan en hafif kenarın ağırlığıdır; Dijkstra’daki $d[v]$’ye çok benzer, ama yol uzunluğu değil **tek kenar** ağırlığıdır.`,
        },
        {
          kind: 'pseudocode',
          title: 'Kruskal (notlar, Algoritma 3)',
          code: KRUSKAL_CODE,
          body: `Kruskal’ın $A$ kümesi bir **orman**dır (ayrık ağaçlar). Kenarlar hafiften ağıra incelenir; bir kenar iki farklı ağacı birleştiriyorsa eklenir, aynı ağaçtaki iki düğümü bağlıyorsa (döngü oluşturacağı için) atlanır. Kesme: (kenarın bir ucunun ağacı, geri kalanlar); daha hafif kenarların hepsi zaten incelendiği için bu kenar hafiftir. **Union-find** (ayrık kümeler) veri yapısı “aynı ağaçta mı?” sorusunu ($find$) ve birleştirmeyi ($union$) neredeyse sabit sürede yapar.`,
        },
        {
          kind: 'viz',
          title: 'MST görselleştiricisi',
          viz: 'mst',
          tasks: [
            'Notlardaki grafikte Kruskal’ı oynatın: hangi kenarlar döngü oluşturduğu için atlanıyor? Toplam ağırlık kaç?',
            'Prim’e geçin: düğümlerin altındaki $key$ değerleri nasıl değişiyor? Eşitlikte ($c$ ile $h$, ikisi de 8) hangisi seçiliyor?',
            'İki algoritma aynı kenar kümesini mi buldu? Aynı toplam ağırlığı?',
            '**Tahmin modu**nda Kruskal’da her kenarın eklenip eklenmeyeceğini tahmin edin.',
          ],
          body: `Yeşil kenarlar ağaçtadır, sarı kenar inceleniyor, soluk kesikli kenarlar atlandı. Kruskal’da aynı renkteki düğümler aynı kümededir (union-find); yan panelde kümeler listelenir. Prim’de mavi düğümler kuyrukta, anahtarı sonlu olanlardır.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Notlardaki örnek grafiğin (a…i) minimum yayılan ağacının toplam ağırlığı kaçtır?',
              answer: 37,
              hint: 'Kruskal’ın eklediği kenarlar: gh 1, ci 2, fg 2, ab 4, cf 4, cd 7, ah 8, de 9.',
              explanation: '$1 + 2 + 2 + 4 + 4 + 7 + 8 + 9 = 37$. Prim de aynı toplamı bulur (kenarlar eşitlik nedeniyle farklı olabilir).',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Çalışma süreleri',
          body: `- **Prim:** Dijkstra’nın bir değişikliği. Kırmızı-siyah ağaç ya da ikili yığınla ExtractMin ve DecreaseKey $O(\\log n)$ → $O(m \\log n)$. Fibonacci yığınıyla $O(m + n \\log n)$.
- **Kruskal:** kenarları sıralamak $O(m \\log n)$ (ağırlıklar küçük tam sayılarsa RadixSort ile $O(m)$). Union-find ile $m$ işlem $O(m\\,\\alpha(n))$; $\\alpha$ ters Ackermann fonksiyonudur ve evrendeki atom sayısından küçük her $n$ için $\\alpha(n) \\le 4$. Pratikte neredeyse doğrusal.
- **Daha yenileri:** Karger–Klein–Tarjan (1995) rastgele beklenen $O(n + m)$; Chazelle (2000) deterministik $O(m\\,\\alpha(n))$.`,
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'Kenar ağırlıkları 1 ile 100 arasında tam sayılar. Kruskal’ın toplam süresi ne olur?',
              options: ['$O(m\\log n)$', '$O(m + 100 + m\\,\\alpha(n))$, yani neredeyse doğrusal', '$O(n^2)$', '$O(mn)$'],
              answer: 1,
              hint: 'Kenarları sıralamak için CountingSort kullanılabilir mi?',
              explanation: 'Ağırlıklar 100 kovaya düşer: CountingSort ile sıralama $O(m + 100)$. Geriye union-find işlemleri kalır: $O(m\\,\\alpha(n))$.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: MST nerede kullanılır?',
          body: `- **Ağ tasarımı:** elektrik, su, fiber ya da yol ağlarını en düşük maliyetle kurmak.
- **Kümeleme:** Kruskal’ı $k$ küme kalınca durdurmak, “tek bağlantılı kümeleme”yi verir: noktalar arası en yakın komşu ilişkisine göre gruplar.
- **Yaklaşık algoritmalar:** gezgin satıcı probleminin (NP-zor) metrik sürümünde MST, en fazla 2 kat kötü bir tur kurmak için kullanılır.
- **Görüntü bölütleme:** pikseller düğüm, renk farkları kenar ağırlığıdır; Kruskal benzeri birleştirmeler bölgeleri bulur.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Kruskal, $n$ küme yerine $k$ küme kalınca durdurulursa ne elde edilir?',
              options: ['Hiçbir anlamı olmayan bir orman', 'Noktaları, aralarındaki en kısa bağlantılara göre $k$ gruba ayıran bir kümeleme', 'En kısa yollar ağacı', 'Rastgele bir ağaç'],
              answer: 1,
              hint: 'Kruskal hep en yakın iki grubu birleştirir.',
              explanation: 'Bu, tek bağlantılı (single-linkage) kümelemedir: farklı kümeler arasındaki en kısa kenar mümkün olduğunca uzun olur.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: döngü özelliği ve bir kenarın ucuzlaması',
          label: 'formal',
          body: `Kesme özelliği hangi kenarların **güvenli** olduğunu söyler. Ayna yüzü, hangi kenarların **hiçbir zaman** gerekmediğini söyler: bir döngüdeki (tek) en ağır kenar hiçbir MST’de yoktur. “Küçük örnek” grafiği üzerinde görelim (ab 3, ad 1, bd 4, bc 5, be 2, ce 6, cf 2, de 7, ef 1; MST ağırlığı 9).`,
          proof: [
            { title: 'Döngü özelliği', body: 'Bir $C$ döngüsünün en ağır kenarı $e$ tek ise ve $e$ bir $T$ ağacında olsaydı: $e$’yi çıkarmak $T$’yi ikiye böler, $C$’nin başka bir kenarı iki parçayı daha ucuza bağlar. Daha hafif bir yayılan ağaç: çelişki.' },
            { title: 'Örnekte', body: '$a - d - e - b - a$ döngüsü: ad 1, de 7, eb 2, ba 3. En ağırı de 7: MST’de değildir. Kruskal da onu “döngü oluşturur” diye atlar.' },
            { title: 'Bir kenar ucuzlarsa', body: 'bd’nin ağırlığı 4’ten 0’a insin. Eski MST’ye bd eklenince $b - d - a - b$ döngüsü oluşur (bd 0, ad 1, ab 3); döngü özelliğine göre en ağır kenar ab 3 çıkar. Yeni MST ağırlığı $9 - 3 + 0 = 6$.' },
            { title: 'Ders', body: 'Bir kenar ağırlığı azalınca MST’yi baştan hesaplamaya gerek yok: kenarı ekle, oluşan tek döngüdeki en ağır kenarı çıkar, $O(n)$.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Küçük örnekte $b - c - f - e - b$ döngüsü (bc 5, cf 2, fe 1, eb 2) var. Hangi kenar hiçbir MST’de olamaz?',
              options: ['cf', 'ef', 'bc', 'be'],
              answer: 2,
              hint: 'Döngünün tek en ağır kenarı.',
              explanation: 'bc 5 döngüdeki tek en ağır kenardır; döngü özelliğine göre hiçbir MST’de yer almaz.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Prim’i Dijkstra ile karıştırmak: Prim’de $key(v)$ **tek bir kenarın** ağırlığıdır, kaynaktan uzaklık değil. MST, en kısa yollar ağacı değildir.
- Kruskal’da döngü kontrolünü unutmak ya da her seferinde DFS ile yapmak (union-find çok daha hızlıdır).
- MST’nin her zaman tek olduğunu sanmak: eşit ağırlıklar varsa birden çok MST olabilir; tüm ağırlıklar farklıysa tektir.
- Yönlü grafiklerde de bu algoritmaların çalıştığını sanmak: yönlü sürüm (arboresans) farklı bir problemdir.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Kesme özelliği neyi söyler?',
          options: [
            'Kesmeyi geçen en ağır kenar hiçbir MST’de olamaz.',
            '$A$’ya saygı duyan bir kesmeyi geçen hafif bir kenar, $A$’ya eklenince hâlâ bir MST’nin parçası olur.',
            'Her kesmede tam bir MST kenarı vardır.',
            'MST her zaman tektir.',
          ],
          answer: 1,
          hint: 'Teorem 1.',
          explanation: 'Bu, hem Prim’in hem Kruskal’ın doğruluğunun temelidir.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'Kruskal’ın (union-find ile) çalışma süresine hangi adım hâkimdir?',
          options: ['Union-find işlemleri', 'Kenarları sıralamak: $O(m \\log n)$', 'Döngüleri DFS ile aramak', 'Komşuluk listesini kurmak'],
          answer: 1,
          hint: '$\\alpha(n) \\le 4$.',
          explanation: 'Union-find işlemleri pratikte sabit; karşılaştırmalı sıralama $O(m \\log m) = O(m \\log n)$ sürer.',
        },
        {
          id: 'q3',
          kind: 'numeric',
          prompt: 'Görselleştiricideki “Küçük örnek” grafiğinin MST ağırlığı kaçtır?',
          answer: 9,
          hint: 'En hafif kenarlar: ad 1, ef 1, be 2, cf 2…',
          explanation: 'ad 1, ef 1, be 2, cf 2, ab 3: $1 + 1 + 2 + 2 + 3 = 9$; 5 kenar, 6 düğüm.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Bir grafikte tüm kenar ağırlıkları farklıysa ne söylenebilir?',
          options: ['MST tektir.', 'MST yoktur.', 'Prim ile Kruskal farklı ağırlıklar bulur.', 'MST’de en ağır kenar mutlaka vardır.'],
          answer: 0,
          hint: 'Kesme özelliğinde hafif kenar her zaman tek olur.',
          explanation: 'Farklı ağırlıklarla her kesmenin hafif kenarı tektir; iki farklı MST olsaydı aralarındaki farktan bir çelişki çıkardı. (En ağır kenar köprü değilse MST’de olmaz.)',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz (görselleştiricideki “Küçük örnek”): kenarlar ab 3, ad 1, bd 4, bc 5, be 2, ce 6, cf 2, de 7, ef 1. Kruskal’ı elle çalıştırın: her kenar için “eklendi / atlandı” yazın ve kümeleri izleyin. Sonra $a$’dan başlayarak Prim’i çalıştırın.`,
          hints: ['Sıralı kenarlar: ad 1, ef 1, be 2, cf 2, ab 3, bd 4, bc 5, ce 6, de 7.', 'Prim: $a$’dan sonra $d$ (1), sonra $b$ (3)…'],
          solution: `**Kruskal:** ad 1 eklendi {a,d}; ef 1 eklendi {e,f}; be 2 eklendi {b,e,f}; cf 2 eklendi {b,c,e,f}; ab 3 eklendi {a,b,c,d,e,f} — 5 kenar, bitti. Toplam 9. (bd 4, bc 5, ce 6, de 7 artık döngü oluşturur.) **Prim ($a$’dan):** $a$; key(b) = 3, key(d) = 1 → $d$ eklenir (ad 1); key(e) = 7 → $b$ (ab 3); key(c) = 5, key(e) = 2 → $e$ (be 2); key(f) = 1, key(c) = 5 → $f$ (ef 1); key(c) = 2 → $c$ (cf 2). Aynı ağaç, ağırlık 9.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: dört şehir $p, q, r, s$ ve her çift arasında bir bağlantı maliyeti: pq 1, pr 4, ps 3, qr 2, qs 5, rs 6. Kruskal’la MST’yi bulun. Sonra döngü özelliğiyle hangi kenarların hiçbir MST’de olamayacağını gerekçelendirin.`,
          hints: ['Sıralı kenarlar: pq 1, qr 2, ps 3, pr 4, qs 5, rs 6.', '$n - 1 = 3$ kenar yeter.'],
          solution: `Kruskal: pq 1 eklendi, qr 2 eklendi, ps 3 eklendi: 3 kenar, bitti. Ağırlık $1 + 2 + 3 = 6$. Diğerleri: pr 4, $p - q - r - p$ döngüsünün (1, 2, 4) en ağırı; qs 5, $q - p - s - q$ döngüsünün (1, 3, 5) en ağırı; rs 6, $r - q - p - s - r$ döngüsünün (2, 1, 3, 6) en ağırı. Üçü de hiçbir MST’de olamaz ve tüm ağırlıklar farklı olduğu için MST tektir.`,
        },
      ],
      sources: [SRC.l15.notes, SRC.l15.slides, SRC.l15.pre, SRC.l15.notebook, SRC.l15.concept],
    },
  ],
}
