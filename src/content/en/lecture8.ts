import type { Lecture } from '../types'
import { SRC } from '../sources'
import { HASH_CODE } from '../../engines/hashing'

export const lecture8: Lecture = {
  n: 8,
  title: 'Hashing',
  titleEn: 'Hashing',
  date: 'February 2, 2026',
  blurb: 'With a randomly chosen hash function, insert, lookup and delete take expected $O(1)$ time.',
  lessons: [
    {
      id: 'l8-hashing',
      lecture: 8,
      title: 'Hash tables and universal hashing',
      titleEn: 'Hash tables and universal hashing',
      summary: 'Chaining, a random hash function, universal families and the birthday paradox.',
      minutes: 55,
      objectives: [
        'Relate the cost of insert, lookup and delete in a hash table with chaining to the length of a chain.',
        'Explain why a bad key set always exists for any fixed hash function.',
        'Show that with a random (or universal) hash function the expected chain length is $1 + (n-1)/n \\le 2$.',
        'Follow step by step why the family $h_{a,b}(x) = ((ax+b) \\bmod p) \\bmod n$ is universal.',
        'Use the birthday paradox to compute how large a collision-free table has to be.',
      ],
      prerequisites: ['Expectation and linearity (Lecture 5)', 'Modular arithmetic'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: fitting a huge universe into a small table',
          label: 'intuition',
          body: `Student IDs, national ID numbers, 64-bit identifiers… The universe $U$ of possible keys is enormous ($|U| = 2^{64}$, say), but we only store about $n$ of them at a time.

Allocating an array of size $|U|$ (direct addressing) is impossible. Instead a **hash function** $h: U \\to \\{0, 1, \\dots, n-1\\}$ sends every key to one of $n$ **buckets**. Since $U$ is much larger than $n$, some keys land in the same bucket (a **collision**), so every bucket holds a linked list (**chaining**).

Goal: insert, lookup and delete should each take **expected** $O(1)$ time. Unlike BSTs, keys are not kept in order; in exchange we get constant time.`,
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'In the notes’ example $n = 5$ and $h(x) = (13x + 2) \\bmod 5$. Which bucket does the key 7 land in?',
              answer: 3,
              hint: '$13 \\cdot 7 + 2 = 93$.',
              explanation: '$93 \\bmod 5 = 3$. In the visualizer you can see 2 and 7 chained in the same bucket (B3).',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Chaining and cost',
          box: 'formal',
          label: 'formal',
          body: `Compute $h(k)$ and scan that bucket’s list: insert (which first checks whether the key is present), lookup and delete take time linear in **the length of the chain in that bucket**.

**For a fixed $h$ the worst case is bad.** If $|U| > n(k-1)$, by the pigeonhole principle some bucket receives at least $k$ keys; if an adversary picks those $k$ keys, every operation takes $\\Theta(k)$. So no worst-case guarantee is possible for a fixed hash function.

There are two ways out: (1) assume the **keys** are random, or (2) choose the **hash function** at random. The lecture takes the second: whoever picks the keys, the randomness is in our hands (like the random pivot of Lecture 5).`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Why is “the hash function is chosen at random” preferred over “the keys are random”?',
              options: [
                'Random hash functions are faster to evaluate.',
                'The analysis then holds for whatever set of keys is put in the table, even a malicious one.',
                'Then there are no collisions at all.',
                'Keys always arrive in sorted order.',
              ],
              answer: 1,
              hint: 'Why was a random pivot better than assuming a random input in Lecture 5?',
              explanation: 'It is hard to argue that real data is random. Putting the randomness into the algorithm makes the expected-time guarantee hold for every input; collisions still happen, but their expected number is small.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Hash table visualizer',
          viz: 'hashTable',
          tasks: [
            'Play the notes’ example: which bucket stays empty, and which one chains two keys?',
            'Switch the function to **x mod n** and pick the preset “Multiples of n”. How long is the longest chain?',
            'With the same input choose a **random function from the universal family** and press **Draw new a, b** a few times. How does the longest chain change?',
            'In **prediction mode**, compute each key’s bucket in advance.',
          ],
          body: `Insert keys, then look a few up. Every step shows how $h(x)$ is computed, the chain being scanned and the number of comparisons made. Notice how easy it is to build a bad input for a fixed function, and how a randomly chosen function spreads it out.`,
        },
        {
          kind: 'pseudocode',
          title: 'Operations on a table with chaining',
          code: HASH_CODE,
          body: `Delete works the same way: find the key in the bucket’s list and unlink it. Every operation does “one bucket + that bucket’s chain” worth of work.`,
        },
        {
          kind: 'correctness',
          title: 'Expected cost with a random hash function',
          label: 'formalProof',
          proof: [
            { title: 'Setup', body: 'The table holds keys $x_1, \\dots, x_n$; we perform an operation involving $x_i$. $X$: the number of keys in $x_i$’s bucket. The cost is $O(X)$.' },
            { title: 'Writing it with indicators', body: '$X = \\sum_{j=1}^{n} \\mathbf{1}[h(x_i) = h(x_j)]$. Linearity of expectation: $E[X] = \\sum_j P[h(x_i) = h(x_j)]$.' },
            { title: 'One pair colliding', body: 'For $j = i$ the probability is 1. For $j \\ne i$, under a completely random $h$, $P[h(x_i) = h(x_j)] = 1/n$.' },
            { title: 'Conclusion', body: '$E[X] = 1 + (n-1) \\cdot \\frac{1}{n} \\le 2$. Every operation has constant expected cost — whichever keys were chosen.' },
            { title: 'What did we need?', body: 'The analysis only used “two distinct keys collide with probability $1/n$”. Much smaller, practical families of functions can provide that: universal families.' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'Why is a completely random hash function hard to use in practice?',
              options: [
                'Remembering the bucket of every key needs $|U| \\log n$ bits, and $|U|$ is enormous.',
                'Random functions produce too many collisions.',
                'Random functions are not deterministic, so the same key may go to different buckets.',
                'There is no problem; every library uses one.',
              ],
              answer: 0,
              hint: 'The function is chosen once and must then stay fixed. How do we remember it?',
              explanation: 'Once chosen, the function must stay fixed; describing a completely random function means storing a value for every $u \\in U$. A universal family stores just two numbers ($a$, $b$).',
            },
          ],
        },
        {
          kind: 'formal',
          title: 'Universal hash families (Carter–Wegman, 1978)',
          box: 'formal',
          label: 'formal',
          body: `A family $\\mathcal{F}$ of functions $U \\to \\{0, \\dots, n-1\\}$ is **universal** if for every $x_i \\ne x_j$, when $h$ is chosen from $\\mathcal{F}$ at random,
$$P[h(x_i) = h(x_j)] \\le \\frac{1}{n}.$$
The previous analysis carries over unchanged: the expected cost is constant.

**A universal family:** let $p \\ge |U|$ be a prime. For $a \\in \\{1, \\dots, p-1\\}$, $b \\in \\{0, \\dots, p-1\\}$,
$$h_{a,b}(x) = ((ax + b) \\bmod p) \\bmod n.$$
The family has $p(p-1)$ functions; choosing one just means drawing two numbers.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'How many functions are in the family $h_{a,b}$ for $p = 101$?',
              answer: 10100,
              hint: '$p - 1$ choices for $a$, $p$ for $b$.',
              explanation: '$100 \\cdot 101 = 10\\,100$. A random member is chosen by drawing just $a$ and $b$.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'Why universal? (Propositions 1–2)',
          label: 'proofIdea',
          proof: [
            { title: 'Without mod n', body: '$f_{a,b}(x) = (ax + b) \\bmod p$. For fixed $x_1 \\ne x_2$ and any $y_1, y_2$ there is **exactly one** $(a, b)$ with $f_{a,b}(x_1) = y_1$ and $f_{a,b}(x_2) = y_2$.' },
            { title: 'A unique solution', body: 'Subtracting the equations gives $a(x_1 - x_2) \\equiv y_1 - y_2 \\pmod p$. Since $p$ is prime and $x_1 \\ne x_2$, $x_1 - x_2$ has an inverse: $a$ is unique, and then so is $b \\equiv y_1 - a x_1$.' },
            { title: 'The a ≠ 0 restriction', body: '$a = 0$ only arises when $y_1 = y_2$. With $a \\ne 0$, the pairs with $y_1 \\ne y_2$ correspond one-to-one to the pairs $(a, b)$.' },
            { title: 'Counting', body: '$h_{a,b}(x_1) = h_{a,b}(x_2)$ means $y_1 \\ne y_2$ but $y_1 \\equiv y_2 \\pmod n$. There are $p$ choices of $y_1$ and for each at most $(p-1)/n$ choices of $y_2$: at most $p(p-1)/n$ functions in total.' },
            { title: 'Conclusion', body: '$P[h(x_1) = h(x_2)] \\le \\dfrac{p(p-1)/n}{p(p-1)} = \\dfrac{1}{n}$. The family is universal. (Our tests verify this for small $p$ by counting all pairs $(a, b)$.)' },
          ],
        },
        {
          kind: 'viz',
          title: 'Balls and bins: the birthday paradox',
          viz: 'birthday',
          tasks: [
            'With $n = 365$, find the smallest $m$ for which the collision probability exceeds 1/2.',
            'Switch to $n = 1000$: roughly where is the threshold now? Compare it with $\\sqrt{n}$.',
            'Rerun the simulation a few times: how close is it to the exact value?',
          ],
          body: `Throwing $m$ balls into $n$ bins at random is the same as sending $m$ keys to $n$ buckets with a random hash function. The chart shows the exact probability of at least one collision and the notes’ lower bound $1 - e^{-m(m-1)/2n}$.`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'If birthdays are independent and uniform over 365 days, what is the smallest group size for which the probability that two people share a birthday exceeds 1/2?',
              answer: 23,
              hint: 'Pick $n = 365$ in the visualizer and slide $m$.',
              explanation: 'At $m = 23$, $P[\\text{no collision}] = \\prod_{i<23}(1 - i/365) \\approx 0.493$. The threshold is about $1.18\\sqrt{n}$.',
            },
          ],
        },
        {
          kind: 'complexity',
          title: 'How large must a collision-free table be?',
          body: `The expected number of colliding pairs among $m$ keys is $\\binom{m}{2}\\frac{1}{n} = \\frac{m(m-1)}{2n}$ (linearity). The probability of a collision cannot exceed it. On the other hand, using $1 - x \\le e^{-x}$,
$$P[\\text{no collision}] = \\prod_{i=1}^{m-1}\\Big(1 - \\frac{i}{n}\\Big) \\le e^{-m(m-1)/2n}.$$
Once $m \\approx 1.18\\sqrt{n}$, the collision probability exceeds 1/2.

**Design principle:** if we want no collisions at all, the table must be larger than the **square** of the number of keys — usually wasteful. That is why practical tables allow collisions and use chaining (or open addressing).

**Application:** if $m$ users get random $b$-bit IDs, the collision probability is at most $m^2/2^{b+1}$; for it to be $\\le \\varepsilon$ it suffices that $b \\ge 2\\log_2 m - 1 + \\log_2(1/\\varepsilon)$.`,
        },
        {
          kind: 'text',
          title: 'In practice: hash tables everywhere',
          body: `- **Language built-ins:** Python \`dict\`/\`set\`, Java \`HashMap\` and C++ \`std::unordered_map\` are hash tables. When the number of keys passes a **load factor** (e.g. 0.75) of the table size, the table grows and every key is redistributed; this expensive step is rare, so the average cost per insert stays constant.
- **Open addressing:** instead of a chain, a colliding key goes to the next free slot of the table (this is how Python’s \`dict\` works). The analysis differs but the idea is the same.
- **Hash flooding attacks:** web servers that used a fixed, publicly known hash function were slowed down by requests with thousands of keys that all landed in one bucket. The fix is this lecture’s idea: choose a **random seed** when the process starts (Python and Rust use SipHash with a random key).
- **Relatives of the same idea:** Bloom filters, consistent hashing (distributed caches), fingerprints (detecting duplicate files).`,
          check: [
            {
              id: 'c6',
              kind: 'mcq',
              prompt: 'A server puts request parameters into a table using a fixed, publicly known hash function. What can an attacker do?',
              options: [
                'Nothing; hash tables are always $O(1)$.',
                'Send keys that all land in one bucket, making each operation $\\Theta(n)$ and the total $\\Theta(n^2)$.',
                'Make the table sorted.',
                'Only increase memory usage.',
              ],
              answer: 1,
              hint: 'For a fixed $h$ a bad input always exists — and the attacker can find it.',
              explanation: 'This is a real class of attack. Choosing the hash function at random at start-up (with a secret seed) stops the attacker from preparing the bad input in advance.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: doubling the table when it is full',
          label: 'formal',
          body: `The expected $O(1)$ time holds as long as the load factor $\\alpha = m/n$ stays constant. If we do not know how many keys will arrive, the table has to grow: when it is full we **double** its size and reinsert all keys with a new hash function. That is an expensive step; what does it add up to?`,
          proof: [
            { title: 'The rule', body: 'Start with a table of size 1. Before inserting into a full table, double its size and reinsert all the old keys.' },
            { title: '16 insertions', body: 'Resizes happen at the 2nd, 3rd, 5th and 9th insertions and move 1, 2, 4 and 8 keys: $1 + 2 + 4 + 8 = 15$ in total. At the 16th insertion the table (size 16) is not full yet.' },
            { title: 'In general', body: 'Over $m$ insertions the number of moved keys is $1 + 2 + 4 + \\dots < 2m$ (a geometric series). Together with the insertions themselves the total work is $O(m)$: **amortized** $O(1)$ per insertion.' },
            { title: 'Why doubling?', body: 'Growing by a fixed amount (say +100) would resize far too often and push the total work up to $\\Theta(m^2)$ (see the exercise below). Python dictionaries and Java’s HashMap grow geometrically too.' },
          ],
          check: [
            {
              id: 'c7',
              kind: 'numeric',
              prompt: 'With this rule, how many keys are reinserted during resizes in total while 16 keys are inserted?',
              answer: 15,
              hint: 'Resizes happen on full tables of size 1, 2, 4, 8.',
              explanation: '$1 + 2 + 4 + 8 = 15 < 2 \\cdot 16$: amortized, fewer than one move per insertion.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Saying “hash tables are $O(1)$ in the worst case”. The guarantee is **in expectation**, and the randomness is in the choice of the hash function.
- Taking the expectation over the **keys**. In this lecture the keys are fixed (an adversary picks them); $h$ is what is random.
- Picking a new random $h$ for every operation. $h$ is chosen once; otherwise we could never find a key again.
- Counting the pair $x_i = x_j$ in the definition of universality: the definition is only about **distinct** keys.
- Mixing up the birthday bounds: $m(m-1)/2n$ is an **upper** bound on the probability of a collision, while $e^{-m(m-1)/2n}$ is an upper bound on the probability of no collision.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'With $h$ drawn from a universal family, what is the expected cost of a lookup in a table with $n$ keys and $n$ buckets?',
          options: ['$O(1)$', '$O(\\log n)$', '$O(\\sqrt n)$', '$O(n)$'],
          answer: 0,
          hint: '$E[X] = 1 + \\sum_{j \\ne i} P[\\text{collision}]$.',
          explanation: '$E[X] \\le 1 + (n-1)/n \\le 2$: constant expected cost. The worst case (an unlucky $h$) can still be $\\Theta(n)$.',
          feedback: { 1: 'That is the guarantee of a balanced BST; a hash table does better in expectation.', 3: 'That is the worst case of a fixed, badly chosen function.' },
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: '10 keys are placed into a table with 100 buckets using a random hash function. What is the expected number of **pairs** of keys that land in the same bucket?',
          answer: 0.45,
          tolerance: 0.001,
          hint: '$\\binom{m}{2} \\cdot \\frac{1}{n}$.',
          explanation: '$\\binom{10}{2}/100 = 45/100 = 0.45$. This is also an upper bound on the probability of at least one collision.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Which of the following is **not** needed for the family $h_{a,b}(x) = ((ax+b) \\bmod p) \\bmod n$ to be universal?',
          options: ['$p$ is prime', '$a \\ne 0$', '$p \\ge |U|$', '$n$ is prime'],
          answer: 3,
          hint: 'Where in the proof was primality used?',
          explanation: 'The proof uses that $p$ is prime (the inverse of $x_1 - x_2$), that $a \\ne 0$, and that keys stay distinct within $\\{0, \\dots, p-1\\}$. The number of buckets $n$ can be any number.',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: '$m = 2^{20}$ users get random $b$-bit IDs. Using the bound from the notes, what is the smallest $b$ that makes the collision probability at most $\\varepsilon = 2^{-10}$?',
          answer: 49,
          hint: '$b \\ge 2\\log_2 m - 1 + \\log_2(1/\\varepsilon)$.',
          explanation: '$2 \\cdot 20 - 1 + 10 = 49$ bits. (Check: $m^2/2^{b+1} = 2^{40}/2^{50} = 2^{-10}$.)',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: let $U = \\{0, \\dots, 99\\}$ and $n = 10$ buckets. Show that for **any** fixed $h: U \\to \\{0, \\dots, 9\\}$ there is a set of 10 keys that all land in the same bucket. Write such a set for $h(x) = x \\bmod 10$.`,
          hints: ['Pigeonhole principle: 100 keys, 10 buckets.', 'Which keys have $x \\bmod 10 = 0$?'],
          solution: `100 keys are spread over 10 buckets, so the fullest bucket holds at least $\\lceil 100/10 \\rceil = 10$ keys; those 10 keys are the required set. For $h(x) = x \\bmod 10$, $\\{0, 10, 20, \\dots, 90\\}$ all land in bucket 0: every operation can take up to 10 comparisons. The visualizer’s “Multiples of n” input is a small instance of this.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: $p = 7$, $n = 3$ and $h_{a,b}(x) = ((ax+b) \\bmod 7) \\bmod 3$. For the keys $x_1 = 1$ and $x_2 = 4$, decide whether they collide for $a = 1, b = 0$ and for $a = 2, b = 1$. How many functions are in the family, and at most how many of them can make these two keys collide according to the bound?`,
          hints: ['First compute $(ax + b) \\bmod 7$, then take $\\bmod 3$.', 'The family has $p(p-1)$ members; the bound is $p(p-1)/n$.'],
          solution: `$a = 1, b = 0$: $1 \\bmod 7 = 1 \\to 1$ and $4 \\bmod 7 = 4 \\to 1$: they **collide**. $a = 2, b = 1$: $3 \\to 0$ and $9 \\bmod 7 = 2 \\to 2$: no collision. The family has $7 \\cdot 6 = 42$ functions; at most $42/3 = 14$ of them make these two keys collide, so the collision probability is $\\le 1/3$.`,
        },
        {
          id: 'p3',
          prompt: `Our own example: we start with a table of size 100 and insert 1000 keys. How many keys are moved during resizes in total if, when the table is full, we (a) **add 100** to its size, (b) **double** it? How does the comparison change for 10 000 keys?`,
          hints: ['(a) Resizes happen on full tables of size 100, 200, …, 900.', '(b) 100, 200, 400, 800.'],
          solution: `(a) $100 + 200 + \\dots + 900 = 4500$ moves. (b) $100 + 200 + 400 + 800 = 1500$ moves. With 10 000 keys the gap widens: (a) $100 + 200 + \\dots + 9900 = 495\\,000$, that is $\\Theta(m^2)$; (b) $100 + 200 + \\dots + 6400 = 12\\,700$, that is $< 2m$. Fixed growth means $\\Theta(m)$ amortized cost per insertion; geometric growth gives $O(1)$.`,
        },
      ],
      sources: [SRC.l8.notes, SRC.l8.slides, SRC.l8.pre, SRC.l8.notebook, SRC.l8.concept],
    },
  ],
}
