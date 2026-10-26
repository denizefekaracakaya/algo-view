import type { Lecture } from './types'
import { SRC } from './sources'
import { ACTIVITY_CODE, HUFFMAN_CODE } from '../engines/greedy'

export const lecture14: Lecture = {
  n: 14,
  title: 'Açgözlü algoritmalar',
  titleEn: 'Greedy Algorithms',
  date: '25 Şubat 2026',
  blurb: 'Her adımda yerel olarak en iyi seçimi yapmak — ve bunun neden optimal olduğunu “değiştirme” argümanıyla kanıtlamak.',
  lessons: [
    {
      id: 'l14-greedy',
      lecture: 14,
      title: 'Açgözlü seçim: etkinlik seçimi ve zamanlama',
      titleEn: 'The greedy choice: activity selection and scheduling',
      summary: 'Yalnızca tek bir alt probleme bakmak; en erken biten etkinlik ve $l/w$ oranı.',
      minutes: 40,
      objectives: [
        'Açgözlü algoritmayı dinamik programlamanın bir inceltmesi olarak görmek: her adımda yalnızca bir alt problem.',
        'Etkinlik seçiminde en erken bitenin bir optimal çözümde bulunduğunu değiştirme argümanıyla kanıtlamak.',
        'Ağırlıklı tamamlanma süresinde işleri $l_j / w_j$ oranına göre sıralamanın neden optimal olduğunu göstermek.',
        'Açgözlü kuralların ne zaman yanıldığını örnekle göstermek.',
      ],
      prerequisites: ['Dinamik programlama (Ders 12–13)', 'Sıralama'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: bir seçim yap ve arkana bakma',
          label: 'intuition',
          body: `Dinamik programlamada bir alt problemin cevabı **birçok** küçük alt probleme bakılarak bulunuyordu. Bazen optimal çözümün yalnızca **bir** alt probleme bağlı olduğunu görürüz: o anda en iyi görünen seçimi yaparsak geri kalan problem tek bir alt problemdir. Bu **açgözlü** (greedy) bir algoritmadır: hızlı ve basit.

Tuzak: açgözlü algoritmalar çoğu zaman optimal **değildir** (sırt çantasındaki oran kuralı gibi). Doğru olduklarını göstermenin standart yolu bir **değiştirme argümanıdır**: herhangi bir optimal çözümü, açgözlü seçimi içerecek şekilde, kötüleştirmeden değiştirebileceğimizi göstermek.`,
        },
        {
          kind: 'formal',
          title: 'Etkinlik seçimi problemi',
          box: 'formal',
          label: 'formal',
          body: `$n$ etkinlik var; $a_i$, $s_i$’de başlayıp $f_i$’de bitiyor. Aynı anda iki etkinliğe katılamayız. **Çakışmayan en çok etkinliği** seçmek istiyoruz (tek bir makinede iş zamanlamak gibi).

DP yaklaşımı: $S_{i,j}$ = $a_i$ bittikten sonra başlayıp $a_j$ başlamadan biten etkinlikler. Optimal kümede $a_k$ varsa $|A_{i,j}| = 1 + |A_{i,k}| + |A_{k,j}|$. Bu, $n^2$ hücreli bir tablo ve $O(n^3)$ süre demektir.

**Önerme 1:** her $S_{i,j}$ için, $S_{i,j}$’de **en erken biten** $a_k$’yı içeren bir optimal çözüm vardır. Bu durumda $A_{i,k}$ boştur (ondan önce biten yok) ve yalnızca $A_{k,j}$ kalır: tek bir alt problem!`,
        },
        {
          kind: 'correctness',
          title: 'Önerme 1’in kanıtı (değiştirme argümanı)',
          label: 'formalProof',
          proof: [
            { title: 'Kurulum', body: '$a_k$: $S_{i,j}$’de en erken biten etkinlik. $A_{i,j}$: herhangi bir optimal küme; $a_\\ell$: $A_{i,j}$’de en erken biten etkinlik.' },
            { title: 'Değiştirme', body: '$A\' = A_{i,j} \\setminus \\{a_\\ell\\} \\cup \\{a_k\\}$. Boyutu aynıdır: $|A\'| = |A_{i,j}|$.' },
            { title: 'Hâlâ çakışmasız', body: '$a_k$ en erken bitendir: $f_k \\le f_\\ell$. $A_{i,j}$’deki diğer her $a_t$, $a_\\ell$ ile çakışmadığı ve ondan sonra geldiği için $s_t \\ge f_\\ell \\ge f_k$: hiçbiri $a_k$ ile çakışmaz.' },
            { title: 'Sonuç', body: '$A\'$ geçerli ve optimal bir çözümdür ve $a_k$’yı içerir. Demek ki açgözlü seçim hiçbir zaman bizi optimal çözümden uzaklaştırmaz; geri kalanına tümevarımla aynı argüman uygulanır.' },
          ],
        },
        {
          kind: 'viz',
          title: 'Etkinlik seçimi görselleştiricisi',
          viz: 'activity',
          tasks: [
            'Örnek günü oynatın: kaç etkinlik seçildi? Her atlanan etkinlik hangi seçilmiş etkinlikle çakışıyor?',
            'Neden en **kısa** etkinliği seçmek yerine en **erken biteni** seçiyoruz? Rastgele etkinliklerle birkaç kez deneyin.',
            '**Tahmin modu**nda her etkinlik için “seçilir mi?” sorusunu cevaplayın.',
          ],
          body: `Etkinlikler bitiş zamanına göre sıralanmıştır. Dikey çizgi, en son seçilen etkinliğin bitiş anıdır: incelenen etkinlik bu çizgiden önce başlıyorsa çakışır.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Görselleştiricideki örnek günde açgözlü algoritma kaç etkinlik seçer?',
              answer: 4,
              hint: 'İlk seçilen $a$ [1, 4).',
              explanation: '$a$ [1, 4), $d$ [5, 7), $h$ [8, 11), $k$ [12, 16): 4 etkinlik. Testlerimiz bunun tüm alt kümeler arasında en iyi olduğunu doğrular.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'Greedy-AS (notlar, Algoritma 1)',
          code: ACTIVITY_CODE,
          body: `Etkinlikler bitiş zamanına göre sıralıysa tek geçiş: **$O(n)$**. Sıralama da gerekiyorsa $O(n \\log n)$. DP’nin $O(n^3)$’üne göre dramatik bir kazanç.`,
        },
        {
          kind: 'formal',
          title: 'Zamanlama: ağırlıklı tamamlanma süresi',
          box: 'formal',
          label: 'formal',
          body: `$n$ iş tek bir kaynağı paylaşıyor; $j$ işinin uzunluğu $l_j$, önemi (ağırlığı) $w_j$. Bir sıralamada $j$’nin **tamamlanma süresi** $c_j$, kendisine kadar olan işlerin uzunluklarının toplamıdır. Amaç $\\sum_j w_j c_j$’yi en aza indirmek.

**Değiştirme argümanı:** optimal sırada $i$’den hemen sonra $j$ gelsin ve ikisinin yerini değiştirelim. Diğer işlerin tamamlanma süreleri değişmez; $c_i$, $l_j$ kadar artar, $c_j$, $l_i$ kadar azalır. Amaç $w_i l_j - w_j l_i$ kadar değişir. Sıra optimal olduğundan bu değişim $\\ge 0$:
$$w_i l_j \\ge w_j l_i \\iff \\frac{l_i}{w_i} \\le \\frac{l_j}{w_j}.$$
Yani işler **$l / w$ oranına göre artan** sırada yapılmalıdır: kısa ve önemli işler önce.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'İki iş: A ($l = 3$, $w = 1$) ve B ($l = 1$, $w = 2$). En iyi sırada $\\sum w_j c_j$ kaçtır?',
              answer: 6,
              hint: 'Oranlar: A için 3, B için 0.5.',
              explanation: 'Önce B: $c_B = 1$, $c_A = 4$ → $2 \\cdot 1 + 1 \\cdot 4 = 6$. Ters sırada $1 \\cdot 3 + 2 \\cdot 4 = 11$.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Açgözlü algoritmaların süresi',
          body: `Çoğu açgözlü algoritma “bir anahtara göre sırala, sonra tek geçiş” kalıbındadır: $O(n \\log n)$ (sıralama) + $O(n)$. Asıl zorluk süre değil, **doğruluktur**: yanlış anahtar seçmek (en kısa etkinlik, en erken başlayan etkinlik, yalnızca ağırlık…) kolayca optimal olmayan sonuç verir.

Örnek: en **kısa** etkinliği seçmek, [0, 5), [4, 6), [5, 10) girdisinde [4, 6)’yı seçip diğer ikisini dışlar: 1 etkinlik, oysa optimum 2.`,
        },
        {
          kind: 'text',
          title: 'Pratikte',
          body: `- **İşletim sistemi zamanlayıcıları:** “en kısa iş önce” kuralı ortalama bekleme süresini en aza indirir — tüm ağırlıklar eşitken $l/w$ kuralının özel hâli.
- **Toplantı odası rezervasyonu:** tek bir odaya en çok toplantıyı sığdırmak etkinlik seçimidir; birden çok oda gerekiyorsa “aralık bölümleme” gibi ilgili açgözlü algoritmalar kullanılır.
- **Para üstü:** Türk lirası gibi “kanonik” madeni para sistemlerinde en büyük parayla başlamak optimaldir, ama keyfi sistemlerde (ör. 1, 3, 4 ile 6 vermek) yanılır.`,
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Madeni paralar 1, 3 ve 4 birim. 6 birimi “en büyük parayla başla” kuralı kaç parayla verir?',
              answer: 3,
              hint: '4 + 1 + 1.',
              explanation: 'Açgözlü 4 + 1 + 1 = 3 para kullanır, oysa 3 + 3 yalnızca 2 para. Açgözlü kural burada optimal değildir.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Bir açgözlü kuralı kanıtsız kabul etmek: birkaç örnekte çalışması yetmez.
- Değiştirme argümanında değiştirilen çözümün **hâlâ geçerli** olduğunu göstermeyi unutmak.
- Etkinlik seçiminde başlangıç zamanına göre sıralamak.
- Zamanlamada oranı ters kurmak ($w/l$ ile artan sıra yanlıştır; $l/w$ artan ya da $w/l$ azalan doğrudur).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Etkinlik seçiminde hangi açgözlü kural her zaman optimaldir?',
          options: ['En kısa etkinliği seç', 'En erken başlayanı seç', 'En erken biteni seç', 'En az çakışanı seç'],
          answer: 2,
          hint: 'Önerme 1.',
          explanation: 'En erken biten etkinlik, geri kalanlara en çok zamanı bırakır; değiştirme argümanı onun bir optimal çözümde olduğunu gösterir.',
          feedback: { 0: '[0,5), [4,6), [5,10) girdisinde yanılır.', 1: 'Çok uzun ama erken başlayan bir etkinlik her şeyi engelleyebilir.' },
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: 'Uzunlukları 1, 2, 3 ve ağırlıkları eşit (1) olan üç iş, en iyi sırada yapılırsa $\\sum c_j$ kaçtır?',
          answer: 10,
          hint: 'Kısa iş önce.',
          explanation: '$1 + 3 + 6 = 10$ (notlardaki örnek). Ters sırada $3 + 5 + 6 = 14$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Değiştirme argümanının amacı nedir?',
          options: [
            'Açgözlü algoritmanın hızlı olduğunu göstermek.',
            'Herhangi bir optimal çözümün, açgözlü seçimi içerecek şekilde kötüleşmeden değiştirilebileceğini göstermek.',
            'Tüm çözümleri listelemek.',
            'DP tablosunu küçültmek.',
          ],
          answer: 1,
          hint: 'Önerme 1’in kanıtında ne yaptık?',
          explanation: 'Optimal bir çözümden başlayıp bir elemanı açgözlü seçimle değiştirdik; çözüm geçerli ve aynı değerde kaldı.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'İşler zaten $l/w$’ye göre sıralıysa ağırlıklı tamamlanma süresi problemi ne kadar sürer?',
          options: ['$O(1)$', '$O(n)$', '$O(n \\log n)$', '$O(n^2)$'],
          answer: 1,
          hint: 'Yapılacak tek şey sırayla toplamak.',
          explanation: 'Sıralı listeyi bir kez gezip tamamlanma sürelerini toplamak $O(n)$; sıralama da gerekiyorsa $O(n \\log n)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: dört iş — P ($l = 4$, $w = 2$), Q ($l = 1$, $w = 1$), R ($l = 3$, $w = 3$), S ($l = 2$, $w = 1$). En iyi sırayı ve $\\sum w_j c_j$’yi bulun.`,
          hints: ['Oranlar: P 2, Q 1, R 1, S 2.', 'Eşit oranlı işlerin sırası sonucu değiştirmez.'],
          solution: `Oranlar $l/w$: Q 1, R 1, P 2, S 2. Sıra Q, R, P, S: tamamlanma 1, 4, 8, 10 → $1 \\cdot 1 + 3 \\cdot 4 + 2 \\cdot 8 + 1 \\cdot 10 = 1 + 12 + 16 + 10 = 39$. (R, Q, P, S de 39 verir: $3 \\cdot 3 + 1 \\cdot 4 + 16 + 10 = 39$.)`,
        },
      ],
      sources: [SRC.l14.notes, SRC.l14.slides, SRC.l14.pre, SRC.l14.notebook, SRC.l14.concept],
    },
    {
      id: 'l14-huffman',
      lecture: 14,
      title: 'Huffman kodları',
      titleEn: 'Huffman codes',
      summary: 'Önek içermeyen kodlar, kod ağaçları ve en küçük iki sıklığı birleştirmek.',
      minutes: 35,
      objectives: [
        'Önek içermeyen (prefix-free) kodların neden gerektiğini ve ikili ağaçlarla gösterimini açıklamak.',
        'Bir kodun maliyetini $B(T) = \\sum_c f(c)\\, d_T(c)$ olarak hesaplamak.',
        'Huffman algoritmasını adım adım çalıştırmak.',
        'Doğruluk kanıtının iki önermesini (en seyrek iki karakter kardeş olabilir; sıkıştırma optimalliği korur) açıklamak.',
      ],
      prerequisites: ['Açgözlü seçim ve değiştirme argümanı', 'İkili ağaçlar'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: sık harflere kısa kod',
          label: 'intuition',
          body: `ASCII her karaktere sabit 8 bit verir. Ama bir metinde “a” çok, “z” az geçiyorsa sık karakterlere kısa, seyreklere uzun kodlar vererek ortalama uzunluğu azaltabiliriz (Mors alfabesinde “e” tek bir noktadır).

Sorun: kodları yan yana yazınca nasıl ayıracağız? a → 0, b → 1, c → 01 ise “01” hem “ab” hem “c” olabilir. Çözüm **önek içermeyen** kodlardır: hiçbir kod kelimesi bir diğerinin öneki değildir.`,
        },
        {
          kind: 'formal',
          title: 'Kod ağaçları ve maliyet',
          box: 'formal',
          label: 'formal',
          body: `Önek içermeyen bir kodu ikili bir ağaçla gösterebiliriz: karakterler **yapraklardadır**; sola gitmek 0, sağa gitmek 1’dir; bir karakterin kodu kökten yaprağına giden yoldur. Hiçbir yaprak diğerinin atası olmadığı için kod önek içermez.

$f(c)$, $c$ karakterinin sıklığı ($\\sum f(c) = 1$) ve $d_T(c)$ yaprağın derinliği (kod uzunluğu) ise ortalama bit sayısı:
$$B(T) = \\sum_{c} f(c)\\, d_T(c).$$
$B(T)$’yi en küçük yapan ağaç **optimaldir**. Optimal ağaç **dolu**dur: her iç düğümün iki çocuğu vardır (tek çocuklu bir düğüm silinip kodlar kısaltılabilirdi).`,
        },
        {
          kind: 'pseudocode',
          title: 'Huffman (notlar, Algoritma 2)',
          code: HUFFMAN_CODE,
          body: `David Huffman bu algoritmayı 1951’de MIT’de, final sınavı yerine seçtiği dönem ödevi için buldu. Fikir: alt ağaçları aşağıdan yukarı kurmak; her adımda toplam sıklığı **en küçük iki** ağacı birleştirmek.`,
        },
        {
          kind: 'viz',
          title: 'Huffman görselleştiricisi',
          viz: 'huffman',
          tasks: [
            'Notlardaki sıklıklarla algoritmayı oynatın: ilk birleşen iki karakter hangileri?',
            'Son kodlarda hangi karakter 1 bit, hangileri 4 bit aldı?',
            'Tüm sıklıkları eşit yapın (ör. a:1, b:1, c:1, d:1): ağaç nasıl bir şekil aldı?',
            '**Tahmin modu**nda her adımda birleşecek düğümlerden birini tahmin edin.',
          ],
          body: `Orman, sıklığa göre soldan sağa sıralı çizilir. Sarı düğüm o adımda oluşan yeni iç düğümdür. Sonunda her yaprağın altında kodu görünür.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Notlardaki sıklıklarla (a 45, b 13, c 12, d 16, e 5, f 9; yüzde) Huffman kodunun ortalama uzunluğu kaç bittir?',
              answer: 2.24,
              tolerance: 0.001,
              hint: 'a 1 bit; b, c, d 3 bit; e, f 4 bit.',
              explanation: '$0.45 \\cdot 1 + (0.13 + 0.12 + 0.16) \\cdot 3 + (0.05 + 0.09) \\cdot 4 = 2.24$ bit. Sabit uzunlukta 6 karakter için 3 bit gerekirdi.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Neden optimal? (kanıt taslağı)',
          label: 'proofIdea',
          proof: [
            { title: 'Hipotez', body: '$t$ birleştirmeden sonra elimizdeki alt ağaçları (current) birleştirmenin optimal bir yolu vardır. $t = 0$’da apaçık; sonda tek ağaç kaldığında bu, döndürülen ağacın optimal olduğunu söyler.' },
            { title: 'Önerme 2', body: 'En seyrek iki karakter $x$, $y$ olsun. $x$ ile $y$’nin kardeş yapraklar olduğu bir optimal ağaç vardır. Kanıt: en derindeki kardeş yapraklar $a$, $b$ ile $x$, $y$’nin yerlerini değiştir. $x$ ile $a$’yı değiştirmenin maliyet değişimi $(f(x) - f(a))(d_T(a) - d_T(x)) \\le 0$.' },
            { title: 'Önerme 3', body: 'Bir alt ağacı, sıklığı yapraklarının toplamı olan tek bir “karakter”e sıkıştırmak optimalliği bozmaz: maliyet farkı yalnızca alt ağacın kendi yapısına bağlıdır. Böylece Önerme 2, yeni oluşan iç düğümler için de geçerli olur.' },
            { title: 'Adım', body: 'İki önerme birlikte: en küçük iki ağacı birleştirmek, optimal bir birleştirme yoluyla uyumludur. Ayrıntılı kanıt: CLRS Lemma 16.2 ve 16.3.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Süre',
          body: `$n - 1$ birleştirme; her birinde en küçük iki ağacı bulmak gerekir. Bir öncelik kuyruğuyla (yığın ya da kırmızı-siyah ağaç) her işlem $O(\\log n)$: toplam **$O(n \\log n)$**. Sıklıklar önceden sıralıysa iki kuyrukla $O(n)$’de yapılabilir.`,
        },
        {
          kind: 'text',
          title: 'Pratikte: sıkıştırma',
          body: `- **ZIP / gzip (DEFLATE), PNG, JPEG ve MP3** son adımda Huffman kodlaması (ya da benzeri bir entropi kodlaması) kullanır.
- Huffman, karakter başına tam sayıda bit vermek zorunda olduğu için entropiye tam ulaşamayabilir; **aritmetik kodlama** ve **ANS** (Zstandard, modern görüntü formatları) bu farkı kapatır.
- Bir karakterin sıklığı çok yüksekse (ör. %99) Huffman yine de en az 1 bit harcar; bu yüzden karakterleri gruplamak ya da başka yöntemler kullanmak gerekir.`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Aşağıdaki kodlardan hangisi önek içermez?',
              options: ['a → 0, b → 01, c → 11', 'a → 0, b → 10, c → 11', 'a → 1, b → 10, c → 0', 'a → 00, b → 0, c → 1'],
              answer: 1,
              hint: 'Her kod kelimesinin başka bir kod kelimesinin başlangıcı olup olmadığına bakın.',
              explanation: '0, 10, 11: hiçbiri diğerinin başı değil; bir ağacın yapraklarıdır. Diğerlerinde 0, 01’in; 1, 10’un; 0, 00’ın önekidir.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- En sık iki karakteri birleştirmek: doğru olan en **seyrek** iki ağaçtır (yalnızca karakterler değil, iç düğümler de dahil).
- Yeni iç düğümü unutmak: sonraki adımlarda o da bir aday ağaçtır.
- Kod uzunluklarını sıklıklarla ters orantılı sanmak: ilişki monotondur ama oransal değildir.
- Eşit sıklıklarda tek bir “doğru” ağaç olduğunu sanmak: birden çok optimal ağaç olabilir, maliyetleri aynıdır.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Huffman algoritması her adımda hangi iki ağacı birleştirir?',
          options: ['Sıklığı en büyük iki ağacı', 'Sıklığı en küçük iki ağacı', 'En derin iki ağacı', 'Rastgele iki ağacı'],
          answer: 1,
          hint: 'Seyrek karakterler derinde olmalı.',
          explanation: 'En küçük iki sıklık birleşir; böylece seyrek karakterler ağacın derinine, sık olanlar köke yakın kalır.',
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: 'Sıklıkları a 50, b 25, c 25 (yüzde) olan üç karakter için Huffman kodunun ortalama uzunluğu kaç bittir?',
          answer: 1.5,
          tolerance: 0.001,
          hint: 'b ile c birleşir.',
          explanation: 'a → 1 bit, b ve c → 2 bit: $0.5 \\cdot 1 + 0.5 \\cdot 2 = 1.5$.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Önek içermeyen bir kodun ağacında karakterler nerede bulunur?',
          options: ['Herhangi bir düğümde', 'Yalnızca yapraklarda', 'Yalnızca kökte', 'Yalnızca iç düğümlerde'],
          answer: 1,
          hint: 'Bir karakter başka bir karakterin atası olsaydı?',
          explanation: 'Bir kod bir diğerinin öneki ise ilk karakterin düğümü ikincinin atasıdır. Karakterler yapraklarda olunca bu imkânsızdır.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: '$n$ karakterli bir alfabe için Huffman algoritması (öncelik kuyruğuyla) ne kadar sürer?',
          options: ['$O(n)$', '$O(n \\log n)$', '$O(n^2)$', '$O(2^n)$'],
          answer: 1,
          hint: '$n - 1$ birleştirme, her biri birkaç kuyruk işlemi.',
          explanation: 'Her birleştirmede iki ExtractMin ve bir Insert: $O(\\log n)$. Toplam $O(n \\log n)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: “ABRACADABRA” kelimesindeki harf sıklıklarıyla bir Huffman kodu kurun. Kelime kaç bitle kodlanır? Sabit uzunluklu bir kodla kaç bit gerekirdi?`,
          hints: ['Sayımlar: A 5, B 2, R 2, C 1, D 1.', 'İlk birleştirme C ile D.'],
          solution: `Sayımlar A 5, B 2, R 2, C 1, D 1 (toplam 11). Birleştirmeler: C + D = 2; sonra en küçük iki: B (2) ve R (2) ya da CD (2) — eşitlik var, örneğin B + R = 4; CD (2) + BR (4) = 6; A (5) + 6 = 11. Kodlar: A 1 bit, B/R/C/D 3 bit. Toplam $5 \\cdot 1 + (2 + 2 + 1 + 1) \\cdot 3 = 23$ bit. Görselleştiricide “A:5, B:2, R:2, C:1, D:1” girerek kontrol edin (eşitlikler farklı bozulursa kodlar değişebilir ama toplam yine 23 bittir). Sabit uzunlukta 5 harf için 3 bit: $11 \\cdot 3 = 33$ bit.`,
        },
      ],
      sources: [SRC.l14.notes, SRC.l14.slides, SRC.l14.notebook, SRC.l14.concept],
    },
  ],
}
