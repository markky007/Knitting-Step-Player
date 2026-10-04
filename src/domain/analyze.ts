import type {
  Pattern,
  Part,
  Step,
  StepItem,
  OpCode,
  AnalysisIssue,
  PatternAnalysis,
  PartAnalysis,
  StepAnalysis
} from './types'

export const OP_TABLE: Record<OpCode, { consumes: number; produces: number }> = {
  sc: { consumes: 1, produces: 1 },
  hdc: { consumes: 1, produces: 1 },
  dc: { consumes: 1, produces: 1 },
  k: { consumes: 1, produces: 1 },
  p: { consumes: 1, produces: 1 },
  inc: { consumes: 1, produces: 2 },
  kfb: { consumes: 1, produces: 2 },
  dec: { consumes: 2, produces: 1 },
  k2tog: { consumes: 2, produces: 1 },
  ssk: { consumes: 2, produces: 1 },
  ch: { consumes: 0, produces: 1 },
  co: { consumes: 0, produces: 1 },
  sl_st: { consumes: 1, produces: 0 },
  bo: { consumes: 1, produces: 0 }
}

export function calculateItemCounts(item: StepItem): { consumed: number; produced: number } {
  if (item.kind === 'op') {
    const entry = OP_TABLE[item.code]
    return {
      consumed: entry.consumes * item.n,
      produced: entry.produces * item.n
    }
  }

  let subConsumed = 0
  let subProduced = 0
  for (const child of item.items) {
    const counts = calculateItemCounts(child)
    subConsumed += counts.consumed
    subProduced += counts.produced
  }

  return {
    consumed: subConsumed * item.repeat,
    produced: subProduced * item.repeat
  }
}

export function analyzePattern(pattern: Pattern): PatternAnalysis {
  const issues: AnalysisIssue[] = []
  const knownYarns = new Set(pattern.materials.yarns.map((y) => y.id))
  const partIds = new Set<string>()

  const partsAnalysis: PartAnalysis[] = []
  let totalPatternStitches = 0
  let totalPatternSteps = 0

  const defaultYarnId = pattern.materials.yarns[0]?.id ?? ''

  for (let partIdx = 0; partIdx < pattern.parts.length; partIdx++) {
    const part: Part = pattern.parts[partIdx]!
    const partPath = ['parts', String(partIdx)]

    if (partIds.has(part.id)) {
      issues.push({
        code: 'DUPLICATE_ID',
        severity: 'error',
        message: `Duplicate part id "${part.id}"`,
        path: [...partPath, 'id'],
        partId: part.id
      })
    } else {
      partIds.add(part.id)
    }

    const stepIds = new Set<string>()
    const stepsAnalysis: StepAnalysis[] = []
    let currentYarnId = defaultYarnId
    let previousStitchesAfter = 0
    let totalPartStitches = 0

    // Initial stitchesBefore based on start kind
    if (part.start.kind === 'chain' || part.start.kind === 'cast_on') {
      previousStitchesAfter = part.start.count ?? 0
    }

    for (let stepIdx = 0; stepIdx < part.steps.length; stepIdx++) {
      const step: Step = part.steps[stepIdx]!
      const stepPath = [...partPath, 'steps', String(stepIdx)]
      totalPatternSteps++

      if (stepIds.has(step.id)) {
        issues.push({
          code: 'DUPLICATE_ID',
          severity: 'error',
          message: `Duplicate step id "${step.id}" in part "${part.id}"`,
          path: [...stepPath, 'id'],
          partId: part.id,
          stepId: step.id
        })
      } else {
        stepIds.add(step.id)
      }

      if (step.yarnId) {
        if (!knownYarns.has(step.yarnId)) {
          issues.push({
            code: 'UNKNOWN_YARN',
            severity: 'error',
            message: `Unknown yarn id "${step.yarnId}" in step "${step.label}"`,
            path: [...stepPath, 'yarnId'],
            partId: part.id,
            stepId: step.id
          })
        } else {
          currentYarnId = step.yarnId
        }
      }

      if (step.items.length === 0) {
        issues.push({
          code: 'EMPTY_STEP',
          severity: 'error',
          message: `Step "${step.label}" has no items`,
          path: [...stepPath, 'items'],
          partId: part.id,
          stepId: step.id
        })
      }

      let stepConsumed = 0
      let stepProduced = 0

      for (const item of step.items) {
        const counts = calculateItemCounts(item)
        stepConsumed += counts.consumed
        stepProduced += counts.produced
      }

      const isFoundationRound = stepIdx === 0 && part.start.kind === 'magic_ring'
      const stitchesBefore = isFoundationRound ? 0 : previousStitchesAfter
      const stitchesAfter = stepProduced

      // Consumption mismatch check (except foundation round with magic ring)
      if (!isFoundationRound && stepConsumed !== stitchesBefore) {
        issues.push({
          code: 'CONSUMPTION_MISMATCH',
          severity: 'error',
          message: `Step "${step.label}" consumes ${stepConsumed} stitches, but previous round has ${stitchesBefore}`,
          path: [...stepPath, 'items'],
          partId: part.id,
          stepId: step.id
        })
      }

      // Expected count mismatch check
      if (step.expectedCount !== undefined && step.expectedCount !== stitchesAfter) {
        issues.push({
          code: 'COUNT_MISMATCH',
          severity: 'warning',
          message: `Step "${step.label}" produces ${stitchesAfter} stitches, but expected ${step.expectedCount}`,
          path: [...stepPath, 'expectedCount'],
          partId: part.id,
          stepId: step.id
        })
      }

      // Detect top-level repeat group for repeat counter
      let repeatGroup: { repeat: number; items: StepItem[] } | undefined
      if (step.items.length === 1 && step.items[0]?.kind === 'group' && step.items[0].repeat > 1) {
        repeatGroup = {
          repeat: step.items[0].repeat,
          items: step.items[0].items
        }
      }

      stepsAnalysis.push({
        stepId: step.id,
        stepIndex: stepIdx,
        label: step.label,
        consumed: isFoundationRound ? 0 : stepConsumed,
        produced: stepProduced,
        stitchesBefore,
        stitchesAfter,
        effectiveYarnId: currentYarnId,
        repeatGroup
      })

      previousStitchesAfter = stitchesAfter
      totalPartStitches += stitchesAfter
    }

    partsAnalysis.push({
      partId: part.id,
      partIndex: partIdx,
      steps: stepsAnalysis,
      totalStitches: totalPartStitches
    })

    totalPatternStitches += totalPartStitches
  }

  const hasErrors = issues.some((i) => i.severity === 'error')

  return {
    isValid: !hasErrors,
    issues,
    parts: partsAnalysis,
    totalStitches: totalPatternStitches,
    totalSteps: totalPatternSteps
  }
}
