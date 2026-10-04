// Pure TypeScript Domain Types (Zero dependencies on Vue, Quasar, or Three.js)

export type OpCode =
  | 'sc' | 'hdc' | 'dc' | 'ch' | 'sl_st' // crochet
  | 'co' | 'k' | 'p' | 'k2tog' | 'ssk' | 'kfb' | 'bo' // knit
  | 'inc' | 'dec' // shared

export interface Op {
  kind: 'op'
  code: OpCode
  n: number // n >= 1
}

export interface Group {
  kind: 'group'
  repeat: number // repeat >= 1
  items: StepItem[]
}

export type StepItem = Op | Group

export interface Yarn {
  id: string
  name: string
  colorHex: string
  weight?: string | undefined
}

export interface StepView {
  camera?: [number, number, number] | undefined
  focus?: 'new' | 'all' | undefined
}

export interface Step {
  id: string
  label: string // e.g. 'Rnd 3', 'Row 12'
  raw: string // original instruction text
  items: StepItem[]
  expectedCount?: number | undefined // number in parentheses in the source text
  yarnId?: string | undefined // switch to this yarn from this step on
  note?: string | undefined
  view?: StepView | undefined
  modelRef?: string | undefined // Phase 2: GLB for this step
}

export interface PartStart {
  kind: 'magic_ring' | 'chain' | 'cast_on'
  count?: number | undefined
}

export interface Part {
  id: string
  name: string
  kind: 'round' | 'flat'
  start: PartStart
  stuffed?: boolean | undefined
  steps: Step[]
}

export interface PartPlacement {
  partId: string
  position: [number, number, number]
  rotation: [number, number, number]
}

export interface Gauge {
  stitchWidthMm: number
  stitchHeightMm: number
}

export interface Materials {
  yarns: Yarn[]
  tools: string[]
  notes?: string | undefined
}

export interface Pattern {
  schemaVersion: 1
  id: string
  title: string
  craft: 'knit' | 'crochet'
  gauge?: Gauge | undefined
  materials: Materials
  parts: Part[]
  assembly?: PartPlacement[] | undefined
}

// Derived analysis types
export type IssueSeverity = 'error' | 'warning'
export type IssueCode =
  | 'CONSUMPTION_MISMATCH'
  | 'COUNT_MISMATCH'
  | 'EMPTY_STEP'
  | 'UNKNOWN_YARN'
  | 'DUPLICATE_ID'
  | 'INVALID_SCHEMA'

export interface AnalysisIssue {
  code: IssueCode
  severity: IssueSeverity
  message: string
  path: string[]
  partId?: string | undefined
  stepId?: string | undefined
}

export interface StepAnalysis {
  stepId: string
  stepIndex: number
  label: string
  consumed: number
  produced: number
  stitchesBefore: number
  stitchesAfter: number
  effectiveYarnId: string
  repeatGroup?: {
    repeat: number
    items: StepItem[]
  } | undefined
}

export interface PartAnalysis {
  partId: string
  partIndex: number
  steps: StepAnalysis[]
  totalStitches: number
}

export interface PatternAnalysis {
  isValid: boolean
  issues: AnalysisIssue[]
  parts: PartAnalysis[]
  totalStitches: number
  totalSteps: number
}
