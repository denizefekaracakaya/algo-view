import type { Lecture } from './types'
import { SRC } from './sources'
import { GS_CODE } from '../engines/stableMatching'

export const lecture17: Lecture = {
  n: 17,
  title: 'Kararlı eşleşmeler ve Gale–Shapley',
  titleEn: 'Stable Matchings and Gale-Shapley',
  date: '9 Mart 2026',
  blurb: 'Tercih listelerinden, kimsenin dışarıda anlaşmak istemeyeceği bir eşleşme kurmak.',
  lessons: [
    {
      id: 'l17-stable-matching',
      lecture: 17,
      title: 'Kararlı eşleşme ve kabulü erteleme algoritması',
      titleEn: 'Stable matching and the deferred acceptance algorithm',
      summary: 'Engelleyen çiftler, geri alınabilir açgözlü seçimler, doktorlar için optimallik ve dürüstlük.',
      minutes: 50,
      objectives: [
        'Kararlı eşleşmeyi ve engelleyen çifti tanımlamak.',
        'Kabulü erteleme (Gale–Shapley) algoritmasını adım adım çalıştırmak.',
        'Algoritmanın en fazla $n^2$ teklifte durduğunu ve kararlı bir eşleşme döndürdüğünü kanıtlamak.',
        'Sonucun doktorlar için optimal olduğunu ve doktorların tercihlerini yanlış bildirerek kazanç sağlayamayacağını açıklamak.',
      ],
      prerequisites: ['Açgözlü algoritmalar (Ders 14)', 'Çelişki ile kanıt'],
      sections: [
        {
          kind: 'intuition',
          title: 'Sezgi: herkesin “dışarıda anlaşma” isteği',
          label: 'intuition',
          body: `ABD’de her yıl on binlerce yeni doktor ihtisas yapacağı hastaneye yerleştirilir (National Resident Matching Program). Doktorlar hastaneleri, hastaneler doktorları sıralar. Tercihleri tek bir sayısal puana çevirmek zor ve oyuna açıktır.

Asıl risk şu: bir doktor ile bir hastane, sistemin verdiği eşlerinden **birbirlerini** daha çok istiyorsa, sistemi atlayıp kendi aralarında anlaşırlar ve merkezi yerleştirme çöker. Böyle bir çifte **engelleyen çift** denir. İstediğimiz, hiç engelleyen çifti olmayan bir **kararlı eşleşmedir**.

Bu derste her hastanenin tek bir kontenjanı olduğunu varsayıyoruz (birden çoksa “hastane” yerine “hastane kontenjanı” demek yeter) ve doktor sayısı hastane sayısına eşit.`,
        },
        {
          kind: 'formal',
          title: 'Tanım (Ders 17 notları, Tanım 1)',
          box: 'formal',
          label: 'formal',
          body: `Doktorlar ile hastaneler arasındaki bir eşleşme, her doktor $i$ ve her hastane $j$ için aşağıdakilerden biri doğruysa **kararlıdır**:

- $i$ ile $j$ birbiriyle eşleşmiş; ya da
- $j$, $i$’den daha çok tercih ettiği bir doktorla eşleşmiş; ya da
- $i$, $j$’den daha çok tercih ettiği bir hastaneyle eşleşmiş.

Hiçbiri doğru değilse $(i, j)$ bir **engelleyen çifttir**: $i$, $j$’yi kendi hastanesine, $j$ de $i$’yi kendi doktoruna tercih eder.

**Örnek (notlardaki yapı, kendi isimlerimizle):** Ada: Y > X > Z, Bora: X > Y > Z, Can: X > Y > Z; X: Ada > Can > Bora, Y: Can > Ada > Bora, Z: Bora > Can > Ada. (Ada–X, Bora–Z, Can–Y) ve (Ada–Y, Bora–Z, Can–X) kararlıdır; (Ada–Z, Bora–X, Can–Y) kararlı değildir, çünkü Ada ile X birbirini tercih eder.`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Örnekte (Ada–Z, Bora–X, Can–Y) eşleşmesinde hangisi bir engelleyen çifttir?',
              options: ['(Ada, X)', '(Bora, Z)', '(Can, Y)', '(Bora, X)'],
              answer: 0,
              hint: 'Ada, Z’den hangi hastaneleri daha çok istiyor? O hastaneler Ada’yı mevcut doktorlarına tercih ediyor mu?',
              explanation: 'Ada, X’i Z’ye tercih eder; X de Ada’yı (ilk tercihi) Bora’ya tercih eder. İkisi sistemi atlayıp anlaşırdı.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'Kabulü erteleme (notlar, Algoritma 1)',
          code: GS_CODE,
          body: `Açgözlü bir strateji: her doktor, henüz kendisini reddetmemiş hastaneler arasında en çok istediğine başvurur. Ama önceki açgözlü algoritmalardan farkı, kararların **geri alınabilir** olmasıdır: bir hastane bir doktoru geçici olarak kabul eder, daha çok istediği biri gelirse onu bırakır. Kesin kabul ancak en sonda olur — adı buradan gelir.`,
        },
        {
          kind: 'viz',
          title: 'Kabulü erteleme görselleştiricisi',
          viz: 'stableMatching',
          tasks: [
            'Notlardaki yapıyı oynatın: kaç teklif yapıldı? Kim, hangi hastane tarafından reddedildi?',
            'Sonuçta engelleyen çift sayısını yan panelden okuyun.',
            '“Zincirleme reddetmeler” örneğinde bir reddedilmenin başka bir reddedilmeyi nasıl tetiklediğini izleyin.',
            '**Tahmin modu**nda her teklifte hastanenin kabul edip etmeyeceğini tahmin edin.',
          ],
          body: `Solda her doktorun, sağda her hastanenin tercih listesi (en çok istenen solda). Sarı: şu anki teklif; yeşil: geçici ya da son eşleşme; kırmızı ve üstü çizili: reddedilen başvuru; soluk: daha önce denenmiş hastane.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'Notlardaki yapıda (görselleştiricinin ilk örneği) algoritma toplam kaç teklif yapar?',
              answer: 5,
              hint: 'Bora iki kez reddedilir.',
              explanation: 'Ada→Y (kabul), Bora→X (kabul), Can→X (X Can’i tercih eder, Bora boşa çıkar), Bora→Y (red), Bora→Z (kabul): 5 teklif. Sonuç Ada–Y, Bora–Z, Can–X.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Durur ve kararlıdır (Önerme 3–6, Teorem 7)',
          label: 'formalProof',
          proof: [
            { title: 'Hastaneler hep doludur', body: 'Bir hastane bir kez bir doktor tuttuğunda bir daha boş kalmaz: yalnızca daha iyi bir doktor için mevcut doktorunu bırakır. Hastanenin doktoru zamanla yalnızca **iyileşir**.' },
            { title: 'Kimse listesini bitirmez', body: 'Bir doktor tüm hastanelere başvurup reddedilseydi, her hastane o sırada başka bir doktor tutuyor ve bir daha boşalmıyor olurdu: $n$ hastane, $d$ dışındaki $n - 1$ doktorla dolu — imkânsız.' },
            { title: 'En fazla n² teklif', body: 'Her adımda bir doktorun liste göstergesi bir ilerler; $n$ doktor × en fazla $n$ hastane: $O(n^2)$ teklif. Sonunda boşta doktor kalmaz: tam bir eşleşme.' },
            { title: 'Kararlılık', body: 'Sonuçta bir $(i, j)$ engelleyen çifti olduğunu varsayalım: $i$, $j$’yi kendi hastanesi $h$’ye tercih ediyor. Doktorlar listelerini sırayla gezdiği için $i$, $h$’den önce $j$’ye başvurmuş ve bir noktada reddedilmiştir — yani $j$ o an $i$’den daha çok istediği birini tutuyordu. $j$’nin doktoru yalnızca iyileştiği için $j$ sonunda da $i$’den daha iyi birindedir: $(i, j)$ engelleyen olamaz. Çelişki.' },
          ],
        },
        {
          kind: 'correctness',
          title: 'Doktorlar için optimallik ve dürüstlük',
          label: 'proofIdea',
          proof: [
            { title: 'Tanım', body: '$h^*(d)$: $d$’nin herhangi bir kararlı eşleşmede alabileceği en iyi hastane (“en iyi olası” hastane). Bir kararlı eşleşme, her doktora $h^*(d)$’yi veriyorsa **doktorlar için optimaldir**.' },
            { title: 'Teorem 8', body: 'Algoritmanın sonucu doktorlar için optimaldir. Fikir: bir doktorun en iyi olası hastanesi tarafından reddedildiği **ilk** anı düşünün; reddeden hastane başka bir $d\'$ doktorunu tutmaktadır. İki durumda da çelişki çıkar: ya $h^*$ ile $d$’yi eşleştiren bir eşleşme kararlı olamaz, ya da $d\'$ daha önce kendi en iyi olası hastanesinden reddedilmiştir.' },
            { title: 'Ayna yüzü', body: 'Doktorlar için en iyi kararlı eşleşme, hastaneler için en kötü kararlı eşleşmedir. Örnekte doktorların aldığı (Ada–Y, Bora–Z, Can–X), hastanelerin tercih edeceği (Ada–X, Bora–Z, Can–Y)’den farklıdır.' },
            { title: 'Teorem 9 (dürüstlük)', body: 'Bir doktor tercihlerini yanlış bildirerek daha iyi bir hastane **alamaz** (kanıt Dubins–Freedman, 1981). Hastaneler ise yanlış bildirerek bazen kazanç sağlayabilir: notlardaki Örnek 10’da X listesini değiştirince tek kararlı eşleşme X’in tercih ettiği olur.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Süre',
          body: `En fazla $n^2$ teklif (aslında $n^2 - n + 1$). Her teklifte hastanenin iki doktoru karşılaştırması gerekir: $H[h][d]$ sıra tablosu önceden hazırlanırsa $O(1)$. Toplam **$O(n^2)$** — girdinin boyutu ($2n$ tane $n$ uzunluklu liste) ile aynı mertebe.`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: '$n = 3$ doktor ve 3 hastane için ertelenmiş kabul algoritması en fazla kaç teklif yapar?',
              answer: 7,
              hint: 'Bir doktor son tercihine teklif ettiğinde diğer bütün hastaneler doludur.',
              explanation: 'Bir doktor $n$. tercihine ulaştığında diğer $n - 1$ hastane doludur ve o teklif kabul edilip algoritma biter. Yani yalnızca bir doktor $n$ teklif yapar, diğerleri en fazla $n - 1$: $(n - 1)^2 + n = n^2 - n + 1 = 7$. Bütün tercih profilleri denenince bu sayıya ulaşıldığı görülür.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'Pratikte: eşleştirme piyasaları',
          body: `- **Tıpta uzmanlık yerleştirmesi (NRMP):** 1950’lerden beri benzer bir algoritma kullanılır; bugünkü sürümü çiftlerin birlikte başvurması gibi gerçek dünya kısıtlarını da ele alır.
- **Okul seçimi:** Boston ve New York gibi şehirlerde öğrencilerin okullara yerleştirilmesi kabulü erteleme ile yapılır; öğrenciler için dürüstlük garantisi önemli bir tasarım gerekçesidir.
- **Nobel:** Lloyd Shapley ve Alvin Roth, kararlı eşleşme teorisi ve pazar tasarımındaki uygulamaları için 2012 Nobel Ekonomi Ödülü’nü aldı.
- **Ortak bir sıralama olduğunda:** tüm okullar adayları aynı puan sıralamasıyla değerlendiriyorsa, en yüksek puanlıdan başlayıp her adayı listesindeki ilk boş yere yerleştirmek, kabulü erteleme ile **aynı** kararlı eşleşmeyi verir. Merkezi sınavla yapılan yerleştirmelerin sezgisi budur.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Doktorların teklif ettiği algoritmada bir doktor, gerçekte ikinci sırada tuttuğu hastaneyi listesinin başına yazarsa ne olur?',
              options: [
                'Her zaman daha iyi bir hastaneye yerleşir.',
                'Gerçek tercihlerine göre daha iyi bir sonuç alamaz; en fazla aynı kalır ya da kötüleşir.',
                'Algoritma durmaz.',
                'Eşleşme kararsız olur.',
              ],
              answer: 1,
              hint: 'Teorem 9.',
              explanation: 'Doktorlar için kabulü erteleme “dürüstlüğe teşvik eder”: yanlış bildirim, gerçek tercihlere göre hiçbir zaman kazanç getirmez.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Çalışılmış örnek: herkes aynı fikirdeyken',
          label: 'formal',
          body: `Kendi örneğimiz: dört doktor (Ada, Bora, Can, Deniz) ve dört hastane (W, X, Y, Z). Bütün doktorlar W > X > Y > Z sıralamasında, bütün hastaneler Deniz > Can > Bora > Ada sıralamasında anlaşıyor. Kabulü erteleme ne yapar ve kaç teklif yapılır?`,
          proof: [
            { title: 'Deniz', body: 'Deniz W’ye teklif eder. W için Deniz en iyisi: kabul eder ve onu bir daha asla bırakmaz. 1 teklif.' },
            { title: 'Can', body: 'Can W’ye teklif eder; W Deniz’i tercih eder, reddeder. Can X’e teklif eder ve kabul edilir (X için artık daha iyisi gelmeyecek). 2 teklif.' },
            { title: 'Bora ve Ada', body: 'Bora W ve X’ten reddedilir, Y’de kalır: 3 teklif. Ada W, X, Y’den reddedilir, Z’de kalır: 4 teklif. Toplam $1 + 2 + 3 + 4 = 10$.' },
            { title: 'Teklif sırası önemli mi?', body: 'Hayır: kim önce teklif ederse etsin sonuç (doktorlar için optimal eşleşme) aynıdır. Burada sonuç Deniz–W, Can–X, Bora–Y, Ada–Z ve bu **tek** kararlı eşleşmedir: Deniz ile W birbirinin ilk tercihi olduğundan her kararlı eşleşmede birliktedir; geri kalanlar için aynı argüman tekrarlanır.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'Bu örnekte toplam kaç teklif yapılır?',
              answer: 10,
              hint: 'Deniz 1, Can 2, Bora 3, Ada 4.',
              explanation: '$1 + 2 + 3 + 4 = 10$; $n$ doktorda bu desen $\\frac{n(n+1)}{2}$ teklif verir. Genel üst sınır $n^2$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Sık yapılan hatalar',
          body: `- Geçici kabulü kesin sanmak: bir hastane, daha çok istediği biri gelirse mevcut doktorunu bırakır.
- Engelleyen çifti tek taraflı tanımlamak: **ikisinin de** birbirini mevcut eşine tercih etmesi gerekir.
- Kararlı eşleşmenin tek olduğunu sanmak: birden çok olabilir; teklif eden taraf kendi açısından en iyisini alır.
- “Kararlı” ile “herkesin en çok istediğini alması”nı karıştırmak: kararlılık yalnızca kimsenin dışarıda anlaşma isteği olmadığını söyler.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Bir $(i, j)$ çifti ne zaman engelleyen çifttir?',
          options: [
            '$i$, $j$’yi kendi hastanesine tercih ediyorsa',
            '$j$, $i$’yi kendi doktoruna tercih ediyorsa',
            'İkisi de birbirini mevcut eşine tercih ediyorsa',
            '$i$ ile $j$ eşleşmişse',
          ],
          answer: 2,
          hint: 'Sistemi atlamak için iki tarafın da istekli olması gerekir.',
          explanation: 'Yalnızca bir taraf istekliyse diğer taraf reddeder; engelleme için karşılıklı tercih gerekir.',
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: 'Notlardaki sınıra göre 10 doktor ve 10 hastaneyle algoritma en fazla kaç teklif yapar? ($n^2$ sınırını kullanın.)',
          answer: 100,
          hint: 'Her doktor her hastaneye en fazla bir kez başvurur.',
          explanation: '$n \\cdot n = 100$. (Daha sıkı sınır $n^2 - n + 1 = 91$’dir, çünkü en az bir hastaneye yalnızca bir kez başvurulur.)',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Doktorların teklif ettiği kabulü erteleme algoritmasının sonucu için hangisi doğrudur?',
          options: [
            'Hastaneler için en iyi kararlı eşleşmedir.',
            'Doktorlar için en iyi kararlı eşleşmedir.',
            'Rastgele bir kararlı eşleşmedir.',
            'Kararlı olmayabilir.',
          ],
          answer: 1,
          hint: 'Teorem 8.',
          explanation: 'Her doktor herhangi bir kararlı eşleşmede alabileceği en iyi hastaneyi alır; bu aynı zamanda hastaneler için en kötü kararlı eşleşmedir.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Doktorların teklif ettiği algoritmada kim tercihlerini yanlış bildirerek kazanç **sağlayabilir**?',
          options: ['Yalnızca doktorlar', 'Yalnızca hastaneler (bazı durumlarda)', 'Hiç kimse', 'Herkes, her zaman'],
          answer: 1,
          hint: 'Notlardaki Örnek 10.',
          explanation: 'Doktorlar için algoritma dürüstlüğe teşvik eder; hastaneler ise listelerini değiştirerek bazen daha iyi bir doktor elde edebilir.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Kendi örneğimiz: doktorlar D1: A > B > C, D2: A > C > B, D3: B > A > C; hastaneler A: D2 > D3 > D1, B: D1 > D2 > D3, C: D3 > D1 > D2. Boşta doktorları sırayla (kuyruk düzeniyle) seçerek algoritmayı çalıştırın. Sonuç kararlı mı?`,
          hints: ['D2, A’da D1’in yerini alır.', 'D1 sonra B’ye gider ve orada D3’ün yerini alır.'],
          solution: `D1→A (kabul). D2→A: A, D2’yi D1’e tercih eder → D2 kabul, D1 boşta. D3→B (kabul). D1→B: B, D1’i D3’e tercih eder → D1 kabul, D3 boşta. D3→A: A, D2’yi D3’e tercih eder → red. D3→C (kabul). Sonuç: A–D2, B–D1, C–D3 (6 teklif). Kararlı: D3, C yerine B ve A’yı ister ama B’de D1, A’da D2 var ve ikisi de D3’ten daha çok tercih ediliyor; D1, A’yı ister ama A, D2’yi D1’e tercih eder; D2 zaten ilk tercihinde.`,
        },
        {
          id: 'p2',
          prompt: `Kendi örneğimiz: iki doktor (Ada, Bora) ve iki hastane (X, Y). Ada: X > Y, Bora: Y > X; X: Bora > Ada, Y: Ada > Bora. Bütün eşleşmeleri listeleyin ve hangilerinin kararlı olduğunu bulun. Doktorlar teklif ederse hangisi çıkar? Hastaneler teklif ederse?`,
          hints: ['Yalnızca iki eşleşme var: (Ada–X, Bora–Y) ve (Ada–Y, Bora–X).', 'Her biri için engelleyen bir çift arayın.'],
          solution: `(Ada–X, Bora–Y): her doktor ilk tercihini aldı, hiçbir doktor değiştirmek istemez: kararlı. (Ada–Y, Bora–X): her hastane ilk tercihini aldı, hiçbir hastane değiştirmek istemez: kararlı. İkisi de kararlıdır! Doktorlar teklif ederse ilk teklifler kabul edilir: (Ada–X, Bora–Y), doktorlar için en iyisi ve hastaneler için en kötüsü. Hastaneler teklif ederse: (Ada–Y, Bora–X). Teklif eden taraf kazanır; bu, NRMP’nin 1990’larda hastane tarafından teklif etmekten doktor tarafına geçmesinin nedenidir.`,
        },
      ],
      sources: [SRC.l17.notes, SRC.l17.slides, SRC.l17.concept],
    },
  ],
}
