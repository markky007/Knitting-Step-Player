import Dexie, { type EntityTable } from 'dexie'
import type { Pattern } from '../../domain/types'
import type { Progress } from '../ProgressRepository'

export interface PatternRecord {
  id: string
  title: string
  craft: 'knit' | 'crochet'
  data: Pattern
  isSample: boolean
  updatedAt: number
}

export const db = new Dexie('KnittingStepPlayerDB') as Dexie & {
  patterns: EntityTable<PatternRecord, 'id'>
  progress: EntityTable<Progress, 'patternId'>
}

db.version(1).stores({
  patterns: 'id, title, craft, isSample, updatedAt',
  progress: 'patternId, updatedAt'
})
