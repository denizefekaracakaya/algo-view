import type { Lecture } from './types'
import { SRC } from './sources'
import { HASH_CODE } from '../engines/hashing'

export const lecture8: Lecture = {
  n: 8,
  title: 'Hashing',
  titleEn: 'Hashing',
  date: '2 Şubat 2026',
  blurb: 'Rastgele seçilen bir hash fonksiyonuyla ekleme, arama ve silme beklenen $O(1)$ sürer.',
  lessons: [
    {
      id: 'l8-hashing',
      lecture: 8,
      title: 'Hash tabloları ve evrensel hashing',
      titleEn: 'Hash tables and universal hashing',
      summary: 'Zincirleme, rastgele hash fonksiyonu, evrensel aileler ve doğum günü paradoksu.',
      minutes: 55,
      objectives: [
        'Zincirlemeli bir hash tablosunda insert, lookup ve delete işlemlerinin maliyetini zincir uzunluğuna bağlamak.',
        'Sabit bir hash fonksiyonu için kötü bir anahtar kümesinin her zaman var olduğunu açıklamak.',
        'Rastgele (ya da evrensel) bir hash fonksiyonuyla beklenen zincir uzunluğunun $1 + (n-1)/n \\le 2$ olduğunu göstermek.',
        '$h_{a,b}(x) = ((ax+b) \\bmod p) \\bmod n$ ailesinin neden evrensel olduğunu adım adım izlemek.',
        'Doğum günü paradoksunu kullanarak çakışmasız bir tablonun ne kadar büyük olması gerektiğini hesaplamak.',
      ],
      prerequisites: ['Beklenen değer ve doğrusallık (Ders 5)', 'Mod aritmetiği'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: büyük bir evreni küçük bir tabloya sığdırmak',
          label: 'intuition',
          body: `Öğrenci numarası, kimlik numarası ya da 64 bitlik bir kimlik… Olası anahtarların evreni $U$ devasadır ($|U| = 2^{64}$ olabilir), ama aynı anda yalnızca $n$ kadarını saklarız.

Her anahtar için $|U|$ büyüklüğünde bir dizi açmak (doğrudan adresleme) imkânsız. Bunun yerine bir **hash fonksiyonu** $h: U \\to \\{0, 1, \\dots, n-1\\}$ her anahtarı $n$ **kovadan** birine gönderir. $U$, $n$’den çok büyük olduğu için bazı anahtarlar aynı kovaya düşer (**çakışma**); her kova bu yüzden bir bağlı liste tutar (**zincirleme**).

Hedef: insert, lookup ve delete işlemlerinin her biri **beklenen** $O(1)$ sürsün. BST’lerin aksine anahtarlar sıralı tutulmaz; karşılığında sabit süre kazanırız.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'Notlardaki örnekte $n = 5$ ve $h(x) = (13x + 2) \\bmod 5$. 7 anahtarı hangi kovaya düşer?',
              answer: 3,
              hint: '$13 \\cdot 7 + 2 = 93$.',
              explanation: '$93 \\bmod 5 = 3$. Görselleştiricide 2 ve 7’nin aynı kovada (B3) zincirlendiğini görebilirsiniz.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Zincirleme ve maliyet',
          box: 'formal',
          label: 'formal',
          body: `$h(k)$ hesaplanıp ilgili kovanın listesi taranır: insert (önce var mı diye bakılır), lookup ve delete için süre, **o kovadaki zincirin uzunluğu** ile doğrusaldır.

**Sabit bir $h$ için en kötü durum kötüdür.** $|U| > n(k-1)$ ise güvercin yuvası ilkesine göre bir kovaya en az $k$ anahtar düşer; düşman bu $k$ anahtarı seçerse tüm işlemler $\\Theta(k)$ sürer. Yani sabit bir hash fonksiyonu için en kötü durum garantisi verilemez.

İki çıkış yolu var: (1) **anahtarların** rastgele olduğunu varsaymak ya da (2) **hash fonksiyonunu** rastgele seçmek. Ders ikincisini seçer: anahtarları kim seçerse seçsin, rastgelelik bizim elimizdedir (Ders 5’teki rastgele pivot gibi).`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Neden “anahtarlar rastgeledir” varsayımı yerine “hash fonksiyonu rastgele seçilir” yaklaşımı tercih edilir?',
              options: [
                'Rastgele hash fonksiyonları daha hızlı hesaplanır.',
                'Analiz, tabloya konan anahtar kümesi ne olursa olsun geçerli olur; kötü niyetli girdiye karşı da.',
                'Böylece hiç çakışma olmaz.',
                'Anahtarlar her zaman sıralı gelir.',
              ],
              answer: 1,
              hint: 'Ders 5’te rastgele pivot neden rastgele girdi varsayımından daha iyiydi?',
              explanation: 'Gerçek verinin rastgele olduğunu savunmak zordur. Rastgeleliği algoritmaya koyunca beklenen süre garantisi her girdi için geçerli olur; çakışmalar yine olur ama beklenen sayıları küçüktür.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Hash tablosu görselleştiricisi',
          viz: 'hashTable',
          tasks: [
            'Notlardaki örneği oynatın: hangi kova boş kalıyor, hangisinde iki anahtar zincirleniyor?',
            'Fonksiyonu **x mod n** yapın ve “n’nin katları” hazır girdisini seçin. En uzun zincir kaç oldu?',
            'Aynı girdiyle **evrensel aileden rastgele** bir fonksiyon seçin ve birkaç kez **Yeni a, b çek** deyin. En uzun zincir nasıl değişiyor?',
            '**Tahmin modu**nda her anahtarın kovasını önceden hesaplayın.',
          ],
          body: `Anahtarları ekleyin, sonra birkaç anahtar arayın. Her adımda $h(x)$ hesabı, taranan zincir ve yapılan karşılaştırma sayısı gösterilir. Sabit bir fonksiyon için kötü bir girdi kurmanın ne kadar kolay olduğuna ve rastgele seçilen bir fonksiyonun bunu nasıl dağıttığına dikkat edin.`,
        },
        {
          kind: 'pseudocode',
          title: 'Zincirlemeli tablo işlemleri',
          code: HASH_CODE,
          body: `Silme de aynı şekilde çalışır: kovanın listesinde anahtar bulunup listeden çıkarılır. Tüm işlemler “bir kova + o kovanın zinciri” kadar iş yapar.`,
        },
        {
          kind: 'correctness',
          title: 'Rastgele hash fonksiyonuyla beklenen maliyet',
          label: 'formalProof',
          proof: [
            { title: 'Kurulum', body: 'Tabloda $x_1, \\dots, x_n$ anahtarları var; $x_i$ ile ilgili bir işlem yapıyoruz. $X$: $x_i$’nin kovasındaki anahtar sayısı. Maliyet $O(X)$.' },
            { title: 'Göstergelerle yazmak', body: '$X = \\sum_{j=1}^{n} \\mathbf{1}[h(x_i) = h(x_j)]$. Beklenen değerin doğrusallığı: $E[X] = \\sum_j P[h(x_i) = h(x_j)]$.' },
            { title: 'Tek bir çiftin çakışması', body: '$j = i$ için olasılık 1. $j \\ne i$ için tamamen rastgele bir $h$ altında $P[h(x_i) = h(x_j)] = 1/n$.' },
            { title: 'Sonuç', body: '$E[X] = 1 + (n-1) \\cdot \\frac{1}{n} \\le 2$. Her işlemin beklenen maliyeti sabittir — hangi anahtarlar seçilmiş olursa olsun.' },
            { title: 'Neye ihtiyaç duyduk?', body: 'Analizde yalnızca “farklı iki anahtar $1/n$ olasılıkla çakışır” bilgisini kullandık. Bu, çok daha küçük ve pratik fonksiyon aileleriyle de sağlanabilir: evrensel aileler.' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Tamamen rastgele bir hash fonksiyonunu pratikte kullanmak neden zordur?',
              options: [
                'Her anahtarın kovasını saklamak için $|U| \\log n$ bit gerekir; $|U|$ devasadır.',
                'Rastgele fonksiyonlar çok fazla çakışma üretir.',
                'Rastgele fonksiyonlar deterministik değildir, aynı anahtar farklı kovalara gidebilir.',
                'Hiçbir sorun yoktur, her kütüphane bunu kullanır.',
              ],
              answer: 0,
              hint: 'Fonksiyon bir kez seçilir, sonra hep aynı kalmalıdır. Onu nasıl hatırlarız?',
              explanation: 'Fonksiyon seçildikten sonra sabit kalmalı; tamamen rastgele bir fonksiyonu tanımlamak her $u \\in U$ için bir değer saklamak demektir. Evrensel aile ise yalnızca iki sayı ($a$, $b$) saklar.',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Evrensel hash aileleri (Carter–Wegman, 1978)',
          box: 'formal',
          label: 'formal',
          body: `$U \\to \\{0, \\dots, n-1\\}$ fonksiyonlarından oluşan bir $\\mathcal{F}$ ailesi, her $x_i \\ne x_j$ için, $h$ $\\mathcal{F}$’den rastgele seçildiğinde
$$P[h(x_i) = h(x_j)] \\le \\frac{1}{n}$$
oluyorsa **evrenseldir**. Önceki analiz aynen geçerlidir: beklenen maliyet sabit.

**Bir evrensel aile:** $p \\ge |U|$ bir asal olsun. $a \\in \\{1, \\dots, p-1\\}$, $b \\in \\{0, \\dots, p-1\\}$ için
$$h_{a,b}(x) = ((ax + b) \\bmod p) \\bmod n.$$
Aile $p(p-1)$ fonksiyondan oluşur; birini seçmek yalnızca iki sayı çekmek demektir.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: '$p = 101$ için $h_{a,b}$ ailesinde kaç fonksiyon vardır?',
              answer: 10100,
              hint: '$a$ için $p - 1$, $b$ için $p$ seçenek.',
              explanation: '$100 \\cdot 101 = 10\\,100$. Rastgele bir üye seçmek için yalnızca $a$ ve $b$ çekilir.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Neden evrensel? (Önerme 1–2)',
          label: 'proofIdea',
          proof: [
            { title: 'mod n olmadan', body: '$f_{a,b}(x) = (ax + b) \\bmod p$. Sabit $x_1 \\ne x_2$ ve herhangi $y_1, y_2$ için $f_{a,b}(x_1) = y_1$, $f_{a,b}(x_2) = y_2$ olacak şekilde **tam olarak bir** $(a, b)$ vardır.' },
            { title: 'Tek çözüm', body: 'Denklemleri çıkarınca $a(x_1 - x_2) \\equiv y_1 - y_2 \\pmod p$. $p$ asal ve $x_1 \\ne x_2$ olduğundan $x_1 - x_2$’nin tersi vardır: $a$ tek, sonra $b \\equiv y_1 - a x_1$ tek.' },
            { title: 'a ≠ 0 kısıtı', body: '$a = 0$ yalnızca $y_1 = y_2$ iken çıkar. $a \\ne 0$ alındığından $y_1 \\ne y_2$ olan çiftler ile $(a, b)$ ikilileri birebir eşleşir.' },
            { title: 'Saymak', body: '$h_{a,b}(x_1) = h_{a,b}(x_2)$ olması, $y_1 \\ne y_2$ ama $y_1 \\equiv y_2 \\pmod n$ demektir. $y_1$ için $p$ seçenek, her biri için $y_2$’nin en fazla $(p-1)/n$ seçeneği var: toplam en fazla $p(p-1)/n$ fonksiyon.' },
            { title: 'Sonuç', body: '$P[h(x_1) = h(x_2)] \\le \\dfrac{p(p-1)/n}{p(p-1)} = \\dfrac{1}{n}$. Aile evrenseldir. (Testlerimiz küçük $p$ için tüm $(a, b)$ ikililerini sayarak bunu doğrular.)' },
          ],
        },
        {
          kind: 'viz',
          title: 'Toplar ve kovalar: doğum günü paradoksu',
          viz: 'birthday',
          tasks: [
            '$n = 365$ iken çakışma olasılığının 1/2’yi geçtiği en küçük $m$ değerini bulun.',
            '$n = 1000$ yapın: aynı eşik yaklaşık kaç oldu? $\\sqrt{n}$ ile karşılaştırın.',
            'Simülasyonu birkaç kez yeniden çalıştırın: tam değere ne kadar yakın?',
          ],
          body: `$m$ topu $n$ kovaya rastgele atmak, $m$ anahtarı rastgele bir hash fonksiyonuyla $n$ kovaya göndermekle aynıdır. Grafik, en az bir çakışma olasılığının tam değerini ve notlardaki $1 - e^{-m(m-1)/2n}$ alt sınırını gösterir.`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'Doğum günleri bağımsız ve 365 güne düzgün dağılmışsa, aynı doğum gününü paylaşan bir çiftin olasılığının 1/2’yi aştığı en küçük grup büyüklüğü kaçtır?',
              answer: 23,
              hint: 'Görselleştiricide $n = 365$ seçip $m$’yi kaydırın.',
              explanation: '$m = 23$’te $P[\\text{çakışma yok}] = \\prod_{i<23}(1 - i/365) \\approx 0.493$. Eşik yaklaşık $1.18\\sqrt{n}$’dir.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'Çakışmasız tablo ne kadar büyük olmalı?',
          body: `$m$ anahtarın beklenen çakışan çift sayısı $\\binom{m}{2}\\frac{1}{n} = \\frac{m(m-1)}{2n}$ (doğrusallık). Çakışma olasılığı bu sayıyı geçemez. Öte yandan $1 - x \\le e^{-x}$ ile
$$P[\\text{çakışma yok}] = \\prod_{i=1}^{m-1}\\Big(1 - \\frac{i}{n}\\Big) \\le e^{-m(m-1)/2n}.$$
$m \\approx 1.18\\sqrt{n}$ olunca çakışma olasılığı 1/2’yi geçer.

**Tasarım ilkesi:** hiç çakışma istemiyorsak tablo boyutu anahtar sayısının **karesinden** büyük olmalı — çoğu zaman israf. Bu yüzden pratik tablolar çakışmaya izin verip zincirleme (ya da açık adresleme) kullanır.

**Uygulama:** $m$ kullanıcıya rastgele $b$ bitlik kimlik verirsek çakışma olasılığı en fazla $m^2/2^{b+1}$; bunun $\\le \\varepsilon$ olması için $b \\ge 2\\log_2 m - 1 + \\log_2(1/\\varepsilon)$ yeter.`,
        },
        {
          kind: 'text',
          title: 'Pratikte: hash tabloları her yerde',
          body: `- **Dil yapıları:** Python \`dict\`/\`set\`, Java \`HashMap\`, C++ \`std::unordered_map\` hash tablosudur. Anahtar sayısı tablo boyutunu belli bir **doluluk oranını** (ör. 0.75) aşınca tablo büyütülür ve tüm anahtarlar yeniden dağıtılır; bu pahalı adım seyrek olduğundan ekleme başına ortalama maliyet sabit kalır.
- **Açık adresleme:** zincir yerine çakışan anahtar tablodaki bir sonraki boş yere konur (Python \`dict\` böyle çalışır). Analizi farklıdır ama fikir aynıdır.
- **Hash flooding saldırıları:** sabit ve bilinen bir hash fonksiyonu kullanan web sunucularına, hepsi aynı kovaya düşen binlerce anahtar gönderilerek yavaşlatma saldırısı yapıldı. Çözüm bu dersteki fikir: süreç başında **rastgele bir tohum** seçmek (ör. Python ve Rust SipHash’i rastgele anahtarla kullanır).
- **Aynı fikrin akrabaları:** Bloom filtreleri, tutarlı hashing (dağıtık önbellekler), parmak izleri (dosya tekrarı tespiti).`,
          check: [
            {
              id: 'c6',
              kind: 'mcq',
              prompt: 'Bir sunucu, istekteki parametreleri sabit ve herkesçe bilinen bir hash fonksiyonuyla bir tabloya koyuyor. Saldırgan ne yapabilir?',
              options: [
                'Hiçbir şey; hash tabloları her zaman $O(1)$’dir.',
                'Hepsi aynı kovaya düşen anahtarlar göndererek her işlemi $\\Theta(n)$’ye, toplamı $\\Theta(n^2)$’ye çıkarabilir.',
                'Tabloyu sıralı hale getirebilir.',
                'Yalnızca bellek kullanımını artırabilir.',
              ],
              answer: 1,
              hint: 'Sabit bir $h$ için kötü bir girdi her zaman vardır — ve saldırgan onu bulabilir.',
              explanation: 'Bu gerçek bir saldırı türüdür. Hash fonksiyonunu çalışma başında rastgele seçmek (gizli bir tohumla) saldırganın kötü girdiyi önceden hazırlamasını engeller.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: tablo dolunca ikiye katlamak',
          label: 'formal',
          body: `Beklenen $O(1)$ süre, yük faktörü $\\alpha = m/n$ sabit kaldığı sürece geçerlidir. Kaç anahtar geleceğini bilmiyorsak tabloyu büyütmemiz gerekir: tablo dolunca boyutu **ikiye katlayıp** bütün anahtarları yeni hash fonksiyonuyla yeniden yerleştiririz. Bu pahalı bir adım; toplamda ne kadar tutar?`,
          proof: [
            { title: 'Kural', body: 'Boyutu 1 olan bir tabloyla başla. Dolu bir tabloya ekleme yapılacaksa önce boyutu ikiye katla ve eski anahtarların hepsini yeniden yerleştir.' },
            { title: '16 ekleme', body: 'Büyütmeler 2., 3., 5. ve 9. eklemelerde olur ve sırasıyla 1, 2, 4, 8 anahtar taşınır: toplam $1 + 2 + 4 + 8 = 15$. 16. eklemede tablo (boyut 16) henüz dolu değildir.' },
            { title: 'Genel', body: '$m$ eklemede taşınan anahtar sayısı $1 + 2 + 4 + \\dots < 2m$ olur (geometrik seri). Eklemelerin kendisiyle birlikte toplam iş $O(m)$: ekleme başına **amortize** $O(1)$.' },
            { title: 'Neden ikiye katlamak?', body: 'Boyutu sabit bir miktarla (örneğin +100) artırsaydık büyütmeler çok sık olurdu ve toplam iş $\\Theta(m^2)$’ye çıkardı (aşağıdaki alıştırma). Python’un sözlükleri ve Java’nın HashMap’i de geometrik büyür.' },
          ],
          check: [
            {
              id: 'c7',
              kind: 'numeric',
              prompt: 'Bu kuralla 16 anahtar eklenirken büyütmelerde toplam kaç anahtar yeniden yerleştirilir?',
              answer: 15,
              hint: 'Büyütmeler 1, 2, 4, 8 boyutlu dolu tablolarda olur.',
              explanation: '$1 + 2 + 4 + 8 = 15 < 2 \\cdot 16$: amortize olarak ekleme başına 1’den az taşıma.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- “Hash tabloları en kötü durumda $O(1)$’dir” demek. Garanti **beklenen** değerdir ve rastgelelik hash fonksiyonunun seçimindedir.
- Beklenen değeri **anahtarlar** üzerinden almak. Bu derste anahtarlar sabittir (düşman seçer); rastgele olan $h$’dir.
- Her işlemde yeni bir rastgele $h$ seçmek. $h$ bir kez seçilir; yoksa aynı anahtarı tekrar bulamayız.
- Evrensellik tanımında $x_i = x_j$ çiftini de saymak: tanım yalnızca **farklı** anahtarlar içindir.
- Doğum günü sınırlarını karıştırmak: $m(m-1)/2n$ çakışma olasılığı için bir **üst** sınırdır, $e^{-m(m-1)/2n}$ ise çakışmama olasılığı için bir üst sınırdır.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Evrensel bir aileden rastgele seçilen bir $h$ ile $n$ anahtarlık $n$ kovalı bir tabloda bir lookup’ın beklenen maliyeti nedir?',
          options: ['$O(1)$', '$O(\\log n)$', '$O(\\sqrt n)$', '$O(n)$'],
          answer: 0,
          hint: '$E[X] = 1 + \\sum_{j \\ne i} P[\\text{çakışma}]$.',
          explanation: '$E[X] \\le 1 + (n-1)/n \\le 2$: beklenen sabit maliyet. En kötü durum (şanssız $h$) yine $\\Theta(n)$ olabilir.',
          feedback: { 1: 'Bu dengeli bir BST’nin garantisidir; hash tablosu beklenen olarak daha iyidir.', 3: 'Bu, sabit ve kötü seçilmiş bir fonksiyonun en kötü durumudur.' },
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: '10 anahtar, 100 kovalı bir tabloya rastgele bir hash fonksiyonuyla yerleştiriliyor. Aynı kovaya düşen anahtar **çiftlerinin** beklenen sayısı kaçtır?',
          answer: 0.45,
          tolerance: 0.001,
          hint: '$\\binom{m}{2} \\cdot \\frac{1}{n}$.',
          explanation: '$\\binom{10}{2}/100 = 45/100 = 0.45$. Bu aynı zamanda en az bir çakışma olasılığı için bir üst sınırdır.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Aşağıdakilerden hangisi $h_{a,b}(x) = ((ax+b) \\bmod p) \\bmod n$ ailesinin evrensel olması için **gerekli** değildir?',
          options: ['$p$ asal olmalı', '$a \\ne 0$ olmalı', '$p \\ge |U|$ olmalı', '$n$ asal olmalı'],
          answer: 3,
          hint: 'Kanıtta hangi adımda asallık kullanıldı?',
          explanation: 'Kanıt, $p$’nin asal olmasını ($x_1 - x_2$’nin tersi), $a \\ne 0$’ı ve anahtarların $\\{0, \\dots, p-1\\}$ içinde farklı kalmasını kullanır. Kova sayısı $n$ herhangi bir sayı olabilir.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: '$m = 2^{20}$ kullanıcıya rastgele $b$ bitlik kimlikler verilecek. Çakışma olasılığının en fazla $\\varepsilon = 2^{-10}$ olması için notlardaki sınıra göre en küçük $b$ kaçtır?',
          answer: 49,
          hint: '$b \\ge 2\\log_2 m - 1 + \\log_2(1/\\varepsilon)$.',
          explanation: '$2 \\cdot 20 - 1 + 10 = 49$ bit. (Kontrol: $m^2/2^{b+1} = 2^{40}/2^{50} = 2^{-10}$.)',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: $U = \\{0, \\dots, 99\\}$ ve $n = 10$ kova olsun. **Herhangi** bir sabit $h: U \\to \\{0, \\dots, 9\\}$ için, tüm anahtarları aynı kovaya düşen 10 anahtarlık bir küme bulunduğunu gösterin. $h(x) = x \\bmod 10$ için böyle bir küme yazın.`,
          hints: ['Güvercin yuvası ilkesi: 100 anahtar, 10 kova.', '$x \\bmod 10 = 0$ olan anahtarlar hangileri?'],
          solution: `100 anahtar 10 kovaya dağıtıldığından en kalabalık kovada en az $\\lceil 100/10 \\rceil = 10$ anahtar vardır; bu kovadaki 10 anahtar istenen kümedir. $h(x) = x \\bmod 10$ için $\\{0, 10, 20, \\dots, 90\\}$ hepsi kova 0’a düşer: her işlem 10 karşılaştırmaya kadar çıkar. Görselleştiricideki “n’nin katları” girdisi bunun küçük bir örneğidir.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: $p = 7$, $n = 3$ ve $h_{a,b}(x) = ((ax+b) \\bmod 7) \\bmod 3$. $x_1 = 1$ ve $x_2 = 4$ anahtarları için $a = 1, b = 0$ ve $a = 2, b = 1$ seçimlerinde çakışma olup olmadığını hesaplayın. Ailede toplam kaç fonksiyon var ve sınır en fazla kaç tanesinin bu iki anahtarı çakıştırabileceğini söylüyor?`,
          hints: ['Önce $(ax + b) \\bmod 7$’yi, sonra $\\bmod 3$’ü hesaplayın.', 'Aile büyüklüğü $p(p-1)$, sınır $p(p-1)/n$.'],
          solution: `$a = 1, b = 0$: $1 \\bmod 7 = 1 \\to 1$, $4 \\bmod 7 = 4 \\to 1$: **çakışır**. $a = 2, b = 1$: $3 \\to 0$, $9 \\bmod 7 = 2 \\to 2$: çakışmaz. Ailede $7 \\cdot 6 = 42$ fonksiyon var; en fazla $42/3 = 14$ tanesi bu iki anahtarı çakıştırır, yani çakışma olasılığı $\\le 1/3$.`,
        },
        {
          id: 'p3',
          prompt: `Kendi örneğimiz: boyutu 100 olan bir tabloyla başlıyoruz ve 1000 anahtar ekliyoruz. (a) Tablo dolunca boyutu **100 artırırsak**, (b) **ikiye katlarsak** büyütmelerde toplam kaç anahtar taşınır? 10 000 anahtar için oran nasıl değişir?`,
          hints: ['(a) Büyütmeler 100, 200, …, 900 boyutlu dolu tablolarda olur.', '(b) 100, 200, 400, 800.'],
          solution: `(a) $100 + 200 + \\dots + 900 = 4500$ taşıma. (b) $100 + 200 + 400 + 800 = 1500$ taşıma. 10 000 anahtarda fark büyür: (a) $100 + 200 + \\dots + 9900 = 495\\,000$, yani $\\Theta(m^2)$; (b) $100 + 200 + \\dots + 6400 = 12\\,700$, yani $< 2m$. Sabit artış ekleme başına $\\Theta(m)$ amortize maliyet demektir; geometrik büyüme $O(1)$.`,
        },
      ],
      sources: [SRC.l8.notes, SRC.l8.slides, SRC.l8.pre, SRC.l8.notebook, SRC.l8.concept],
    },
  ],
}
