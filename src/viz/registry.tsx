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
}
