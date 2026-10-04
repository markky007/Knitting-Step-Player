import type { PartAnalysis } from '../domain/types'
import type { StitchLayout } from './types'
import type { BuilderOptions } from './roundBuilder'

export function buildFlatLayout(
  partAnalysis: PartAnalysis,
  options: BuilderOptions = {}
): StitchLayout {
  const w = options.stitchWidth ?? 1.0
  const h = options.gaugeRatio ?? 0.9
  const depth = options.depth ?? 0.8

  const numSteps = partAnalysis.steps.length
  const totalStitches = partAnalysis.totalStitches
  const matrices = new Float32Array(totalStitches * 16)
  const stepOffsets = new Uint32Array(numSteps + 1)
  const stepIds: string[] = []
  const yarnIds: string[] = []

  let currentOffset = 0

  for (let i = 0; i < numSteps; i++) {
    const step = partAnalysis.steps[i]!
    stepOffsets[i] = currentOffset
    stepIds.push(step.stepId)

    const N = step.stitchesAfter
    const posY = i * h

    for (let k = 0; k < N; k++) {
      const posX = (k + 0.5) * w - (N * w) / 2
      const posZ = 0

      const base = currentOffset * 16

      // Col 0: identity X * w
      matrices[base + 0] = w
      matrices[base + 1] = 0
      matrices[base + 2] = 0
      matrices[base + 3] = 0

      // Col 1: identity Y * h
      matrices[base + 4] = 0
      matrices[base + 5] = h
      matrices[base + 6] = 0
      matrices[base + 7] = 0

      // Col 2: identity Z * depth
      matrices[base + 8] = 0
      matrices[base + 9] = 0
      matrices[base + 10] = depth
      matrices[base + 11] = 0

      // Col 3: Position
      matrices[base + 12] = posX
      matrices[base + 13] = posY
      matrices[base + 14] = posZ
      matrices[base + 15] = 1

      yarnIds.push(step.effectiveYarnId)
      currentOffset++
    }
  }

  stepOffsets[numSteps] = currentOffset

  return {
    partId: partAnalysis.partId,
    totalStitches,
    matrices,
    stepOffsets,
    stepIds,
    yarnIds
  }
}
