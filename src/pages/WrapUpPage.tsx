import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { allLessons, findLesson } from '../content/curriculum'
import type { Question } from '../content/types'
import { SRC } from '../content/sources'
import { tx } from '../i18n/lang'
import { useProgress } from '../state/ProgressContext'
import { lessonStatus } from '../state/progress'
import { Inline, Rich } from '../components/Tex'
import { CheckBlock, type CheckResult } from '../components/Quiz'
import { StatusIcon } from './Dashboard'
import { TOOLBOX_LESSONS } from '../content/wrapup'

const toolbox = () => [
  {
    title: tx('Doğru mu, hızlı mı? Analiz araçları', 'Does it work? Is it fast? Analysis tools'),
    idea: tx(
      'Döngü değişmezleri ve tümevarımla doğruluk; en kötü durum analizi, $O$/$\\Omega$/$\\Theta$; özyinelemeler için Master Teoremi, özyineleme ağacı ve yerine koyma.',
      'Correctness by loop invariants and induction; worst-case analysis and $O$/$\\Omega$/$\\Theta$; the Master Theorem, recursion trees and substitution for recurrences.',
    ),
    when: tx('Her yeni algoritmada: önce “doğru mu?”, sonra “ne kadar hızlı?”.', 'For every new algorithm: first “does it work?”, then “how fast is it?”.'),
  },
  {
    title: tx('Böl ve fethet', 'Divide and conquer'),
    idea: tx('Problemi küçük parçalara böl, parçaları özyinelemeyle çöz, sonuçları birleştir.', 'Split the problem into smaller pieces, solve them recursively, combine the results.'),
    when: tx('Problem doğal olarak bağımsız alt problemlere ayrılıyorsa (çarpma, sıralama, seçme).', 'When the problem splits naturally into independent subproblems (multiplication, sorting, selection).'),
  },
  {
    title: tx('Rastgelelik', 'Randomness'),
    idea: tx('Rastgele pivot ya da rastgele hash fonksiyonu: rakip kötü bir girdi seçemez; analizde gösterge değişkenleri ve beklentinin doğrusallığı.', 'A random pivot or a random hash function: the adversary cannot pick a bad input; indicator variables and linearity of expectation in the analysis.'),
    when: tx('Deterministik en kötü durum kötüyse ama “her girdi için beklenen” garanti yetiyorsa.', 'When the deterministic worst case is bad but a guarantee “in expectation, for every input” is enough.'),
  },
  {
    title: tx('Alt sınırlar ve modeli değiştirmek', 'Lower bounds and changing the model'),
    idea: tx('Karşılaştırma tabanlı sıralama $\\Omega(n\\log n)$ ister; anahtarlar küçük tam sayılarsa CountingSort ve RadixSort bu sınırın dışında kalır.', 'Comparison-based sorting needs $\\Omega(n\\log n)$; when keys are small integers, CountingSort and RadixSort step outside that bound.'),
    when: tx('“Daha iyisi var mı?” sorusunu kanıtla kapatmak ya da varsayımları değiştirerek aşmak için.', 'To settle “can we do better?” with a proof, or to get around it by changing the assumptions.'),
  },
  {
    title: tx('Veri yapıları', 'Data structures'),
    idea: tx('İkili arama ağaçları $O(h)$; kırmızı-siyah ağaçlar $h = O(\\log n)$ garantisi; hash tabloları beklenen $O(1)$.', 'Binary search trees in $O(h)$; red-black trees guarantee $h = O(\\log n)$; hash tables give expected $O(1)$.'),
    when: tx('Aynı veri üzerinde çok sayıda ekleme, silme ve arama yapılacaksa; sıra gerekiyorsa ağaç, gerekmiyorsa hash.', 'When many inserts, deletes and searches hit the same data; a tree if order matters, a hash table if it does not.'),
  },
  {
    title: tx('Graflar ve arama', 'Graphs and search'),
    idea: tx('BFS katmanları, DFS zamanları, topolojik sıra, güçlü bağlantılı bileşenler; negatif olmayan ağırlıklarla Dijkstra.', 'BFS layers, DFS times, topological order, strongly connected components; Dijkstra with non-negative weights.'),
    when: tx('Nesneler arasındaki ilişkiler (yollar, bağımlılıklar, ağlar) sorulduğunda.', 'When the question is about relations between objects (routes, dependencies, networks).'),
  },
  {
    title: tx('Dinamik programlama', 'Dynamic programming'),
    idea: tx('Optimal alt yapı + örtüşen alt problemler: alt problemlerin değerlerini bir tabloya yaz, tabloyu doğru sırayla doldur.', 'Optimal substructure + overlapping subproblems: write the subproblem values into a table and fill it in the right order.'),
    when: tx('Özyinelemeli çözüm aynı alt problemleri tekrar tekrar çözüyorsa (Bellman–Ford, Floyd–Warshall, LCS, sırt çantası).', 'When the recursive solution keeps solving the same subproblems (Bellman–Ford, Floyd–Warshall, LCS, knapsack).'),
  },
  {
    title: tx('Açgözlü algoritmalar', 'Greedy algorithms'),
    idea: tx('Her adımda yerel olarak en iyi seçimi yap ve bir değiştirme argümanıyla hiçbir şeyi kaybetmediğini kanıtla.', 'Make the locally best choice at every step and prove with an exchange argument that nothing is lost.'),
    when: tx('Doğru seçim kuralı bir kanıtla desteklenebiliyorsa; yoksa karşı örnek arayın.', 'When the choice rule can be backed by a proof; otherwise look for a counterexample.'),
  },
  {
    title: tx('Akışlar, kesitler ve eşleşmeler', 'Flows, cuts and matchings'),
    idea: tx('Ford–Fulkerson ve artık graf, max-flow min-cut teoremi; Gale–Shapley ile kararlı eşleşme.', 'Ford–Fulkerson and the residual graph, the max-flow min-cut theorem; stable matching with Gale–Shapley.'),
    when: tx('Kapasiteli dağıtım, atama ve iki taraflı eşleştirme problemlerinde.', 'For capacitated routing, assignment and two-sided matching problems.'),
  },
]

const checks = (): Question[][] => [
  [
    {
      id: 'w1',
      kind: 'mcq',
      prompt: tx(
        'Bir yol ağında bazı kenar ağırlıkları negatif (ör. iadeler). Tek bir kaynaktan bütün düğümlere en kısa yolları bulmak **ve** negatif bir döngü varsa bunu fark etmek istiyorsunuz. Araç kutusundan hangisi?',
        'Some edge weights of a road network are negative (refunds, say). You want shortest paths from one source to every node **and** to notice a negative cycle if there is one. Which tool from the toolbox?',
      ),
      options: ['Dijkstra', 'Bellman–Ford', tx('BFS', 'BFS'), 'Kruskal'],
      answer: 1,
      hint: tx('Hangi algoritma negatif kenarlara izin verir ve $n$. turda bir şey kontrol eder?', 'Which algorithm allows negative edges and checks something in round $n$?'),
      explanation: tx(
        'Bellman–Ford negatif kenarlarla çalışır, $O(nm)$ sürer ve $n$. turda hâlâ bir mesafe azalıyorsa negatif bir döngü vardır. Dijkstra negatif kenarlarda yanlış sonuç verebilir; BFS ağırlıkları yok sayar; Kruskal en kısa yol değil, minimum yayılan ağaç bulur.',
        'Bellman–Ford handles negative edges in $O(nm)$ time, and if some distance still drops in round $n$ there is a negative cycle. Dijkstra can be wrong with negative edges; BFS ignores weights; Kruskal finds a minimum spanning tree, not shortest paths.',
      ),
    },
  ],
  [
    {
      id: 'w2',
      kind: 'numeric',
      prompt: tx(
        'Aynı kısıtlarla ($x, y \\ge 0$, $4x + y \\le 2$, $x + 2y \\le 1$) amaç $x + y$ yerine $4x + y$ olsaydı en büyük değer kaç olurdu?',
        'With the same constraints ($x, y \\ge 0$, $4x + y \\le 2$, $x + 2y \\le 1$), what would the maximum be if the objective were $4x + y$ instead of $x + y$?',
      ),
      answer: 2,
      tolerance: 0.001,
      hint: tx('Bölgenin dört köşesini deneyin: $(0, 0)$, $(\\frac12, 0)$, $(\\frac37, \\frac27)$, $(0, \\frac12)$.', 'Try the four corners of the region: $(0, 0)$, $(\\frac12, 0)$, $(\\frac37, \\frac27)$, $(0, \\frac12)$.'),
      explanation: tx(
        'Köşelerde $4x + y$: $0$, $2$, $2$, $\\frac12$. En büyük değer 2’dir ve iki köşe arasındaki kenarın tamamında elde edilir: amaç doğrusu bu kenara paraleldir. Doğrusal bir programın optimumu her zaman bir köşede de bulunur.',
        'At the corners $4x + y$ is $0$, $2$, $2$, $\\frac12$. The maximum is 2, reached along the whole edge between two corners: the objective line is parallel to that edge. The optimum of a linear program is always attained at a corner as well.',
      ),
    },
    {
      id: 'w3',
      kind: 'mcq',
      prompt: tx(
        'İkinci kısıtı 3, birinciyi 1 ile çarpıp topladık ve $7(x + y) \\le 5$ bulduk. Bu tek satır ne kanıtlar?',
        'We added the first constraint once and the second three times and got $7(x + y) \\le 5$. What does this one line prove?',
      ),
      options: [
        tx('Her uygun noktada $x + y \\le \\frac57$; $(\\frac37, \\frac27)$ bu değere ulaştığı için optimum tam $\\frac57$’dir.', 'Every feasible point has $x + y \\le \\frac57$; since $(\\frac37, \\frac27)$ reaches it, the optimum is exactly $\\frac57$.'),
        tx('Yalnızca $(\\frac37, \\frac27)$ noktasının uygun olduğunu.', 'Only that the point $(\\frac37, \\frac27)$ is feasible.'),
        tx('Optimumun en az $\\frac57$ olduğunu.', 'That the optimum is at least $\\frac57$.'),
        tx('Hiçbir şey; yalnızca köşeleri denemek bir kanıttır.', 'Nothing; only trying all corners is a proof.'),
      ],
      answer: 0,
      hint: tx('Pozitif katsayılarla toplanan $\\le$ eşitsizlikleri her uygun noktada geçerlidir.', 'Inequalities of the form $\\le$ added with positive multipliers hold at every feasible point.'),
      explanation: tx(
        'Çarpanlar ($\\frac17$ ve $\\frac37$ ölçeğinde) dual programın bir çözümüdür ve bir **üst sınır sertifikası** verir. Bu sınıra ulaşan bir nokta da bulunca ikisi birlikte optimumu kanıtlar. Max-flow min-cut aynı fikrin bir örneğidir: bir akış ve aynı değerde bir kesit, ikisinin de optimal olduğunu gösterir.',
        'The multipliers (scaled, $\\frac17$ and $\\frac37$) are a solution of the dual program and give an **upper-bound certificate**. Together with a point that reaches the bound, they prove optimality. Max-flow min-cut is an instance of the same idea: a flow and a cut of equal value show that both are optimal.',
      ),
    },
  ],
  [
    {
      id: 'w4',
      kind: 'numeric',
      prompt: tx(
        'Alice mesajını $f(x) = a_0 + a_1 x$ doğrusunun katsayıları olarak kodlayıp $f(0), f(1), f(2), f(3)$ değerlerini gönderiyor. Bob yalnızca $f(1) = 5$ ve $f(3) = 9$ değerlerini alabildi. $a_0$ kaçtır?',
        'Alice encodes her message as the coefficients of the line $f(x) = a_0 + a_1 x$ and sends $f(0), f(1), f(2), f(3)$. Bob only received $f(1) = 5$ and $f(3) = 9$. What is $a_0$?',
      ),
      answer: 3,
      hint: tx('İki nokta bir doğruyu belirler: önce eğimi bulun.', 'Two points determine a line: find the slope first.'),
      explanation: tx(
        'Eğim $a_1 = \\frac{9 - 5}{3 - 1} = 2$, sonra $a_0 = 5 - 2 = 3$: mesaj $(3, 2)$. Derecesi en fazla $k$ olan bir polinomu $k + 1$ nokta belirlediği için Alice fazladan değer göndererek kaybolan değerlere karşı önlem alır. Reed–Solomon kodları bu fikri kullanır.',
        'The slope is $a_1 = \\frac{9 - 5}{3 - 1} = 2$, then $a_0 = 5 - 2 = 3$: the message is $(3, 2)$. Since $k + 1$ points determine a polynomial of degree at most $k$, sending extra values protects Alice against lost ones. Reed–Solomon codes use this idea.',
      ),
    },
  ],
]

function LpFigure() {
  // 1 unit = 400 px; origin at (40, 250).
  const X = (x: number) => 40 + 400 * x
  const Y = (y: number) => 250 - 400 * y
  const pt = (x: number, y: number) => `${X(x)},${Y(y)}`
  return (
    <svg className="wrap-lp" viewBox="0 0 320 280" role="img" aria-labelledby="lp-fig-t">
      <title id="lp-fig-t">
        {tx(
          'Uygun bölge: köşeleri (0, 0), (1/2, 0), (3/7, 2/7) ve (0, 1/2) olan dörtgen. x + y amacı (3/7, 2/7) köşesinde en büyük değeri 5/7’yi alır.',
          'Feasible region: the quadrilateral with corners (0, 0), (1/2, 0), (3/7, 2/7) and (0, 1/2). The objective x + y is largest, 5/7, at the corner (3/7, 2/7).',
        )}
      </title>
      <line x1={X(0)} y1={Y(0)} x2={X(0.66)} y2={Y(0)} stroke="var(--border-strong)" />
      <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(0.6)} stroke="var(--border-strong)" />
      <polygon points={[pt(0, 0), pt(0.5, 0), pt(3 / 7, 2 / 7), pt(0, 0.5)].join(' ')} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
      <line x1={X(0.5)} y1={Y(0)} x2={X(0.35)} y2={Y(0.6)} stroke="var(--series-2)" strokeWidth={1.5} />
      <line x1={X(0)} y1={Y(0.5)} x2={X(0.66)} y2={Y(0.17)} stroke="var(--series-1)" strokeWidth={1.5} />
      <line x1={X(0.1)} y1={Y(5 / 7 - 0.1)} x2={X(0.66)} y2={Y(5 / 7 - 0.66)} stroke="var(--st-sorted)" strokeWidth={1.5} strokeDasharray="5 4" />
      <circle cx={X(3 / 7)} cy={Y(2 / 7)} r={5} fill="var(--st-sorted)" />
      <text x={X(0.38) + 4} y={Y(0.56)} fontSize={12} fill="var(--series-2)">
        4x + y = 2
      </text>
      <text x={X(0.08)} y={Y(0.48)} fontSize={12} fill="var(--series-1)">
        x + 2y = 1
      </text>
      <text x={X(3 / 7) + 9} y={Y(2 / 7) - 8} fontSize={12} fill="var(--text)">
        (3/7, 2/7)
      </text>
      <text x={X(0.5) + 14} y={Y(0.07)} fontSize={12} fill="var(--st-sorted)">
        x + y = 5/7
      </text>
      <text x={X(0.64)} y={Y(0) + 16} fontSize={12} fill="var(--muted)">x</text>
      <text x={X(0) - 14} y={Y(0.58)} fontSize={12} fill="var(--muted)">y</text>
    </svg>
  )
}

export function WrapUpPage() {
  const { progress } = useProgress()
  const lessons = allLessons()
  const done = lessons.filter((l) => lessonStatus(progress, l.id) === 'completed').length
  const open = lessons.filter((l) => lessonStatus(progress, l.id) !== 'completed')
  const groups = checks()
  const total = groups.reduce((s, g) => s + g.length, 0)
  const offsets = groups.map((_, i) => groups.slice(0, i).reduce((s, g) => s + g.length, 0))
  const [results, setResults] = useState<Record<string, CheckResult>>({})
  const onResult = (qid: string, correct: boolean) =>
    setResults((r) => {
      const prev = r[qid]
      if (prev?.correct) return r
      const attempts = (prev?.attempts ?? 0) + 1
      return { ...r, [qid]: { correct, firstTry: correct && attempts === 1, attempts } }
    })
  const block = (i: number) => <CheckBlock lessonId="l18-wrapup" questions={groups[i]} offset={offsets[i]} total={total} results={results} onResult={onResult} />

  return (
    <article className="wrapup stack" style={{ maxWidth: 940 }}>
      <header>
        <p className="lecture-num">{tx('Ders 18 · 11 Mart 2026 · Kapanış', 'Lecture 18 · March 11, 2026 · Wrap-up')}</p>
        <h1>{tx('Sırada ne var?', 'What’s next?')}</h1>
        <p className="lead">
          {tx(
            'Son ders iki şey yapar: 17 dersi tek bir araç kutusunda toplar ve bu araç kutusunun ötesindeki birkaç “inci”yi gösterir. Bu sayfa, slaytlardaki aynı yolu kısaca izler.',
            'The last lecture does two things: it gathers the 17 lectures into one toolbox, and it shows a few “gems” beyond that toolbox. This page briefly follows the same path as the slides.',
          )}
        </p>
      </header>

      <section className="card card-pad" aria-labelledby="wrap-progress-h">
        <h2 id="wrap-progress-h">{tx('Senin yolculuğun', 'Your journey')}</h2>
        <div className="progressbar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={lessons.length} aria-label={tx('Tamamlanan dersler', 'Completed lessons')}>
          <span style={{ width: `${Math.round((done / lessons.length) * 100)}%` }} />
        </div>
        <p className="small" style={{ margin: '8px 0' }}>
          {tx(`${lessons.length} dersin ${done} tanesini tamamladın.`, `You have completed ${done} of ${lessons.length} lessons.`)}
        </p>
        {open.length === 0 ? (
          <p style={{ margin: 0 }}>{tx('Bütün dersleri bitirdin. Tebrikler!', 'You have finished every lesson. Congratulations!')}</p>
        ) : (
          <details>
            <summary>{tx(`Henüz tamamlanmamış ${open.length} ders`, `${open.length} lessons not completed yet`)}</summary>
            <ul className="lesson-links" style={{ marginTop: 8 }}>
              {open.map((l) => (
                <li key={l.id}>
                  <Link to={`/ders/${l.id}`}>
                    <span className="status-dot">
                      <StatusIcon status={lessonStatus(progress, l.id)} />
                    </span>
                    <span className="grow">
                      {tx('Ders', 'Lecture')} {l.lecture} · <Inline src={l.title} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <section aria-labelledby="wrap-toolbox-h">
        <h2 id="wrap-toolbox-h">{tx('17 ders, tek bir araç kutusu', '17 lectures, one toolbox')}</h2>
        <p className="prose" style={{ color: 'var(--text-2)' }}>
          {tx(
            'Her araç için ana fikir ve “ne zaman akla gelmeli?” sorusunun kısa cevabı. Bağlantılar ilgili derslere gider; simgeler ilerlemeni gösterir.',
            'For each tool, the main idea and a short answer to “when should it come to mind?”. The links go to the lessons; the icons show your progress.',
          )}
        </p>
        <div className="wrap-grid">
          {toolbox().map((t, i) => (
            <div key={t.title} className="card card-pad wrap-tool">
              <h3>{t.title}</h3>
              <p className="small" style={{ margin: 0 }}>
                <Inline src={t.idea} />
              </p>
              <p className="small" style={{ margin: 0, color: 'var(--text-2)' }}>
                <strong>{tx('Ne zaman? ', 'When? ')}</strong>
                {t.when}
              </p>
              <ul className="lesson-links">
                {TOOLBOX_LESSONS[i].map((id) => {
                  const l = findLesson(id)!.lesson
                  return (
                    <li key={id}>
                      <Link to={`/ders/${id}`}>
                        <span className="status-dot">
                          <StatusIcon status={lessonStatus(progress, id)} />
                        </span>
                        <span className="grow small">
                          <Inline src={l.title} />
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
        {block(0)}
      </section>

      <section className="card card-pad" aria-labelledby="wrap-lp-h">
        <p className="label-tag">{tx('İnci 1', 'Gem 1')}</p>
        <h2 id="wrap-lp-h">{tx('Doğrusal programlama ve dualite', 'Linear programming and duality')}</h2>
        <div className="wrap-split">
          <Rich
            text={tx(
              `Doğrusal bir program, doğrusal kısıtlar altında doğrusal bir fonksiyonu en büyük (ya da en küçük) yapar. Slaytlardaki örnek:

$$\\max\\; x + y \\quad \\text{öyle ki}\\quad x, y \\ge 0,\\;\\; 4x + y \\le 2,\\;\\; x + 2y \\le 1.$$

Uygun noktalar bir çokgen oluşturur; amaç doğrusunu kendi yönünde kaydırınca son değdiği köşe optimumdur: $(\\frac37, \\frac27)$, değer $\\frac57$.

**Optimum olduğunu nasıl kanıtlarız?** Birinci kısıtı $\\frac17$, ikincisini $\\frac37$ ile çarpıp toplayın: $x + y \\le \\frac27 + \\frac37 = \\frac57$. Bu çarpanları bulmak da bir doğrusal programdır, **dual**: $\\min\\, 2u + v$, $4u + v \\ge 1$, $u + 2v \\ge 1$, $u, v \\ge 0$. İki programın optimal değerleri eşittir.

Bunu zaten gördük: **max-flow min-cut teoremi** bir dualite örneğidir. En büyük akış (primal) ile en küçük kesit kapasitesi (dual) aynı değerdedir.`,
              `A linear program maximizes (or minimizes) a linear function subject to linear constraints. The example from the slides:

$$\\max\\; x + y \\quad \\text{subject to}\\quad x, y \\ge 0,\\;\\; 4x + y \\le 2,\\;\\; x + 2y \\le 1.$$

The feasible points form a polygon; slide the objective line in its direction and the last corner it touches is the optimum: $(\\frac37, \\frac27)$, value $\\frac57$.

**How do we prove it is optimal?** Multiply the first constraint by $\\frac17$, the second by $\\frac37$ and add: $x + y \\le \\frac27 + \\frac37 = \\frac57$. Finding these multipliers is itself a linear program, the **dual**: $\\min\\, 2u + v$, $4u + v \\ge 1$, $u + 2v \\ge 1$, $u, v \\ge 0$. The optimal values of the two programs are equal.

We have already seen this: the **max-flow min-cut theorem** is an instance of duality. The maximum flow (primal) and the minimum cut capacity (dual) have the same value.`,
            )}
          />
          <LpFigure />
        </div>
        {block(1)}
      </section>

      <section className="card card-pad" aria-labelledby="wrap-poly-h">
        <p className="label-tag">{tx('İnci 2', 'Gem 2')}</p>
        <h2 id="wrap-poly-h">{tx('Polinom interpolasyonu ve hata düzeltme', 'Polynomial interpolation and error correction')}</h2>
        <Rich
          text={tx(
            `Derecesi en fazla $k$ olan bir polinomu $k + 1$ farklı noktadaki değerleri tek başına belirler. Alice mesajını bir polinomun katsayıları olarak yazar ve gerekenden **fazla** noktada değerini gönderir. Gürültülü bir kanalda bazı değerler kaybolsa ya da bozulsa bile Bob, kalanlardan hızlı bir interpolasyonla Alice’in ne demek istediğini bulabilir.

Bu bir oyuncak değil: **Reed–Solomon** kodları QR kodlarında, CD ve DVD’lerde ve veri depolama sistemlerinde tam bu fikirle çalışır.`,
            `A polynomial of degree at most $k$ is determined by its values at $k + 1$ distinct points. Alice writes her message as the coefficients of a polynomial and sends its values at **more** points than needed. Even if a noisy channel loses or corrupts some values, Bob can recover what Alice meant from the rest with fast interpolation.

This is not a toy: **Reed–Solomon** codes work exactly this way in QR codes, CDs and DVDs, and storage systems.`,
          )}
        />
        {block(2)}
      </section>

      <section className="card card-pad" aria-labelledby="wrap-ml-h">
        <p className="label-tag">{tx('İnci 3', 'Gem 3')}</p>
        <h2 id="wrap-ml-h">{tx('Algoritma seçimi ve tasarımı için makine öğrenmesi', 'Machine learning for choosing and designing algorithms')}</h2>
        <Rich
          text={tx(
            `Aynı problem için birçok algoritma vardır ve her biri farklı girdilerde hızlıdır (ör. seyrek graflarda bir algoritma, çok üçgen içeren graflarda bir başkası). Bir fikir: girdinin özelliklerini hesapla, hangi algoritmanın en hızlı olacağını bir modelle tahmin et. Spektrum ihaleleri gibi büyük problemlerde bu yaklaşım, makine öğrenmesi kullanmayan en iyi seçimden belirgin biçimde iyi sonuç vermiştir.

Makine öğrenmesi artık algoritmaların kendisini tasarlamakta da kullanılıyor (ör. AlphaEvolve). Ama dersin iki sorusu değişmiyor: **Doğru mu? Hızlı mı?** Biçimsel garantiler hâlâ gerekli.`,
            `There are many algorithms for the same problem, each fast on different inputs (one on sparse graphs, another on graphs with many triangles, say). One idea: compute features of the input and use a model to predict which algorithm will be fastest. On large problems such as spectrum auctions this approach has clearly beaten the best choice made without machine learning.

Machine learning is now also used to design algorithms themselves (AlphaEvolve, for example). But the two questions of this course stay the same: **Does it work? Is it fast?** We still need formal guarantees.`,
          )}
        />
      </section>

      <section className="card card-pad" aria-labelledby="wrap-next-h">
        <h2 id="wrap-next-h">{tx('Buradan nereye?', 'Where to go from here')}</h2>
        <Rich
          text={tx(
            `- **Stanford dersleri:** slaytlar doğrusal programlama için CS168 ve CS261’i, polinomlar ve hata düzelten kodlar için CS168 ve CS250’yi önerir; daha fazlası için Stanford teori grubunun sayfası theory.stanford.edu.
- **Bu dersin doğal devamı olan konular:** NP-tamlık ve P = NP sorusu, yaklaşık algoritmalar, rastgele ve akış (streaming) algoritmaları, çevrimiçi algoritmalar, algoritmik oyun kuramı (kararlı eşleşme buradan bir örnektir).
- **Algo View’da:** Alıştırma laboratuvarında elle iz sürme ve soru üreteciyle tekrar yapın; her dersin sonundaki notlarınız Notlar sayfasında toplanır.`,
            `- **Stanford courses:** the slides suggest CS168 and CS261 for linear programming, and CS168 and CS250 for polynomials and error-correcting codes; for more, see the Stanford theory group at theory.stanford.edu.
- **Topics that naturally follow this course:** NP-completeness and the P vs NP question, approximation algorithms, randomized and streaming algorithms, online algorithms, algorithmic game theory (stable matching is one example).
- **In Algo View:** review with hand tracing and the question generator in the Practice lab; the notes you wrote at the end of each lesson are collected on the Notes page.`,
          )}
        />
        <div className="row">
          <Link className="btn primary" to="/alistirma">
            {tx('Alıştırma laboratuvarı', 'Practice lab')} <ArrowRight size={16} aria-hidden />
          </Link>
          <Link className="btn" to="/notlar">
            {tx('Notlarım', 'My notes')}
          </Link>
        </div>
      </section>

      <section className="card card-pad" aria-labelledby="wrap-src-h">
        <h2 id="wrap-src-h" style={{ fontSize: '1.05rem' }}>
          {tx('Kaynaklar', 'Sources')}
        </h2>
        <ul className="prose small" style={{ margin: 0 }}>
          {[SRC.l18.slides, SRC.pages.lectures].map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {tx(s.label, s.labelEn)} <ExternalLink size={12} aria-hidden />
                <span className="sr-only"> {tx('(yeni sekmede açılır)', '(opens in a new tab)')}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="small muted" style={{ margin: '8px 0 0' }}>
          {tx(
            'Açıklamalar ve sorular özgündür; örnek doğrusal program ve konu sırası Ders 18 slaytlarını izler.',
            'Explanations and questions are original; the example linear program and the order of topics follow the Lecture 18 slides.',
          )}
        </p>
      </section>
    </article>
  )
}
