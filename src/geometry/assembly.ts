import type { Pattern, PatternAnalysis } from '../domain/types'
import type { StitchLayout } from './types'
import { buildRoundLayout } from './roundBuilder'
import { buildFlatLayout } from './flatBuilder'

export function buildPatternLayouts(
  pattern: Pattern,
  analysis: PatternAnalysis
): Map<string, StitchLayout> {
  const layouts = new Map<string, StitchLayout>()

  const gaugeRatio = pattern.gauge
    ? pattern.gauge.stitchHeightMm / pattern.gauge.stitchWidthMm
    : 0.9

  for (let i = 0; i < pattern.parts.length; i++) {
    const part = pattern.parts[i]!
    const partAnalysis = analysis.parts[i]!

    if (part.kind === 'round') {
      const layout = buildRoundLayout(partAnalysis, { gaugeRatio })
      layouts.set(part.id, layout)
    } else {
      const layout = buildFlatLayout(partAnalysis, { gaugeRatio })
      layouts.set(part.id, layout)
    }
  }

  return layouts
}

export function computeAssemblyTransforms(
  pattern: Pattern,
  layouts: Map<string, StitchLayout>
): Map<string, { position: [number, number, number]; rotation: [number, number, number] }> {
  const result = new Map<string, { position: [number, number, number]; rotation: [number, number, number] }>()

  // If explicit assembly placements exist
  if (pattern.assembly && pattern.assembly.length > 0) {
    for (const placement of pattern.assembly) {
      result.set(placement.partId, {
        position: placement.position,
        rotation: placement.rotation
      })
    }
    return result
  }

  // Default: space parts along X axis
  let currentX = 0
  const spacing = 8.0 // default gap between parts

  for (let i = 0; i < pattern.parts.length; i++) {
    const part = pattern.parts[i]!
    const layout = layouts.get(part.id)
    const stitchCount = layout?.totalStitches ?? 0

    // Estimate part width from stitches
    const estRadius = Math.max(Math.sqrt(stitchCount) * 0.5, 2.0)

    result.set(part.id, {
      position: [currentX + estRadius, 0, 0],
      rotation: [0, 0, 0]
    })

    currentX += estRadius * 2 + spacing
  }

  // Center all parts around the origin
  const halfTotal = currentX / 2
  for (const transform of result.values()) {
    transform.position[0] -= halfTotal
  }

  return result
}
