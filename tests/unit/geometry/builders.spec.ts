import { describe, it, expect } from 'vitest'
import { analyzePattern } from '@/domain/analyze'
import { buildRoundLayout } from '@/geometry/roundBuilder'
import { buildFlatLayout } from '@/geometry/flatBuilder'
import { buildPatternLayouts, computeAssemblyTransforms } from '@/geometry/assembly'
import type { Pattern } from '@/domain/types'
import sampleBall from '../../fixtures/sample-ball.json'
import sampleFlat from '../../fixtures/sample-flat.json'

describe('Geometry - roundBuilder', () => {
  it('builds round layout with correct total instance count and matrix buffer size', () => {
    const pattern = sampleBall as unknown as Pattern
    const analysis = analyzePattern(pattern)
    const partAnalysis = analysis.parts[0]!

    const layout = buildRoundLayout(partAnalysis)

    expect(layout.totalStitches).toBe(54)
    expect(layout.matrices.length).toBe(54 * 16)
    expect(layout.stepOffsets.length).toBe(partAnalysis.steps.length + 1)
    expect(layout.stepOffsets[0]).toBe(0)
    expect(layout.stepOffsets[1]).toBe(6)
    expect(layout.stepOffsets[2]).toBe(18)
    expect(layout.stepOffsets[3]).toBe(36)
    expect(layout.stepOffsets[4]).toBe(54)
  })

  it('produces deterministic output across multiple invocations', () => {
    const pattern = sampleBall as unknown as Pattern
    const analysis = analyzePattern(pattern)
    const partAnalysis = analysis.parts[0]!

    const run1 = buildRoundLayout(partAnalysis)
    const run2 = buildRoundLayout(partAnalysis)

    expect(Array.from(run1.matrices)).toEqual(Array.from(run2.matrices))
  })

  it('grows radius r_i proportionally to N', () => {
    const pattern = sampleBall as unknown as Pattern
    const analysis = analyzePattern(pattern)
    const partAnalysis = analysis.parts[0]!
    const layout = buildRoundLayout(partAnalysis)

    // For step 1 (N = 6): r ≈ 6 / (2*PI) ≈ 0.9549
    // Inspect position of stitch 0: (r*cos(0), y, r*sin(0)) -> pos X = r
    const x0 = layout.matrices[12]!
    const z0 = layout.matrices[14]!
    const r0 = Math.hypot(x0, z0)
    expect(r0).toBeCloseTo(6 / (2 * Math.PI), 2)

    // For step 2 (N = 12): r ≈ 12 / (2*PI) ≈ 1.9098
    // Stitch 6 (start of step 2):
    const x6 = layout.matrices[6 * 16 + 12]!
    const z6 = layout.matrices[6 * 16 + 14]!
    const r1 = Math.hypot(x6, z6)
    expect(r1).toBeCloseTo(12 / (2 * Math.PI), 2)
    expect(r1).toBeGreaterThan(r0)
  })

  it('flattens when dr approaches h (dy ≈ 0 on disc expansion)', () => {
    // When expanding 6 stitches per round with w=1, dr = 6 / (2*PI) ≈ 0.9549
    // If h is set to 0.9549, dy = sqrt(max(h^2 - dr^2, 0)) ≈ 0
    const pattern = sampleBall as unknown as Pattern
    const analysis = analyzePattern(pattern)
    const partAnalysis = analysis.parts[0]!

    const discLayout = buildRoundLayout(partAnalysis, {
      stitchWidth: 1.0,
      gaugeRatio: 6 / (2 * Math.PI)
    })

    const yRnd1 = discLayout.matrices[13]!
    const yRnd2 = discLayout.matrices[6 * 16 + 13]!

    expect(yRnd2 - yRnd1).toBeCloseTo(0, 3)
  })
})

describe('Geometry - flatBuilder', () => {
  it('builds flat layout with correct planar coordinates and identity orientation', () => {
    const pattern = sampleFlat as unknown as Pattern
    const analysis = analyzePattern(pattern)
    const partAnalysis = analysis.parts[0]!

    const layout = buildFlatLayout(partAnalysis)

    expect(layout.totalStitches).toBe(30)
    expect(layout.matrices.length).toBe(30 * 16)

    // Check first stitch of Row 0 (i=0):
    // pos = ((0 + 0.5)*1 - 10*1/2, 0*0.9, 0) = (0.5 - 5, 0, 0) = (-4.5, 0, 0)
    const x0 = layout.matrices[12]!
    const y0 = layout.matrices[13]!
    const z0 = layout.matrices[14]!

    expect(x0).toBeCloseTo(-4.5, 2)
    expect(y0).toBeCloseTo(0, 2)
    expect(z0).toBe(0)

    // Check Row 1 (i=1): y = 1 * 0.9 = 0.9
    const yRow1 = layout.matrices[10 * 16 + 13]!
    expect(yRow1).toBeCloseTo(0.9, 2)
  })
})

describe('Geometry - assembly', () => {
  it('builds layout map for all parts in a pattern', () => {
    const pattern = sampleBall as unknown as Pattern
    const analysis = analyzePattern(pattern)

    const layouts = buildPatternLayouts(pattern, analysis)
    expect(layouts.has('body')).toBe(true)
    expect(layouts.get('body')?.totalStitches).toBe(54)

    const transforms = computeAssemblyTransforms(pattern, layouts)
    expect(transforms.has('body')).toBe(true)
  })
})
