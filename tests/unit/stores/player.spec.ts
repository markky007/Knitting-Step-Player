import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlayerStore } from '@/stores/player.store'
import { useSettingsStore } from '@/stores/settings.store'
import { analyzePattern } from '@/domain/analyze'
import type { Pattern } from '@/domain/types'
import sampleBall from '../../fixtures/sample-ball.json'
import sampleHat from '../../fixtures/sample-hat.json'

describe('Player Store - State Machine & Navigation', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes at part 0, step 0, and handles repeat iteration', () => {
    const playerStore = usePlayerStore()
    const settingsStore = useSettingsStore()
    settingsStore.countRepeats = true

    const pattern = sampleBall as unknown as Pattern
    const analysis = analyzePattern(pattern)

    playerStore.initPlayer(pattern, analysis)

    expect(playerStore.partIndex).toBe(0)
    expect(playerStore.stepIndex).toBe(0)
    expect(playerStore.view).toBe('steps')
    expect(playerStore.isFirstStep).toBe(true)

    // Step 0 is "6 sc" (no repeat group, iteration should be null)
    expect(playerStore.iteration).toBe(null)

    // Advance to Step 1: "inc x6" (op with n=6, not a group with repeat)
    playerStore.next()
    expect(playerStore.stepIndex).toBe(1)
    expect(playerStore.isFirstStep).toBe(false)
    expect(playerStore.iteration).toBe(null)

    // Advance to Step 2: "(sc, inc) x6" (Group with repeat=6)
    playerStore.next()
    expect(playerStore.stepIndex).toBe(2)
    expect(playerStore.iteration).toBe(0)
    expect(playerStore.activeRepeatGroup?.repeat).toBe(6)

    // Next should increment iteration from 0 to 1
    playerStore.next()
    expect(playerStore.stepIndex).toBe(2)
    expect(playerStore.iteration).toBe(1)

    // Next 4 times: 2, 3, 4, 5
    playerStore.next() // 2
    playerStore.next() // 3
    playerStore.next() // 4
    playerStore.next() // 5
    expect(playerStore.iteration).toBe(5)

    // Once more at last iteration (5): should advance to Step 3
    playerStore.next()
    expect(playerStore.stepIndex).toBe(3)
    expect(playerStore.iteration).toBe(null)
  })

  it('handles prev() backwards through repeat iteration and steps', () => {
    const playerStore = usePlayerStore()
    const settingsStore = useSettingsStore()
    settingsStore.countRepeats = true

    const pattern = sampleBall as unknown as Pattern
    const analysis = analyzePattern(pattern)
    playerStore.initPlayer(pattern, analysis)

    // Jump to step 3 (last step)
    playerStore.jumpToStep(0, 3)
    expect(playerStore.stepIndex).toBe(3)

    // prev() moves back to step 2 at its last iteration (5)
    playerStore.prev()
    expect(playerStore.stepIndex).toBe(2)
    expect(playerStore.iteration).toBe(5)

    // prev() moves to iteration 4
    playerStore.prev()
    expect(playerStore.iteration).toBe(4)
  })

  it('transitions to complete view when reaching end of pattern with 1 part', () => {
    const playerStore = usePlayerStore()
    const pattern = sampleBall as unknown as Pattern
    const analysis = analyzePattern(pattern)
    playerStore.initPlayer(pattern, analysis)

    // Jump to step 3
    playerStore.jumpToStep(0, 3)
    expect(playerStore.view).toBe('steps')

    playerStore.next()
    expect(playerStore.view).toBe('complete')
  })
})
