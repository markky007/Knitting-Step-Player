import type { PartAnalysis } from '../domain/types'
import type { StitchLayout } from './types'

export interface BuilderOptions {
  stitchWidth?: number
  gaugeRatio?: number // height / width
  depth?: number
}

export function buildRoundLayout(
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
  let rPrev = 0
  let yPrev = 0

  for (let i = 0; i < numSteps; i++) {
    const step = partAnalysis.steps[i]!
    stepOffsets[i] = currentOffset
    stepIds.push(step.stepId)

    const N = step.stitchesAfter
    const rCurrent = (N * w) / (2 * Math.PI)
    const dr = rCurrent - rPrev
    const dy = Math.sqrt(Math.max(h * h - dr * dr, 0))
    const yCurrent = yPrev + dy

    const scaleX = (2 * Math.PI * rCurrent) / (N > 0 ? N : 1)
    const scaleY = h
    const scaleZ = depth

    const len = Math.hypot(dr, dy) || 1e-6
    const normDy = dy / len
    const normDr = dr / len

    const stagger = (i % 2) * (Math.PI / (N > 0 ? N : 1))

    for (let k = 0; k < N; k++) {
      const theta = (2 * Math.PI * k) / N + stagger
      const cosT = Math.cos(theta)
      const sinT = Math.sin(theta)

      const posX = rCurrent * cosT
      const posY = yCurrent
      const posZ = rCurrent * sinT

      // Local axes
      // X = tangent
      const xX = -sinT
      const xY = 0
      const xZ = cosT

      // Y = along the profile (up & outward)
      const yX = cosT * normDr
      const yY = normDy
      const yZ = sinT * normDr

      // Z = X cross Y
      const zX = -cosT * normDy
      const zY = normDr
      const zZ = -sinT * normDy

      const base = currentOffset * 16

      // Col 0
      matrices[base + 0] = xX * scaleX
      matrices[base + 1] = xY * scaleX
      matrices[base + 2] = xZ * scaleX
      matrices[base + 3] = 0

      // Col 1
      matrices[base + 4] = yX * scaleY
      matrices[base + 5] = yY * scaleY
      matrices[base + 6] = yZ * scaleY
      matrices[base + 7] = 0

      // Col 2
      matrices[base + 8] = zX * scaleZ
      matrices[base + 9] = zY * scaleZ
      matrices[base + 10] = zZ * scaleZ
      matrices[base + 11] = 0

      // Col 3
      matrices[base + 12] = posX
      matrices[base + 13] = posY
      matrices[base + 14] = posZ
      matrices[base + 15] = 1

      yarnIds.push(step.effectiveYarnId)
      currentOffset++
    }

    rPrev = rCurrent
    yPrev = yCurrent
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
