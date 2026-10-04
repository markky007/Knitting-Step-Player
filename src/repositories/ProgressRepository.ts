export interface Progress {
  patternId: string
  partIndex: number
  stepIndex: number
  iteration: number | null
  view: 'steps' | 'assembly' | 'complete'
  updatedAt: number
}

export interface ProgressRepository {
  get(patternId: string): Promise<Progress | null>
  save(progress: Progress): Promise<void>
  remove(patternId: string): Promise<void>
}
