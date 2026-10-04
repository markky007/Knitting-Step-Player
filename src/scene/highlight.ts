import * as THREE from 'three'
import type { StitchLayout } from '../geometry/types'
import type { Yarn } from '../domain/types'

export interface HighlightRange {
  start: number
  end: number
  visibleCount: number
}

export function computeHighlightRange(
  layout: StitchLayout,
  stepIndex: number,
  iteration: number | null,
  repeatTotal?: number
): HighlightRange {
  const stepStart = layout.stepOffsets[stepIndex] ?? 0
  const stepEnd = layout.stepOffsets[stepIndex + 1] ?? stepStart
  const stepCount = stepEnd - stepStart

  if (iteration !== null && repeatTotal && repeatTotal > 1) {
    const iterStart = stepStart + Math.floor((iteration * stepCount) / repeatTotal)
    const iterEnd = stepStart + Math.floor(((iteration + 1) * stepCount) / repeatTotal)
    return {
      start: iterStart,
      end: iterEnd,
      visibleCount: iterEnd
    }
  }

  return {
    start: stepStart,
    end: stepEnd,
    visibleCount: stepEnd
  }
}

export function applyInstanceColors(
  mesh: THREE.InstancedMesh,
  layout: StitchLayout,
  yarnsMap: Map<string, string>, // yarnId -> hex
  highlightRange: HighlightRange,
  accentHex: string,
  animationProgress = 1.0
): void {
  const defaultColor = new THREE.Color('#CCCAC6')
  const accentColor = new THREE.Color(accentHex)
  const tempColor = new THREE.Color()

  const { start, end, visibleCount } = highlightRange

  for (let i = 0; i < visibleCount; i++) {
    const yarnId = layout.yarnIds[i] ?? ''
    const yarnHex = yarnsMap.get(yarnId)

    if (yarnHex) {
      tempColor.set(yarnHex)
    } else {
      tempColor.copy(defaultColor)
    }

    // Check if this instance is in the active highlight range
    if (i >= start && i < end) {
      // In active highlight: blend towards accent token
      // Also apply animation fade/pulse if animating
      const blendFactor = 0.85 * animationProgress
      tempColor.lerp(accentColor, blendFactor)
    }

    mesh.setColorAt(i, tempColor)
  }

  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true
  }
}

export function getCssVariable(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return val || fallback
}
