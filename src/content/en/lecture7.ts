import type { Lecture } from '../types'
import { SRC } from '../sources'
import { BST_SEARCH_CODE } from '../../engines/bst'

export const lecture7: Lecture = {
  n: 7,
  title: 'Binary Search Trees and Red-Black Trees',
  titleEn: 'Binary Search Trees and Red-Black Trees',
  date: 'January 28, 2026',
  blurb: 'BST operations take O(height); red-black trees bound the height by 2 log(n+1).',
  lessons: [
    {
      id: 'l7-bst',
      lecture: 7,
      title: 'Binary search trees',
      titleEn: 'Binary search trees',
      summary: 'Search, insert, delete — all follow one search path: $O(h)$.',
      minutes: 45,
      objectives: [
        'Define the BST property and check whether a tree is a BST.',
        'Trace search, insert, delete (three cases) and min/max step by step.',
        'Explain why an in-order traversal yields the keys in sorted order.',
        'Show that the cost of the operations depends on the tree height, and that a plain BST can have height $\\Theta(n)$.',
      ],
      prerequisites: ['Recursion', 'QuickSort (the pivot = subtree root analogy)'],
      sections: [
        {
          kind: 'intuition',
          title: 'Intuition: the best of sorted arrays and linked lists',
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'In a **perfectly balanced** BST with 1,000,000 keys, how many nodes does a search look at in the worst case? ($\\lfloor\\log_2 n\\rfloor + 1$)',
              answer: 20,
              hint: '$2^{19} = 524\\,288$, $2^{20} = 1\\,048\\,576$.',
              explanation: 'The height is $\\lfloor\\log_2 10^6\\rfloor = 19$, so at most 20 nodes lie on a path. In a degenerate BST it could be 1,000,000.',
            },
          ],
          label: 'intuition',
          body: `In a sorted array search is $O(\\log n)$ but insert/delete are $O(n)$; in a linked list insert is $O(1)$ but search is $O(n)$. A **balanced** binary search tree does all three in $O(\\log n)$.

Each node in a BST is like a QuickSort pivot for its own subtree: the left subtree is $A_<$, the right subtree is $A_>$.`,
        },
        {
          kind: 'formal',
          title: 'Definition (Lecture 7 notes)',
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'Root 10; the root’s left child is 5, 5’s right child is 12; the root’s right child is 15. Is this a BST?',
              options: ['Yes, every node is in the right order with its children.', 'No: 12 is in 10’s left subtree but larger than 10.', 'No: 15 is larger than 12.', 'Yes, because the in-order traversal is sorted.'],
              answer: 1,
              hint: 'The property must hold for whole subtrees, not just direct children.',
              explanation: '**All** keys in the left subtree must be smaller than 10. The in-order traversal gives 5, 12, 10, 15 — not sorted.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `Each node $x$ has a key $key(x)$, a parent $p(x)$ and children $left(x)$, $right(x)$ (NIL if absent). **BST property:** for every $x$, all keys under $left(x)$ are $< key(x)$ and all keys under $right(x)$ are $> key(x)$. In this lesson keys are distinct.

**Height:** the number of edges on the longest path from the root to a leaf (the definition in the slides).`,
        },
        {
          kind: 'viz',
          title: 'BST visualizer',
          tasks: [
            'In the pre-lecture tree, **Search** for 4.5: at which node does the search stop? What would that node be if 4.5 were inserted?',
            'Set the insertion order to “Sorted (degenerate)”: what is the height? Build the same keys with “Balanced order” and compare.',
            '**Delete** 3 from the pre-lecture tree: which case applies, and who is the successor?',
            'Turn on **prediction mode** and predict the search direction at every comparison.',
          ],
          viz: 'bst',
          body: `Enter an insertion order (the tree is built from scratch, step by step) or run an operation on the prepared tree. Search for a fractional key (e.g. 4.5) to see where the search stops. Note what tree the “Sorted” insertion order produces, and its height. In prediction mode, guess the direction at every comparison.`,
        },
        {
          kind: 'pseudocode',
          title: 'search (Algorithm 4 in the notes)',
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'In the pre-lecture tree (root 5; 3 and 9; 1, 4, 6), how many nodes does search look at when searching for 7?',
              answer: 3,
              hint: '5 → 9 → 6, then 6’s right is NIL.',
              explanation: 'It looks at 5, 9 and 6; since 6’s right child is NIL, search returns 6 — the node that would be 7’s parent if it were inserted.',
            },
          ],
          code: BST_SEARCH_CODE,
          body: `If the key is not in the tree, this search returns the node that **would be its parent if it were inserted** (Claim 7). insert uses this; delete first finds the node with search.`,
        },
        {
          kind: 'steps',
          title: 'Deletion: three cases',
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Why does the successor used when deleting a node with two children **have no left child**?',
              options: [
                'The successor is always a leaf.',
                'The successor is the smallest key in the right subtree; if it had a left child, that child would be smaller.',
                'The deleted node’s left child takes the successor’s place.',
                'No node in a BST has a left child.',
              ],
              answer: 1,
              hint: 'To find the minimum of the right subtree you keep going left.',
              explanation: 'The minimum is reached by going left until we cannot; so the successor has at most one (right) child and is easy to unlink.',
            },
          ],
          body: `1. **No children:** remove the node (the parent’s pointer becomes NIL).
2. **One child:** promote the child into the node’s place.
3. **Two children:** find the successor $z$ — the smallest key of the right subtree, which has no left child. Link $z$’s right child into $z$’s place, then put $z$ in place of the deleted node. (Symmetrically, the predecessor can be used.)

Deleting 3 in the pre-lecture tree is the two-children case: the successor 4 takes 3’s place.`,
        },
        {
          kind: 'complexity',
          title: 'Running time: everything depends on the height',
          body: `search looks at at most $h + 1$ nodes: $O(h)$. insert and delete call search a constant number of times and do $O(1)$ extra work: $O(h)$.

- In the best case (a perfectly balanced tree) $h = \\lfloor\\log_2 n\\rfloor$ → $O(\\log n)$.
- In the worst case (e.g. inserting $1, 2, \\dots, n$ in order) the tree becomes a chain: $h = n - 1$ → $\\Theta(n)$.

So a plain BST has **no $O(\\log n)$ guarantee**. Logarithmic height requires rebalancing the tree (AVL, red-black, splay…).`,
        },
        {
          kind: 'text',
          title: 'In practice: where trees are used',
          body: `- **Ordered dictionaries:** Java \`TreeMap\` and C++ \`std::map\` / \`std::set\` are balanced BSTs (mostly red-black). Unlike hash tables, they keep the keys **in order**.
- **Range queries:** “all keys between $a$ and $b$” is answered in $O(h + k)$ by searching for $a$ and then walking in order ($k$: the number of keys returned). Think of records in a date range or products in a price range.
- **Databases and file systems:** on disk they use **B-trees**, where each node holds hundreds of keys; the tree becomes very shallow and few disk reads are needed.
- **Other balanced trees:** AVL (stricter balance), treaps (random priorities), splay trees (frequently accessed keys near the root).`,
          check: [
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'In a balanced BST with $n$ keys, how long does “list all keys in $[a, b]$” take if it returns $k$ keys?',
              options: ['Always $O(n)$', '$O(\\log n + k)$', '$O(k\\log n)$', '$O(\\log n)$'],
              answer: 1,
              hint: 'Go down to $a$ first, then walk in order.',
              explanation: 'Finding $a$’s position is $O(\\log n)$; from there the in-order walk does amortized $O(1)$ work per key returned: $O(\\log n + k)$.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: the insertion order decides the shape',
          label: 'formal',
          body: `Let us insert the same seven keys (1…7) into an empty BST in two different orders. Inserting a key compares it once with every node on the path from the root to its place, so the number of comparisons for a key is its **depth**.`,
          proof: [
            { title: 'Sorted insertion: 1, 2, …, 7', body: 'Every new key is larger than all earlier ones and always goes right: the tree is a chain of height $6 = n - 1$. The depths are $0, 1, \\dots, 6$; total comparisons $0 + 1 + \\dots + 6 = 21$.' },
            { title: 'Balanced insertion: 4, 2, 6, 1, 3, 5, 7', body: 'First the median, then the medians of the two halves: a perfect tree of height 2. Depths: one 0, two 1s, four 2s; total $0 + 2 + 8 = 10$.' },
            { title: 'The general picture', body: 'Sorted insertion costs $\\frac{n(n-1)}{2} = \\Theta(n^2)$ in total; balanced insertion costs $O(\\log n)$ per key, $\\Theta(n \\log n)$ in total. Same keys, but the shape of the tree depends entirely on the order.' },
            { title: 'The lesson', body: 'In practice data often arrives (nearly) sorted: records by timestamp, ids in increasing order. That is exactly why we need self-balancing trees (red-black trees, the next lesson).' },
          ],
          check: [
            {
              id: 'c6',
              kind: 'numeric',
              prompt: 'How many key comparisons are made in total when 1, 2, …, 7 are inserted in this order into an empty BST?',
              answer: 21,
              hint: 'Each key makes as many comparisons as its depth.',
              explanation: 'In the chain the depths are $0, 1, \\dots, 6$: $21$ in total. The balanced order needs only $10$.',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Checking the BST property only for direct children: “3’s right child is 7, 7’s left child is 2” looks fine locally, but it is not a BST because 2 < 3 (Example 5 in the notes).
- Saying “BST operations are $O(\\log n)$”: only for balanced trees.
- Forgetting that in a two-children deletion the successor may also have a right child.
- Thinking the node returned by search is “the closest value” (Remark 8).`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'For two different BSTs containing the same set of keys, which is always the same?',
          options: ['Their pre-order traversals', 'Their in-order traversals', 'Their post-order traversals', 'Their root nodes'],
          answer: 1,
          hint: 'Which traversal yields the keys in sorted order?',
          explanation: 'An in-order traversal yields the keys in increasing order in every BST; the others depend on the shape of the tree.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'If $A$ is the root, $B$ its left child and $C$ the right child of $B$, which is true?',
          options: ['$B < A < C$', '$B < C < A$', '$C < B < A$', '$C < A < B$'],
          answer: 1,
          hint: '$C$ is in $A$’s left subtree but in $B$’s right subtree.',
          explanation: '$C$ is in the left subtree → $C < A$; it is to the right of $B$ → $C > B$. The “subtree property” from the notes.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'If 7 is inserted into the pre-lecture tree (root 5; 3 and 9; 1, 4, 6), where does 7 go?',
          options: ['Right child of 5', 'Left child of 9', 'Right child of 6', 'Right child of 4'],
          answer: 2,
          hint: 'Follow the path 5 → 9 → 6.',
          explanation: '7 > 5 → right (9); 7 < 9 → left (6); 7 > 6 → 6’s right is NIL: 7 is inserted there.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Which is true of the height of a BST with $n$ nodes (no balancing assumption)?',
          options: ['$O(\\log n)$', '$\\Omega(\\log n)$ and $O(n)$', '$\\Theta(\\log n)$', '$\\Theta(n)$'],
          answer: 1,
          hint: 'Think of the most balanced and the most unbalanced tree.',
          explanation: 'Every binary tree has $h \\ge \\lfloor\\log_2 n\\rfloor$; a chain has $h = n - 1$. So in general $\\Omega(\\log n)$ and $O(n)$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: insert the keys $\\{1, 2, \\dots, 7\\}$ in an order that makes the height of the BST 2. Think about how many different orders give this tree (you don’t need to compute the answer).`,
          hints: ['Which key must be the root?', 'The same idea in every subtree.'],
          solution: `For example $4, 2, 6, 1, 3, 5, 7$: root 4, second level 2 and 6, leaves 1, 3, 5, 7 → height 2. Each node must be inserted before all nodes in its subtree; every order satisfying this constraint gives the same tree (e.g. $4, 6, 2, 7, 5, 3, 1$ also works). Try the “Balanced order” example in the visualizer.`,
        },
        {
          id: 'p2',
          prompt: `Our own example: the keys 1, 2, 3 have $3! = 6$ insertion orders. Insert them into an empty BST in each order. How many different tree shapes appear? How many orders give a tree of height 1 (balanced)?`,
          hints: ['Which key ends up at the root? The first one inserted.', 'If the root is 2, the tree is already balanced.'],
          solution: `The root is the first key inserted. If the root is 2 (orders 2,1,3 and 2,3,1) both orders give the same balanced tree of height 1. If the root is 1, the remaining 2 and 3 form a chain in the right subtree, with two different shapes (1,2,3 and 1,3,2); the same holds for root 3 (3,2,1 and 3,1,2). In total $1 + 2 + 2 = 5$ different BST shapes (the 3rd Catalan number), and only **2** of the 6 orders are balanced. A random order is not always balanced, but as in Lecture 5 the expected depth is $O(\\log n)$.`,
        },
      ],
      sources: [SRC.l7.pre, SRC.l7.notes, SRC.l7.slides, SRC.l7.concept, SRC.sec.s4],
    },
    {
      id: 'l7-redblack',
      lecture: 7,
      title: 'Red-black trees',
      titleEn: 'Red-black trees',
      summary: 'Five properties, rotations and recoloring: height $\\le 2\\log_2(n+1)$.',
      minutes: 55,
      objectives: [
        'State the five red-black properties and find violations in a tree.',
        'See that a rotation is an $O(1)$ local operation that preserves the BST property.',
        'Recognize Cases 1, 2, 3 during insertion and explain which property each case repairs and how.',
        'Prove the bound $h \\le 2\\log_2(n+1)$ with the black-height argument and connect it to $O(\\log n)$ operation time.',
        'Recognize the “extra black” idea of deletion and its four fix-up cases.',
      ],
      prerequisites: ['Binary search trees', 'Induction'],
      sections: [
        {
          kind: 'formal',
          title: 'Definition (Lecture 7 notes, Definition 10)',
          check: [
            {
              id: 'c1',
              kind: 'mcq',
              prompt: 'Which property makes sure that **at most half** of the nodes on a root-to-NIL path can be red?',
              options: ['Property 2 (the root is black)', 'Property 3 (NILs are black)', 'Property 4 (children of red are black)', 'Property 5 (equal black counts)'],
              answer: 2,
              hint: 'Can two reds be adjacent?',
              explanation: 'Because of property 4, reds cannot be adjacent; every red is followed by a black. Combined with property 5, path lengths differ by at most a factor of 2.',
            },
          ],
          box: 'formal',
          label: 'formal',
          body: `A red-black tree is a BST satisfying the following properties (the children of leaves are taken to be NIL):

1. Every node is red or black.
2. The root is black.
3. NILs are black.
4. The children of a red node are black.
5. For every node $x$, **all** paths from $x$ to a NIL contain the same number of black nodes.

Intuition (Remark 15): red nodes mark the places where a path “starts to get longer”; property 4 limits this.`,
        },
        {
          kind: 'viz',
          title: 'Invariant checker: change the colors yourself',
          tasks: [
            'Make the root red: which property breaks?',
            'Flip a leaf from black to red or the other way around: which property, and why?',
            'Can you find a color change that keeps the tree valid? (Hint: try flipping a black node and its two red children together.)',
          ],
          viz: 'rbPlayground',
          body: `Click nodes to change their colors and see which property breaks. Make the root red; make a leaf black; make a red node’s child red. Every violation is marked with “!”.`,
        },
        {
          kind: 'formal',
          title: 'Rotation',
          box: 'info',
          body: `Let $y$ be the left child of $x$; $y$’s subtrees are $\\alpha$ (left) and $\\beta$ (right), and $x$’s right subtree is $\\gamma$. A **right rotation at $x$** lifts $y$ to the root of the subtree; $x$ becomes $y$’s right child and $\\beta$ moves to $x$’s left child. The order $\\alpha < y < \\beta < x < \\gamma$ does not change: **the BST property is preserved**. Only a few pointers change: $O(1)$. A left rotation is the inverse.`,
        },
        {
          kind: 'viz',
          title: 'Watch a rotation',
          viz: 'rotation',
          body: `Press the button to rotate right at $x$, and undo it. $\\alpha$, $\\beta$, $\\gamma$ are subtrees; only $\\beta$’s parent changes. Notice that the in-order sequence stays the same.`,
          tasks: ['Count the distances from the root to $\\alpha$ and to $\\gamma$ before and after the rotation. Which side went up, which went down?', 'Check which three links changed using the list in the side panel.'],
          check: [
            {
              id: 'c2',
              kind: 'numeric',
              prompt: 'How many **child pointers** change in one rotation (including the pointer in the parent above that points to the subtree root)?',
              answer: 3,
              hint: 'One child of $x$, one child of $y$, and one child of the parent above.',
              explanation: 'left($x$): $y \\to \\beta$, right($y$): $\\beta \\to x$, and the pointer above: $x \\to y$. A constant number of changes: $O(1)$.',
            },
          ],
        },
        {
          kind: 'viz',
          title: 'Insertion visualizer',
          tasks: [
            'Play the “Sorted 1…10” input to the end: how many rotations were made, and what is the final height? What would the height be in a plain BST?',
            'In the “Case 3 triangle” example, follow the two rotations — first at $p$, then at $g$ — step by step.',
            'In **prediction mode**, predict which case applies before each fix-up step.',
            'In the “Case 2 chain” example, watch the violation move upward.',
            'Once the tree is built, delete a key with **delete_rb**: if the removed position was black, which case(s) applied? What happens when you delete a red leaf?',
          ],
          viz: 'rb',
          body: `Build the tree from an order or insert and delete keys one at a time. At each step x, p (parent), u (uncle) and g (grandparent) are labelled, and the checker on the right shows which properties the current tree satisfies — you can see the temporary violations during the fix-up. In prediction mode, guess which case applies before each one. Try the input “Sorted 1…10”.`,
        },
        {
          kind: 'steps',
          title: 'Insertion: the cases (notes, Algorithms 7–8)',
          body: `The new node $x$ is inserted as in a BST and colored **red**. Property 5 is not broken (the number of blacks didn’t change); only 4 (red-red) can be.

- **Case 1 — $p$ is black:** no problem, done.
- **Case 2 — $p$ red, uncle $u$ red:** color $p$ and $u$ black and $g$ red. Every path has one red→black and one black→red change, so black counts are preserved. If $g$’s parent is red the problem moves up: continue at $g$.
- **Case 3 — $p$ red, $u$ black (may be NIL):** if $x$ is an “inner” grandchild of $g$ (a triangle), first rotate at $p$ to turn it into the “outer” shape (a straight line). Then color $p$ black and $g$ red, and rotate at $g$. Done.
- If the fix-up reaches the root and the root is red, the root is colored black (property 2).

The notes show the case where $x$ is a left child and $u$ a right child in detail; the other cases are symmetric (CLRS 13.3).`,
        },
        {
          kind: 'steps',
          title: 'Deletion: the extra black and four cases',
          label: 'formal',
          body: `Lecture 7 does not cover deletion in detail; the **delete_rb** in the visualizer follows the common version in CLRS 13.4. The idea mirrors insertion: an ordinary BST delete first, then a **local repair**.

1. **BST delete:** if $z$ has at most one child it is removed directly; if it has two, its successor $y$ takes $z$’s place (and color). The position that actually leaves the tree is $y$’s old one.
2. **If that position was red,** no path changes its black count: done.
3. **If it was black,** paths through it lose one black (property 5 breaks). The $x$ that took its place (possibly NIL) is given an **extra black**. If $x$ is red it is colored black and we are done. Otherwise look at $x$’s sibling $w$:

- **Case 1 — $w$ red:** color $w$ black and the parent $p$ red, rotate at $p$ toward $x$. The new sibling of $x$ is black; continue with 2, 3 or 4.
- **Case 2 — $w$ black, both children black:** color $w$ red; now both sides of $p$ are one black short, so the extra black moves up to $p$. If $p$ is red, color it black and stop.
- **Case 3 — $w$ black, near child red, far child black:** color the near child black and $w$ red, rotate at $w$ away from $x$. This turns into case 4.
- **Case 4 — $w$ black, far child red:** $w$ takes $p$’s color; $p$ and the far child become black; rotate at $p$ toward $x$. The extra black disappears: done.

Only case 2 moves upward; cases 1, 3 and 4 finish with at most 3 rotations. Total work $O(h) = O(\\log n)$.`,
          check: [
            {
              id: 'c7',
              kind: 'mcq',
              prompt: 'What has to be done when a **red leaf** is deleted from a red-black tree?',
              options: ['Start with case 1.', 'Nothing: no path changes its black count and no red-red pair appears.', 'Color the root red.', 'Rotate at the parent.'],
              answer: 1,
              hint: 'Which properties can the deleted node affect? Red nodes do not count toward black counts.',
              explanation: 'A red node contributes to no path’s black count, and removing it cannot put two reds next to each other; all five properties still hold.',
            },
          ],
        },
        {
          kind: 'correctness',
          title: 'The height guarantee (Claim 16)',
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'If the black height of the root is $b(r) = 4$, at least how many (non-NIL) nodes does the tree have?',
              answer: 15,
              hint: 'Lemma: at least $2^{b(x)} - 1$.',
              explanation: '$2^4 - 1 = 15$: a perfectly balanced, all-black tree with 4 levels reaches this bound.',
            },
          ],
          label: 'formalProof',
          proof: [
            { title: 'Black height', body: '$b(x)$: the number of black nodes on any path from $x$ to a NIL, excluding $x$ (including the NIL). Well defined thanks to property 5.' },
            { title: 'Lemma', body: 'The subtree of $x$ has at least $2^{b(x)} - 1$ non-NIL nodes. Base: for NIL $b = 0$, $2^0 - 1 = 0$ ✓.' },
            { title: 'Inductive step', body: 'Each child has black height at least $b(x) - 1$. $d(x) = 1 + d(left) + d(right) \\ge 1 + 2(2^{b(x)-1} - 1) = 2^{b(x)} - 1$.' },
            { title: 'Reds are limited', body: 'Property 4: two reds cannot be adjacent on a path, so on every root-to-NIL path at least half the nodes are black: $b(r) \\ge h/2$.' },
            { title: 'Conclusion', body: '$n \\ge 2^{b(r)} - 1 \\ge 2^{h/2} - 1$ ⇒ $h \\le 2\\log_2(n+1)$. The insertion fix-up makes at most $O(h)$ steps upward and each is $O(1)$: search, insert (and, per the notes, delete) are $O(\\log n)$.' },
          ],
        },
        {
          kind: 'complexity',
          title: 'Why O(log n)?',
          body: `Just saying “$O(\\log n)$” is not enough; the chain is:

1. Every BST operation is $O(h)$ (one search path + constant work).
2. Insertion fix-up: Case 2 moves two levels up each time, Cases 1/3 finish with at most 2 rotations → $O(h)$.
3. Properties 4 + 5 ⇒ $h \\le 2\\log_2(n+1)$ (the proof above).
4. Hence all operations are $O(\\log n)$ **in the worst case**.

Intuitively: the lengths of all root-to-NIL paths are within a factor of 2 of each other (the shortest path is all black, the longest alternates black and red).`,
        },
        {
          kind: 'text',
          title: 'In practice: where red-black trees run',
          body: `- **Standard libraries:** Java \`TreeMap\`/\`TreeSet\` and C++ \`std::map\`/\`std::set\` (in common implementations) are red-black trees.
- **Operating systems:** the Linux kernel keeps runnable tasks in its scheduler (CFS) and memory regions in red-black trees; it needs to find the task with the smallest key quickly and to insert and delete often.
- **Why not AVL?** AVL is more strictly balanced (searches are slightly faster) but may rotate more on insertion and deletion. A red-black tree, with at most 2 rotations per insertion, is a good balance for frequently changing data.
- **Disk:** database indexes use B-trees instead of red-black trees; since every disk read is expensive, holding many keys per node to keep the tree shallow matters more.`,
          check: [
            {
              id: 'c4',
              kind: 'mcq',
              prompt: 'Why do on-disk database indexes usually use B-trees instead of red-black trees?',
              options: [
                'Red-black trees are not ordered.',
                'B-trees hold many keys per node; the tree is very shallow and a search needs very few disk reads.',
                'B-trees have no rotations.',
                'Red-black trees only work with integers.',
              ],
              answer: 1,
              hint: 'On disk, the cost is the number of blocks read.',
              explanation: 'A disk block holds hundreds of keys; a B-tree’s height is $\\log_{B} n$ (e.g. with $B = 500$, 3–4 levels for billions of records).',
            },
          ],
        },
        {
          kind: 'mistakes',
          title: 'Common mistakes',
          body: `- Inserting the new node as black: property 5 breaks, and that is much harder to fix.
- Stopping after Case 2: since $g$ is now red, a new red-red violation may appear.
- In Case 3, rotating at $g$ directly without first fixing the triangle shape (inner grandchild).
- Treating a NIL uncle as “absent” and assuming it is red: NILs are black, so this is Case 3.
- Checking property 5 only for the root: it must hold for **every** node.`,
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'Is the tree with root 2 (black) and children 1 and 3 (both red) a valid red-black tree?',
          options: ['Yes', 'No: red-red violation', 'No: black heights differ', 'No: the root must be red'],
          answer: 0,
          hint: 'Check the five properties one by one; don’t forget the NILs.',
          explanation: 'The root is black; the children of the reds are NIL (black); every path has 1 black node (NIL) + the root. All properties hold.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'In a red-black tree, a path from the root to a NIL has length 100. Which length is **impossible** for a path to another NIL?',
          options: ['55', '180', '30', '50'],
          answer: 2,
          hint: 'Path lengths can be at most a factor of 2 apart.',
          explanation: 'Every path has the same number of blacks ($b$); a path’s length is between $b$ and $2b$. For the path of length 100, $50 \\le b \\le 100$, so every other path must be at least $b \\ge 50$ long: 30 is impossible. (For 55, 180 and 50 a suitable $b$ can be chosen: for 180, $b \\ge 90$.)',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'What is the final state after inserting 1, 2, 3 in that order into an empty red-black tree?',
          options: [
            'A chain 1 → 2 → 3, all black',
            'Root 2 (black), children 1 and 3 (red)',
            'Root 1 (black), right child 2 (red), its right 3 (red)',
            'Root 3 (black), 2 and 1 a red chain',
          ],
          answer: 1,
          hint: 'When 3 is inserted, p = 2 is red and the uncle is NIL (black): Case 3, outer shape.',
          explanation: '2 is colored black, 1 red, and a left rotation is done at 1: root 2 (black), 1 and 3 red.',
        },
        {
          id: 'q4',
          kind: 'mcq',
          prompt: 'Why is no rotation needed in the insertion fix-up when the uncle is red (Case 2)?',
          options: [
            'Because the tree is already balanced.',
            'Recoloring removes the red-red violation at this level without changing black heights (the problem moves up if needed).',
            'Because Case 2 never happens.',
            'Because the root is always red.',
          ],
          answer: 1,
          hint: 'Count the blacks on the paths below $g$ before and after recoloring.',
          explanation: '$p$ and $u$ become black and $g$ red: the number of blacks on every path below $g$ stays the same. A new violation can only appear between $g$ and its parent; that is resolved further up.',
        },
        {
          id: 'q5',
          kind: 'numeric',
          prompt: 'For a red-black tree with $n = 1000$ nodes, what is the integer part of the height upper bound given by Claim 16? ($\\lfloor 2\\log_2 1001 \\rfloor$)',
          answer: 19,
          hint: '$\\log_2 1001 \\approx 9.97$.',
          explanation: '$2 \\cdot 9.967 \\approx 19.93$ → the height is at most 19. In a plain BST it could be 999.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: insert 10, 5, 15, 3, 7, 1 in that order into an empty tree. Which case(s) apply at each insertion? Draw the final tree. (Check with the “Case 2 chain” example in the visualizer.)`,
          hints: ['When 3 is inserted, the uncle 15 is red.', 'When 1 is inserted, $p = 3$ is red; is the uncle 7 red?'],
          solution: `10: root (colored black). 5, 15: Case 1 (parent 10 is black). 3: $p = 5$ red, $u = 15$ red → Case 2: 5 and 15 black, 10 red; since 10 is the root it is colored black again. 7: $p = 5$ black → Case 1. 1: $p = 3$ red, $u = 7$ red → Case 2: 3, 7 black, 5 red; 5’s parent 10 is black → Case 1, done.

Final tree: 10 (B) → left 5 (R) [left 3 (B) → left 1 (R); right 7 (B)], right 15 (B). Every root→NIL path has 3 black nodes (including the NIL).`,
        },
        {
          id: 'p2',
          prompt: `Our own example: in a red-black tree with black height $b$ (every root-to-NIL path contains $b$ black nodes, not counting NIL), what is the smallest and the largest possible number of internal nodes? Compute both for $b = 3$.`,
          hints: ['Smallest: what does the tree look like when there are no red nodes at all?', 'Largest: if red and black nodes alternate on every level, the height is at most $2b$.'],
          solution: `**Smallest:** every root-to-NIL path has exactly $b$ black nodes; with no red nodes all paths have length $b$ and the tree is a perfect binary tree: $2^b - 1$ nodes. Adding red nodes only increases the count. **Largest:** red nodes cannot be consecutive, so every path has at most $2b$ nodes; at most $2^{2b} - 1$ nodes (a perfect tree whose levels alternate black and red). For $b = 3$: at least 7, at most 63 nodes. Turned around: $n \\ge 2^b - 1$, so $b \\le \\log_2(n + 1)$ and the height is $\\le 2b \\le 2\\log_2(n + 1)$: Claim 16.`,
        },
      ],
      sources: [SRC.l7.notes, SRC.l7.slides, SRC.l7.concept, SRC.hw.hw4],
    },
    {
      id: 'l7-compare',
      lecture: 7,
      title: 'Comparing a BST and a red-black tree',
      titleEn: 'Comparing a BST and a red-black tree',
      summary: 'The same insertion order, very different heights.',
      minutes: 25,
      objectives: [
        'Compare the shapes the same insertion order produces in a plain BST and in a red-black tree.',
        'Observe the link between height and search cost through measurements, and relate it to the proven guarantee.',
      ],
      prerequisites: ['Binary search trees', 'Red-black trees'],
      sections: [
        {
          kind: 'viz',
          title: 'Side-by-side comparison',
          tasks: [
            'With “Sorted 1…12”, read off the heights and the worst-case search comparisons of both trees.',
            'Try “Reverse sorted”: what shape does the plain BST have?',
            'Does the gap shrink with the “Shuffled” order? Try **Random** a few times.',
          ],
          viz: 'treeCompare',
          body: `Try sorted, reverse-sorted and shuffled insertion orders. Examine the average and worst-case number of search comparisons, the height, and the guaranteed bound.`,
          check: [
            {
              id: 'c4',
              kind: 'numeric',
              prompt: 'For a red-black tree with $n = 12$ nodes, what is the largest height allowed by the bound $h \\le 2\\log_2(n+1)$? (Heights are integers.)',
              answer: 7,
              hint: '$\\log_2 13 \\approx 3.70$.',
              explanation: '$2\\log_2 13 \\approx 7.40$, and since the height is an integer, $h \\le 7$. Inserting 1…12 in sorted order gives a measured height of 4: the bound is an **upper** bound valid for every insertion order, not the measurement of one order.',
            },
          ],
        },
        {
          kind: 'text',
          title: 'What should we observe?',
          check: [
            {
              id: 'c1',
              kind: 'numeric',
              prompt: 'In a plain BST built by inserting 1 to 12 in sorted order, what is the average number of comparisons in a successful search?',
              answer: 6.5,
              tolerance: 0.01,
              hint: 'Key $k$ is the $k$-th node of the chain.',
              explanation: '$(1 + 2 + \\dots + 12)/12 = 78/12 = 6.5$. In the red-black tree it is a little above 3.',
            },
          ],
          body: `- Sorted insertion turns a plain BST into a chain: height $n - 1$, search $\\Theta(n)$.
- With the same order the red-black tree stays balanced through rotations: height $\\le 2\\log_2(n+1)$.
- The measured values belong to a single order; the red-black bound is proven for **every** order.`,
        },
        {
          kind: 'text',
          title: 'In practice: is a random order enough?',
          body: `If keys are inserted in **random order**, the expected height of a plain BST is $O(\\log n)$: the root behaves like a random pivot in QuickSort, and the tree resembles randomized QuickSort’s recursion tree.

But real data is often not random: timestamps, increasing ID numbers and alphabetical lists arrive **sorted** and turn a plain BST into a chain. There are two remedies:

- **A guarantee:** self-balancing trees such as red-black or AVL trees give $O(\\log n)$ for every insertion order.
- **Randomization:** a **treap** gives every node a random priority, so whatever the data order, the tree behaves as if keys were inserted randomly (expected $O(\\log n)$).`,
          check: [
            {
              id: 'c2',
              kind: 'mcq',
              prompt: 'An application inserts records into a plain BST in order of creation time (increasing timestamps). What happens?',
              options: ['The tree stays balanced by itself.', 'The tree becomes a chain; searches become $\\Theta(n)$.', 'The tree’s height becomes $\\log n$.', 'Insertion fails.'],
              answer: 1,
              hint: 'Inserting increasing keys is the same as the “Sorted” example.',
              explanation: 'Each new key is larger than the previous one, so it is inserted at the far right: height $n - 1$. A self-balancing tree or randomization is needed.',
            },
            {
              id: 'c5',
              kind: 'mcq',
              prompt: 'The same increasing timestamps are inserted into a **treap** (every node gets an independent random priority). What is the expected height?',
              options: ['$\\Theta(n)$, because the keys arrive sorted', '$O(\\log n)$', '$\\Theta(\\sqrt n)$', 'Exactly $\\lfloor \\log_2 n \\rfloor$'],
              answer: 1,
              hint: 'A treap’s shape depends on the priorities, not on the insertion order.',
              explanation: 'A treap has the same shape as a plain BST built by inserting the keys in the order of their random priorities. So whatever the data order, the expected height is $O(\\log n)$. This is an expected bound, not a per-run guarantee as in a red-black tree.',
            },
          ],
        },
        {
          kind: 'steps',
          title: 'Worked example: 1…7 in order, two trees',
          label: 'formal',
          body: `A small version of the “Sorted” scenario in the comparison panel: insert the keys 1, 2, …, 7 in order. In a plain BST the result is a chain (height 6). Let us follow what happens at each insertion in the red-black tree; the new node is inserted red and the case numbers are those of the insertion lesson.`,
          proof: [
            { title: '1, 2, 3', body: '1 becomes the root and is colored black. 2: the parent is black, case 1. 3: the parent 2 is red, the uncle is NIL (black), a straight line: case 3. Rotate left at 1; 2 is the black root, 1 and 3 are red.' },
            { title: '4 and 5', body: '4: the parent 3 and the uncle 1 are red, case 2: 1 and 3 become black, 2 red; 2 is the root, so it is colored black again. 5: the parent 4 is red, the uncle is NIL, case 3: rotate left at 3; 4 is black, 3 and 5 are red.' },
            { title: '6 and 7', body: '6: the parent 5 and the uncle 3 are red, case 2: 3 and 5 black, 4 red; the parent of 4 is the black 2, done. 7: the parent 6 is red, the uncle is NIL, case 3: rotate left at 5; 6 is black, 5 and 7 are red.' },
            { title: 'Result', body: 'The root is 2; 1 on its left; a red 4 on its right, with 3 and 6 below it and 5 and 7 below 6. Height 3 (6 in the BST). Comparisons for successful searches: 1 → 2, 2 → 1, 3 → 3, 4 → 2, 5 → 4, 6 → 3, 7 → 4: 19 in total, about 2.71 on average. The chain needs 28 in total, 4 on average. A perfectly balanced tree would need $1 + 2 \\cdot 2 + 4 \\cdot 3 = 17$: the red-black tree is not perfect, but far better than the chain.' },
          ],
          check: [
            {
              id: 'c3',
              kind: 'numeric',
              prompt: 'Which key becomes the root when 8 is inserted into this tree?',
              answer: 4,
              hint: 'The parent 7 and the uncle 5 of 8 are red: case 2 first. Where does the problem move?',
              explanation: 'Case 2: 5 and 7 black, 6 red. Now 6 and its parent 4 are red, the sibling 1 of 4 is black and 2 → 4 → 6 is a straight line: case 3, rotate left at 2. 4 becomes the black root; 2 is red (with 1 and 3 below), 6 is red (with 5 and 7 below, and 8 below 7). The height is still 3.',
            },
          ],
        },
      ],
      quiz: [
        {
          id: 'q1',
          kind: 'mcq',
          prompt: 'What is the height of a plain BST after inserting 1 through 12 in sorted order?',
          options: ['3', '6', '11', '12'],
          answer: 2,
          hint: 'Each new key becomes the right child of the rightmost node.',
          explanation: 'A chain: 12 nodes, 11 edges → height 11.',
        },
        {
          id: 'q2',
          kind: 'mcq',
          prompt: 'What is the worst-case time of INSERT/DELETE/SEARCH in a red-black tree with $n$ nodes?',
          options: ['$\\Theta(n)$', '$\\Theta(\\sqrt n)$', '$\\Theta(\\log n)$', '$\\Theta(1)$'],
          answer: 2,
          hint: 'The height bound + operations are $O(h)$.',
          explanation: '$h = O(\\log n)$ and operations are $O(h)$; moreover every binary tree has $h = \\Omega(\\log n)$, so search is $\\Theta(\\log n)$ in the worst case.',
        },
        {
          id: 'q3',
          kind: 'mcq',
          prompt: 'Which insertion order of the keys 1…7 makes a **plain** BST perfectly balanced (height 2)?',
          options: ['1, 2, 3, 4, 5, 6, 7', '4, 2, 6, 1, 3, 5, 7', '7, 6, 5, 4, 3, 2, 1', '1, 7, 2, 6, 3, 5, 4'],
          answer: 1,
          hint: 'The root is the first key inserted. Which key is the median?',
          explanation: 'First the median 4 becomes the root, then the medians 2 and 6 of the two halves, and the leaves last. The other three orders give chains of height 6 (the last one zigzags).',
        },
        {
          id: 'q4',
          kind: 'numeric',
          prompt: 'In a plain BST built by inserting 1 to 100 in sorted order, every key is searched once. How many comparisons are made in total?',
          answer: 5050,
          hint: 'Key $k$ is the $k$-th node of the chain, counting from the root.',
          explanation: '$1 + 2 + \\dots + 100 = \\frac{100 \\cdot 101}{2} = 5050$, an average of 50.5 per search. In a red-black tree every search makes at most $h + 1$ comparisons and $h \\le 2\\log_2 101 < 14$.',
        },
      ],
      practice: [
        {
          id: 'p1',
          prompt: `Our own example: let the root of a red-black tree be the $i$-th key in sorted order. What can we say about $i$: is $i = \\Theta(n)$? In the comparison panel, observe where the root ends up with sorted insertions.`,
          hints: ['The left and right subtrees of the root have equal black heights.', 'Each subtree has at least $2^{b} - 1$ nodes; how many can it have at most?'],
          solution: `The left and right subtrees have the same black height ($b$). Each contains at least $2^{b}-1$ and at most (height $\\le 2b$) about $4^{b}$ nodes. So the smaller side has at least $\\approx 2^b \\approx \\sqrt{\\text{larger side}}$ nodes: the root’s rank must be $i = \\Omega(\\sqrt n)$, but it need not be $\\Theta(n)$. (Inspired by a question in the Lecture 7 concept check.)`,
        },
        {
          id: 'p2',
          prompt: `Our own example: insert the keys 1, 2, …, 15 and 1, 2, …, 31 in order into (a) a plain BST, (b) a red-black tree. What is the height (edges from the root to the deepest node) in each case? Compare with a perfectly balanced tree. (Check in the comparison panel.)`,
          hints: ['In a plain BST, sorted insertion produces a chain.', 'In a red-black tree the height is $\\le 2\\log_2(n + 1)$.'],
          solution: `(a) BST: a chain of height $n - 1$: 14 and 30. (b) Red-black tree: 5 and 7. A perfectly balanced tree: $\\log_2(n + 1) - 1$, i.e. 3 and 4. The red-black tree is not perfect, but the bound $2\\log_2(n + 1)$ (8 and 10) holds comfortably. Sorted insertion is not a worst case for a red-black tree: red nodes pile up along the right spine and rotations rebalance them regularly.`,
        },
      ],
      sources: [SRC.l7.notes, SRC.l7.slides, SRC.l7.concept],
    },
  ],
}
