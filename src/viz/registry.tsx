import type { ComponentType } from 'react'
import { KaratsubaViz } from './KaratsubaViz'
import { HandVsComputer } from './Intro'
import { SortingLab } from './SortingLab'
import { BigOWitness, EmpiricalSorting, GrowthExplorer } from './GrowthExplorer'
import { MasterLab } from './MasterLab'
import { SubstitutionLab } from './SubstitutionLab'
import { SelectViz } from './SelectViz'
import { InversionArcs, RotationDemo } from './Extras'
import { GroupSizeTree, MedianOfMediansGrid, PivotCompare } from './SelectAnalysis'
import { PairProbability, QuickSortExperiment, QuickSortViz } from './QuickSortViz'
import { DecisionTreeViz } from './DecisionTreeViz'
import { BucketSortViz } from './BucketSortViz'
import { SortComparison } from './SortComparison'
import { BSTViz, RBPlayground, RBViz, TreeCompare } from './TreeViz'
import { BirthdayViz, HashTableViz } from './HashViz'
import { GraphSearchViz, SccViz } from './GraphSearchViz'
import { BellmanFordViz, DijkstraViz, FloydViz } from './ShortestPathViz'
import { KnapsackViz, LcsViz, MwisViz } from './DPViz'
import { ActivityViz, HuffmanViz } from './GreedyViz'
import { MSTViz } from './MSTViz'
import { MaxFlowViz } from './FlowViz'
import { StableMatchingViz } from './MatchingViz'

/** Maps the `viz` keys used in lesson content to components. */
export const VIZ: Record<string, ComponentType> = {
  karatsuba: KaratsubaViz,
  handVsComputer: HandVsComputer,
  sortingLab: () => <SortingLab initial="insertion" />,
  mergeSort: () => <SortingLab initial="merge" />,
  growth: GrowthExplorer,
  bigO: BigOWitness,
  empiricalSorting: EmpiricalSorting,
  master: MasterLab,
  substitution: SubstitutionLab,
  select: SelectViz,
  inversions: InversionArcs,
  rotation: RotationDemo,
  pivotCompare: PivotCompare,
  momGrid: MedianOfMediansGrid,
  groupTree: GroupSizeTree,
  quickSort: QuickSortViz,
  quickExperiment: QuickSortExperiment,
  pairProbability: PairProbability,
  decisionTree: DecisionTreeViz,
  bucketSort: BucketSortViz,
  sortComparison: SortComparison,
  bst: BSTViz,
  rb: RBViz,
  rbPlayground: RBPlayground,
  treeCompare: TreeCompare,
  hashTable: HashTableViz,
  birthday: BirthdayViz,
  bfs: () => <GraphSearchViz initial="bfs" />,
  dfs: () => <GraphSearchViz initial="dfs" />,
  dfsApps: () => <GraphSearchViz initial="components" />,
  scc: SccViz,
  dijkstra: DijkstraViz,
  bellmanFord: BellmanFordViz,
  floyd: FloydViz,
  lcs: LcsViz,
  knapsack: KnapsackViz,
  mwis: MwisViz,
  activity: ActivityViz,
  huffman: HuffmanViz,
  mst: MSTViz,
  maxFlow: MaxFlowViz,
  stableMatching: StableMatchingViz,
}
