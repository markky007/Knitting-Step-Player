import type { Progress, ProgressRepository } from '../ProgressRepository'
import { db } from './db'

export class DexieProgressRepository implements ProgressRepository {
  async get(patternId: string): Promise<Progress | null> {
    const item = await db.progress.get(patternId)
    return item ?? null
  }

  async save(progress: Progress): Promise<void> {
    await db.progress.put(progress)
  }

  async remove(patternId: string): Promise<void> {
    await db.progress.delete(patternId)
  }
}

export const progressRepository = new DexieProgressRepository()
