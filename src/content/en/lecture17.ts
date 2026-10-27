import type { Lecture } from '../types'
import { SRC } from '../sources'
import { GS_CODE } from '../../engines/stableMatching'

export const lecture17: Lecture = {
  n: 17,
  title: 'Stable Matchings and Gale-Shapley',
  titleEn: 'Stable Matchings and Gale-Shapley',
  date: 'March 9, 2026',
  blurb: 'Building, from preference lists, a matching that nobody wants to undo by a side deal.',
  lessons: [
    {
      id: 'l17-stable-matching',
      lecture: 17,
      title: 'Stable matching and the deferred acceptance algorithm',
      titleEn: 'Stable matching and the deferred acceptance algorithm',
      summary: 'Blocking pairs, revocable greedy choices, optimality for doctors and truthfulness.',
      minutes: 50,
      objectives: [
        'Define a stable matching and a blocking pair.',
        'Run the deferred acceptance (Gale–Shapley) algorithm step by step.',
        'Prove that the algorithm stops after at most $n^2$ proposals and returns a stable matching.',
        'Explain why the result is doctor-optimal and why doctors cannot gain by misreporting their preferences.',
      ],
      prerequisites: ['Greedy algorithms (Lecture 14)', 'Proof by contradiction'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: everybody’s wish for a side deal',
          label: 'intuition',
          body: `Every year in the US tens of thousands of new doctors are placed into residency programs (the National Resident Matching Program). Doctors rank hospitals and hospitals rank doctors. Turning the preferences into a single numerical score is hard and invites gaming.

The real risk is this: if a doctor and a hospital want **each other** more than the partners the system gave them, they will bypass the system and make their own deal, and centralized placement collapses. Such a pair is called a **blocking pair**. What we want is a **stable matching**, one with no blocking pair at all.

In this lecture each hospital has exactly one position (with more, just say “hospital position” instead of “hospital”), and there are as many doctors as hospitals.`,
        },
        {
          kind: 'formal',
          title: 'Definition (Lecture 17 notes, Definition 1)',
          box: 'formal',
          label: 'formal',
          body: `A matching between doctors and hospitals is **stable** if for every doctor $i$ and every hospital $j$ one of the following holds:

- $i$ and $j$ are matched to each other; or
- $j$ is matched to a doctor it prefers over $i$; or
- $i$ is matched to a hospital it prefers over $j$.

If none holds, $(i, j)$ is a **blocking pair**: $i$ prefers $j$ to its own hospital and $j$ prefers $i$ to its own doctor.

**Example (the structure of the notes, with our own names):** Ada: Y > X > Z, Bora: X > Y > Z, Can: X > Y > Z; X: Ada > Can > Bora, Y: Can > Ada > Bora, Z: Bora > Can > Ada. (Ada–X, Bora–Z, Can–Y) and (Ada–Y, Bora–Z, Can–X) are stable; (Ada–Z, Bora–X, Can–Y) is not, because Ada and X prefer each other.`,
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'In the example, which pair blocks the matching (Ada–Z, Bora–X, Can–Y)?',
              options: ['(Ada, X)', '(Bora, Z)', '(Can, Y)', '(Bora, X)'],
              answer: 0,
              hint: 'Which hospitals does Ada want more than Z? Do those hospitals prefer Ada to their current doctor?',
              explanation: 'Ada prefers X to Z, and X prefers Ada (its first choice) to Bora. The two would bypass the system.',
            },
          ],
        },
        {
          kind: 'pseudocode',
          title: 'Deferred acceptance (notes, Algorithm 1)',
          code: GS_CODE,
          body: `A greedy strategy: each doctor applies to the hospital she wants most among those that have not rejected her yet. But unlike earlier greedy algorithms, the choices are **revocable**: a hospital accepts a doctor tentatively and drops her if someone it prefers applies. Acceptance becomes final only at the end — hence the name.`,
        },
        {
          kind: 'viz',
          title: 'Deferred acceptance visualizer',
          viz: 'stableMatching',
          tasks: [
            'Play the structure of the notes: how many proposals are made? Who is rejected by which hospital?',
            'Read the number of blocking pairs of the result in the side panel.',
            'In the “Cascading rejections” example, watch one rejection trigger another.',
            'In **prediction mode**, guess for each proposal whether the hospital accepts.',
          ],
          body: `On the left each doctor’s preference list, on the right each hospital’s (most preferred on the left). Yellow: the current proposal; green: a tentative or final match; red and struck through: a rejected application; faded: a hospital already tried.`,
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'With the structure of the notes (the visualizer’s first example), how many proposals does the algorithm make in total?',
              answer: 5,
              hint: 'Bora is rejected twice.',
              explanation: 'Ada→Y (accepted), Bora→X (accepted), Can→X (X prefers Can, Bora becomes free), Bora→Y (rejected), Bora→Z (accepted): 5 proposals. Result Ada–Y, Bora–Z, Can–X.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'It stops and it is stable (Propositions 3–6, Theorem 7)',
          label: 'formalProof',
          proof: [
            { title: 'Hospitals stay full', body: 'Once a hospital holds a doctor it never becomes empty again: it only drops its doctor for a better one. A hospital’s doctor only **improves** over time.' },
            { title: 'Nobody runs out of hospitals', body: 'If a doctor had applied to every hospital and been rejected, every hospital would be holding some other doctor and never become empty again: $n$ hospitals filled by the $n - 1$ doctors other than $d$ — impossible.' },
            { title: 'At most n² proposals', body: 'At each step some doctor’s list pointer moves forward by one; $n$ doctors × at most $n$ hospitals: $O(n^2)$ proposals. At the end no doctor is free: a complete matching.' },
            { title: 'Stability', body: 'Suppose the result had a blocking pair $(i, j)$: $i$ prefers $j$ to her hospital $h$. Doctors go through their lists in order, so $i$ applied to $j$ before $h$ and was rejected at some point — so at that moment $j$ held someone it prefers to $i$. Since $j$’s doctor only improves, at the end $j$ also holds someone better than $i$: $(i, j)$ cannot block. Contradiction.' },
          ],
        },
        {
          kind: 'correctness',
          title: 'Doctor-optimality and truthfulness',
          label: 'proofIdea',
          proof: [
            { title: 'Definition', body: '$h^*(d)$: the best hospital $d$ can get in any stable matching (her “best feasible” hospital). A stable matching giving every doctor $h^*(d)$ is **doctor-optimal**.' },
            { title: 'Theorem 8', body: 'The output of the algorithm is doctor-optimal. Idea: consider the **first** moment some doctor is rejected by her best feasible hospital; that hospital holds another doctor $d\'$. Both cases lead to a contradiction: either no stable matching can pair $h^*$ with $d$, or $d\'$ was rejected by her own best feasible hospital earlier.' },
            { title: 'The mirror image', body: 'The doctor-optimal stable matching is the hospital-worst stable matching. In the example the doctors get (Ada–Y, Bora–Z, Can–X), which differs from the one hospitals would prefer, (Ada–X, Bora–Z, Can–Y).' },
            { title: 'Theorem 9 (truthfulness)', body: 'A doctor **cannot** get a better hospital by misreporting her preferences (proof by Dubins–Freedman, 1981). Hospitals, however, can sometimes gain by misreporting: in Example 10 of the notes, after X changes its list, the only stable matching is the one X prefers.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Running time',
          body: `At most $n^2$ proposals (in fact $n^2 - n + 1$). Each proposal requires the hospital to compare two doctors: $O(1)$ if the rank table $H[h][d]$ is prepared in advance. Total **$O(n^2)$** — the same order as the size of the input ($2n$ lists of length $n$).`,
          check: [
            {
              id: 'c5',
              kind: 'numeric',
              prompt: 'With $n = 3$ doctors and 3 hospitals, at most how many proposals does deferred acceptance make?',
              answer: 7,
              hint: 'When a doctor proposes to its last choice, every other hospital is taken.',
              explanation: 'When a doctor reaches its $n$-th choice, the other $n - 1$ hospitals are taken, so that proposal is accepted and the algorithm stops. Only one doctor makes $n$ proposals, the others at most $n - 1$: $(n - 1)^2 + n = n^2 - n + 1 = 7$. Trying every preference profile shows that this number is reached.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'In practice: matching markets',
          body: `- **Medical residency placement (NRMP):** a similar algorithm has been used since the 1950s; today’s version also handles real-world constraints such as couples applying together.
- **School choice:** in cities such as Boston and New York, students are assigned to schools with deferred acceptance; the truthfulness guarantee for students is a key design argument.
- **Nobel prize:** Lloyd Shapley and Alvin Roth received the 2012 Nobel Prize in Economics for the theory of stable matchings and its use in market design.
- **When there is a common ranking:** if all schools rank applicants by the same score, placing applicants from the highest score down, each into the first free place on their list, gives **the same** stable matching as deferred acceptance. That is the intuition behind placements based on a central exam.`,
          check: [
            {
              id: 'c3',
              kind: 'mcq',
              prompt: 'In the doctor-proposing algorithm, what happens if a doctor lists her true second choice at the top?',
              options: [
                'She always ends up at a better hospital.',
                'She cannot get a better result by her true preferences; it stays the same or gets worse.',
                'The algorithm does not stop.',
                'The matching becomes unstable.',
              ],
              answer: 1,
              hint: 'Theorem 9.',
              explanation: 'For doctors, deferred acceptance is “incentive compatible”: misreporting never helps with respect to the true preferences.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: when everybody agrees',
          label: 'formal',
          body: `Our own example: four doctors (Ada, Bora, Can, Deniz) and four hospitals (W, X, Y, Z). All doctors agree on the ranking W > X > Y > Z, and all hospitals on Deniz > Can > Bora > Ada. What does deferred acceptance do, and how many proposals are made?`,
          proof: [
            { title: 'Deniz', body: 'Deniz proposes to W. For W, Deniz is the best: W accepts and never lets go. 1 proposal.' },
            { title: 'Can', body: 'Can proposes to W; W prefers Deniz and rejects. Can proposes to X and is accepted (nobody better will come to X). 2 proposals.' },
            { title: 'Bora and Ada', body: 'Bora is rejected by W and X and stays at Y: 3 proposals. Ada is rejected by W, X, Y and stays at Z: 4 proposals. $1 + 2 + 3 + 4 = 10$ in total.' },
            { title: 'Does the order of proposals matter?', body: 'No: whoever proposes first, the result (the doctor-optimal matching) is the same. Here it is Deniz–W, Can–X, Bora–Y, Ada–Z, and it is the **only** stable matching: Deniz and W are each other’s first choice, so they are together in every stable matching; the same argument repeats for the rest.' },
          ],
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'How many proposals are made in total in this example?',
              answer: 10,
              hint: 'Deniz 1, Can 2, Bora 3, Ada 4.',
              explanation: '$1 + 2 + 3 + 4 = 10$; with $n$ doctors this pattern gives $\\frac{n(n+1)}{2}$ proposals. The general upper bound is $n^2$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Treating a tentative acceptance as final: a hospital drops its current doctor if someone it prefers applies.
- Defining a blocking pair one-sidedly: **both** must prefer each other to their current partners.
- Believing the stable matching is unique: there can be several; the proposing side gets the best one for itself.
- Confusing “stable” with “everybody gets their first choice”: stability only says that nobody wants a side deal.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'When is a pair $(i, j)$ a blocking pair?',
          options: [
            'If $i$ prefers $j$ to her own hospital',
            'If $j$ prefers $i$ to its own doctor',
            'If both prefer each other to their current partners',
            'If $i$ and $j$ are matched',
          ],
          answer: 2,
          hint: 'Bypassing the system needs both sides to be willing.',
          explanation: 'If only one side is willing, the other refuses; blocking needs mutual preference.',
        },
        {
          id: 'q2',
          kind: 'numeric',
          prompt: 'By the bound in the notes, at most how many proposals does the algorithm make with 10 doctors and 10 hospitals? (Use the bound $n^2$.)',
          answer: 100,
          hint: 'Each doctor applies to each hospital at most once.',
          explanation: '$n \\cdot n = 100$. (The tighter bound is $n^2 - n + 1 = 91$, since some hospital is applied to only once.)',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Which is true of the result of doctor-proposing deferred acceptance?',
          options: [
            'It is the best stable matching for the hospitals.',
            'It is the best stable matching for the doctors.',
            'It is a random stable matching.',
            'It may not be stable.',
          ],
          answer: 1,
          hint: 'Theorem 8.',
          explanation: 'Every doctor gets the best hospital she can get in any stable matching; it is also the worst stable matching for the hospitals.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'In the doctor-proposing algorithm, who **can** gain by misreporting preferences?',
          options: ['Only the doctors', 'Only the hospitals (in some cases)', 'Nobody', 'Everybody, always'],
          answer: 1,
          hint: 'Example 10 of the notes.',
          explanation: 'For doctors the algorithm is incentive compatible; hospitals can sometimes get a better doctor by changing their lists.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: doctors D1: A > B > C, D2: A > C > B, D3: B > A > C; hospitals A: D2 > D3 > D1, B: D1 > D2 > D3, C: D3 > D1 > D2. Run the algorithm, picking free doctors in queue order. Is the result stable?`,
          hints: ['D2 replaces D1 at A.', 'D1 then goes to B and replaces D3 there.'],
          solution: `D1→A (accepted). D2→A: A prefers D2 to D1 → D2 accepted, D1 free. D3→B (accepted). D1→B: B prefers D1 to D3 → D1 accepted, D3 free. D3→A: A prefers D2 to D3 → rejected. D3→C (accepted). Result: A–D2, B–D1, C–D3 (6 proposals). Stable: D3 wants B and A more than C, but B holds D1 and A holds D2, both preferred to D3; D1 wants A, but A prefers D2 to D1; D2 already has her first choice.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: two doctors (Ada, Bora) and two hospitals (X, Y). Ada: X > Y, Bora: Y > X; X: Bora > Ada, Y: Ada > Bora. List all matchings and find which ones are stable. Which one comes out when doctors propose? When hospitals propose?`,
          hints: ['There are only two matchings: (Ada–X, Bora–Y) and (Ada–Y, Bora–X).', 'Look for a blocking pair in each.'],
          solution: `(Ada–X, Bora–Y): every doctor got their first choice, so no doctor wants to switch: stable. (Ada–Y, Bora–X): every hospital got its first choice, so no hospital wants to switch: stable. Both are stable! When doctors propose, the first proposals are accepted: (Ada–X, Bora–Y), the best for the doctors and the worst for the hospitals. When hospitals propose: (Ada–Y, Bora–X). The proposing side wins; this is why the NRMP switched from hospital-proposing to doctor-proposing in the 1990s.`,
        },
      ],
      sources: [SRC.l17.notes, SRC.l17.slides, SRC.l17.concept],
    },
  ],
}
