import { describe, it, expect } from 'vitest'
import { PatternSchema } from '@/domain/schema'
import { analyzePattern, calculateItemCounts, OP_TABLE } from '@/domain/analyze'
import type { Pattern } from '@/domain/types'
import sampleBall from '../../fixtures/sample-ball.json'
import sampleHat from '../../fixtures/sample-hat.json'
import sampleFlat from '../../fixtures/sample-flat.json'

describe('Domain - Zod Schema & Op Counting', () => {
  it('validates OP_TABLE consuming and producing constants', () => {
    expect(OP_TABLE.sc).toEqual({ consumes: 1, produces: 1 })
    expect(OP_TABLE.inc).toEqual({ consumes: 1, produces: 2 })
    expect(OP_TABLE.dec).toEqual({ consumes: 2, produces: 1 })
    expect(OP_TABLE.ch).toEqual({ consumes: 0, produces: 1 })
    expect(OP_TABLE.sl_st).toEqual({ consumes: 1, produces: 0 })
    expect(OP_TABLE.k).toEqual({ consumes: 1, produces: 1 })
    expect(OP_TABLE.kfb).toEqual({ consumes: 1, produces: 2 })
    expect(OP_TABLE.k2tog).toEqual({ consumes: 2, produces: 1 })
  })

  it('calculates counts for individual ops and nested groups', () => {
    const singleOp = { kind: 'op' as const, code: 'sc' as const, n: 6 }
    expect(calculateItemCounts(singleOp)).toEqual({ consumed: 6, produced: 6 })

    const incGroup = {
      kind: 'group' as const,
      repeat: 6,
      items: [
        { kind: 'op' as const, code: 'sc' as const, n: 1 },
        { kind: 'op' as const, code: 'inc' as const, n: 1 }
      ]
    }
    // Each repeat consumes 1+1=2, produces 1+2=3. Total: 12 consumed, 18 produced
    expect(calculateItemCounts(incGroup)).toEqual({ consumed: 12, produced: 18 })
  })

  it('validates sample fixtures against Zod schema', () => {
    expect(() => PatternSchema.parse(sampleBall)).not.toThrow()
    expect(() => PatternSchema.parse(sampleHat)).not.toThrow()
    expect(() => PatternSchema.parse(sampleFlat)).not.toThrow()
  })
})

describe('Domain - analyzePattern() Analysis Engine', () => {
  it('analyzes sample-ball fixture with zero issues', () => {
    const pattern = sampleBall as unknown as Pattern
    const result = analyzePattern(pattern)

    expect(result.isValid).toBe(true)
    expect(result.issues).toEqual([])
    expect(result.parts.length).toBe(1)

    const bodyPart = result.parts[0]!
    expect(bodyPart.steps.length).toBe(4)

    // Step 1: Magic ring, 6 sc -> before 0, after 6
    expect(bodyPart.steps[0]?.stitchesBefore).toBe(0)
    expect(bodyPart.steps[0]?.stitchesAfter).toBe(6)

    // Step 2: inc x6 -> before 6, after 12
    expect(bodyPart.steps[1]?.stitchesBefore).toBe(6)
    expect(bodyPart.steps[1]?.stitchesAfter).toBe(12)

    // Step 3: (sc, inc) x6 -> before 12, after 18
    expect(bodyPart.steps[2]?.stitchesBefore).toBe(12)
    expect(bodyPart.steps[2]?.stitchesAfter).toBe(18)
    expect(bodyPart.steps[2]?.repeatGroup?.repeat).toBe(6)

    // Step 4: sc x18 -> before 18, after 18
    expect(bodyPart.steps[3]?.stitchesBefore).toBe(18)
    expect(bodyPart.steps[3]?.stitchesAfter).toBe(18)

    // Total part stitches: 6 + 12 + 18 + 18 = 54
    expect(bodyPart.totalStitches).toBe(54)
    expect(result.totalStitches).toBe(54)
  })

  it('analyzes sample-hat fixture with yarn transition and decreases', () => {
    const pattern = sampleHat as unknown as Pattern
    const result = analyzePattern(pattern)

    expect(result.isValid).toBe(true)
    expect(result.issues).toEqual([])

    const hatPart = result.parts[0]!
    expect(hatPart.steps[0]?.effectiveYarnId).toBe('y1')
    expect(hatPart.steps[3]?.effectiveYarnId).toBe('y2')
    expect(hatPart.steps[4]?.effectiveYarnId).toBe('y2') // persists until changed

    // Rnd 5: (sc 1, dec 1) x6 -> before 18, consumed 18, produces 12
    expect(hatPart.steps[4]?.stitchesBefore).toBe(18)
    expect(hatPart.steps[4]?.stitchesAfter).toBe(12)

    // Rnd 6: dec x6 -> before 12, consumed 12, produces 6
    expect(hatPart.steps[5]?.stitchesBefore).toBe(12)
    expect(hatPart.steps[5]?.stitchesAfter).toBe(6)
  })

  it('analyzes sample-flat fixture with chain start', () => {
    const pattern = sampleFlat as unknown as Pattern
    const result = analyzePattern(pattern)

    expect(result.isValid).toBe(true)
    const swatch = result.parts[0]!
    expect(swatch.steps[0]?.stitchesBefore).toBe(10)
    expect(swatch.steps[0]?.stitchesAfter).toBe(10)
  })

  it('detects CONSUMPTION_MISMATCH when consumed stitches do not match previous stitchesAfter', () => {
    const invalidPattern: Pattern = {
      schemaVersion: 1,
      id: 'bad-consumption',
      title: 'Bad Pattern',
      craft: 'crochet',
      materials: {
        yarns: [{ id: 'y1', name: 'Y1', colorHex: '#000000' }],
        tools: ['hook']
      },
      parts: [
        {
          id: 'p1',
          name: 'Part 1',
          kind: 'round',
          start: { kind: 'magic_ring' },
          steps: [
            {
              id: 's1',
              label: 'Rnd 1',
              raw: '6 sc (6)',
              items: [{ kind: 'op', code: 'sc', n: 6 }]
            },
            {
              id: 's2',
              label: 'Rnd 2',
              raw: 'inc x3 (6)', // consumes only 3, but Rnd 1 has 6
              items: [{ kind: 'op', code: 'inc', n: 3 }]
            }
          ]
        }
      ]
    }

    const result = analyzePattern(invalidPattern)
    expect(result.isValid).toBe(false)
    const mismatch = result.issues.find((i) => i.code === 'CONSUMPTION_MISMATCH')
    expect(mismatch).toBeDefined()
    expect(mismatch?.severity).toBe('error')
    expect(mismatch?.stepId).toBe('s2')
  })

  it('detects COUNT_MISMATCH as warning when expectedCount differs from produced', () => {
    const warningPattern: Pattern = {
      schemaVersion: 1,
      id: 'count-mismatch',
      title: 'Warning Pattern',
      craft: 'crochet',
      materials: {
        yarns: [{ id: 'y1', name: 'Y1', colorHex: '#000000' }],
        tools: ['hook']
      },
      parts: [
        {
          id: 'p1',
          name: 'Part 1',
          kind: 'round',
          start: { kind: 'magic_ring' },
          steps: [
            {
              id: 's1',
              label: 'Rnd 1',
              raw: '6 sc (8)', // raw claims (8), but produces 6
              expectedCount: 8,
              items: [{ kind: 'op', code: 'sc', n: 6 }]
            }
          ]
        }
      ]
    }

    const result = analyzePattern(warningPattern)
    expect(result.isValid).toBe(true) // Warnings do not invalidate pattern
    const warning = result.issues.find((i) => i.code === 'COUNT_MISMATCH')
    expect(warning).toBeDefined()
    expect(warning?.severity).toBe('warning')
  })

  it('detects UNKNOWN_YARN, EMPTY_STEP, and DUPLICATE_ID errors', () => {
    const errorPattern: Pattern = {
      schemaVersion: 1,
      id: 'errors-test',
      title: 'Error Pattern',
      craft: 'crochet',
      materials: {
        yarns: [{ id: 'y1', name: 'Y1', colorHex: '#000000' }],
        tools: ['hook']
      },
      parts: [
        {
          id: 'p1',
          name: 'Part 1',
          kind: 'round',
          start: { kind: 'magic_ring' },
          steps: [
            {
              id: 's1',
              label: 'Rnd 1',
              raw: '',
              yarnId: 'nonexistent-yarn',
              items: []
            },
            {
              id: 's1', // Duplicate step ID
              label: 'Rnd 2',
              raw: '',
              items: []
            }
          ]
        },
        {
          id: 'p1', // Duplicate part ID
          name: 'Part 1 Dup',
          kind: 'flat',
          start: { kind: 'chain', count: 5 },
          steps: []
        }
      ]
    }

    const result = analyzePattern(errorPattern)
    expect(result.isValid).toBe(false)

    expect(result.issues.some((i) => i.code === 'UNKNOWN_YARN')).toBe(true)
    expect(result.issues.some((i) => i.code === 'EMPTY_STEP')).toBe(true)
    expect(result.issues.some((i) => i.code === 'DUPLICATE_ID' && i.partId === 'p1')).toBe(true)
  })
})
