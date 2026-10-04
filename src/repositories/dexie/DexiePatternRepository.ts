import type { Pattern } from '../../domain/types'
import { analyzePattern } from '../../domain/analyze'
import type { PatternRepository, PatternSummary } from '../PatternRepository'
import { db } from './db'
import sampleBallFixture from '../../../tests/fixtures/sample-ball.json'

export class DexiePatternRepository implements PatternRepository {
  private hasSeeded = false

  private async ensureSeed(): Promise<void> {
    if (this.hasSeeded) return
    const count = await db.patterns.count()
    if (count === 0) {
      await this.save(sampleBallFixture as unknown as Pattern, true)
    }
    this.hasSeeded = true
  }

  async list(): Promise<PatternSummary[]> {
    await this.ensureSeed()
    const records = await db.patterns.toArray()
    const summaries: PatternSummary[] = []

    for (const record of records) {
      const pattern = record.data
      const analysis = analyzePattern(pattern)
      const progress = await db.progress.get(record.id)

      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started'
      if (progress) {
        if (progress.view === 'complete') {
          status = 'completed'
        } else if (progress.partIndex > 0 || progress.stepIndex > 0 || progress.iteration !== null) {
          status = 'in_progress'
        }
      }

      summaries.push({
        id: record.id,
        title: record.title,
        craft: record.craft,
        partCount: pattern.parts.length,
        totalSteps: analysis.totalSteps,
        totalStitches: analysis.totalStitches,
        status,
        updatedAt: record.updatedAt,
        isSample: record.isSample
      })
    }

    // Sort by most recently updated
    return summaries.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async get(id: string): Promise<Pattern | null> {
    await this.ensureSeed()
    const record = await db.patterns.get(id)
    return record ? record.data : null
  }

  async save(pattern: Pattern, isSample = false): Promise<void> {
    await db.patterns.put({
      id: pattern.id,
      title: pattern.title,
      craft: pattern.craft,
      data: pattern,
      isSample,
      updatedAt: Date.now()
    })
  }

  async remove(id: string): Promise<void> {
    await db.patterns.delete(id)
    await db.progress.delete(id)
  }
}

export const patternRepository = new DexiePatternRepository()
