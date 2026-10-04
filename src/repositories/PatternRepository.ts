import type { Pattern } from '../domain/types'

export interface PatternSummary {
  id: string
  title: string
  craft: 'knit' | 'crochet'
  partCount: number
  totalSteps: number
  totalStitches: number
  status: 'not_started' | 'in_progress' | 'completed'
  updatedAt: number
  isSample?: boolean | undefined
}

export interface PatternRepository {
  list(): Promise<PatternSummary[]>
  get(id: string): Promise<Pattern | null>
  save(p: Pattern, isSample?: boolean): Promise<void>
  remove(id: string): Promise<void>
}
