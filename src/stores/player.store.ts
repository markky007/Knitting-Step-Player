import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pattern, PatternAnalysis, StepAnalysis } from '../domain/types'
import { progressRepository } from '../repositories/dexie/DexieProgressRepository'
import type { Progress } from '../repositories/ProgressRepository'
import { useSettingsStore } from './settings.store'

export const usePlayerStore = defineStore('player', () => {
  const settingsStore = useSettingsStore()

  const patternId = ref<string | null>(null)
  const partIndex = ref<number>(0)
  const stepIndex = ref<number>(0)
  const iteration = ref<number | null>(null)
  const view = ref<'steps' | 'assembly' | 'complete'>('steps')

  const pattern = ref<Pattern | null>(null)
  const analysis = ref<PatternAnalysis | null>(null)

  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  let wakeLockSentinel: WakeLockSentinel | null = null

  // Computed Properties
  const currentPart = computed(() => {
    if (!pattern.value) return null
    return pattern.value.parts[partIndex.value] ?? null
  })

  const currentStep = computed(() => {
    if (!currentPart.value) return null
    return currentPart.value.steps[stepIndex.value] ?? null
  })

  const currentStepAnalysis = computed<StepAnalysis | null>(() => {
    if (!analysis.value) return null
    return analysis.value.parts[partIndex.value]?.steps[stepIndex.value] ?? null
  })

  const activeRepeatGroup = computed(() => {
    if (!settingsStore.countRepeats) return null
    return currentStepAnalysis.value?.repeatGroup ?? null
  })

  const isFirstStep = computed(() => {
    return (
      view.value === 'steps' &&
      partIndex.value === 0 &&
      stepIndex.value === 0 &&
      (iteration.value === null || iteration.value === 0)
    )
  })

  const isLastStep = computed(() => {
    if (!pattern.value) return false
    const isLastPart = partIndex.value === pattern.value.parts.length - 1
    const lastPart = pattern.value.parts[partIndex.value]
    if (!lastPart) return false
    const isLastStepInPart = stepIndex.value === lastPart.steps.length - 1
    const rep = activeRepeatGroup.value
    const isLastIteration = rep ? iteration.value === rep.repeat - 1 : true
    return isLastPart && isLastStepInPart && isLastIteration
  })

  const globalProgress = computed(() => {
    if (!analysis.value || !pattern.value) {
      return { current: 0, total: 0, percentage: 0 }
    }

    let completedSteps = 0
    for (let p = 0; p < partIndex.value; p++) {
      completedSteps += pattern.value.parts[p]?.steps.length ?? 0
    }
    completedSteps += stepIndex.value + 1

    const totalSteps = analysis.value.totalSteps
    const percentage = totalSteps > 0 ? Math.min(Math.round((completedSteps / totalSteps) * 100), 100) : 0

    return {
      current: Math.min(completedSteps, totalSteps),
      total: totalSteps,
      percentage
    }
  })

  // Debounced Save
  function triggerSave() {
    if (!patternId.value) return
    if (saveTimeout) clearTimeout(saveTimeout)

    saveTimeout = setTimeout(() => {
      flushSave()
    }, 300)
  }

  async function flushSave() {
    if (!patternId.value) return
    const progress: Progress = {
      patternId: patternId.value,
      partIndex: partIndex.value,
      stepIndex: stepIndex.value,
      iteration: iteration.value,
      view: view.value,
      updatedAt: Date.now()
    }
    await progressRepository.save(progress)
  }

  // Wake Lock Integration (F-PLY-6)
  async function requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        wakeLockSentinel = await navigator.wakeLock.request('screen')
      } catch {
        // WakeLock unsupported or rejected, gracefully ignore
      }
    }
  }

  function releaseWakeLock() {
    if (wakeLockSentinel) {
      wakeLockSentinel.release().catch(() => {})
      wakeLockSentinel = null
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      flushSave()
    } else if (document.visibilityState === 'visible') {
      requestWakeLock()
    }
  }

  // Navigation Methods (F-PLY-2, F-PLY-3)
  function initPlayer(p: Pattern, a: PatternAnalysis, saved?: Progress | null) {
    pattern.value = p
    analysis.value = a
    patternId.value = p.id

    if (saved && saved.patternId === p.id) {
      partIndex.value = Math.min(saved.partIndex, p.parts.length - 1)
      const part = p.parts[partIndex.value]
      const maxSteps = part ? part.steps.length - 1 : 0
      stepIndex.value = Math.min(saved.stepIndex, maxSteps)
      iteration.value = saved.iteration
      view.value = saved.view
    } else {
      partIndex.value = 0
      stepIndex.value = 0
      view.value = 'steps'
      const rep = a.parts[0]?.steps[0]?.repeatGroup
      iteration.value = settingsStore.countRepeats && rep ? 0 : null
    }

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange)
      requestWakeLock()
    }
  }

  function cleanupPlayer() {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
      saveTimeout = null
      flushSave()
    }
    releaseWakeLock()
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }

  function next() {
    if (!pattern.value || !analysis.value) return

    // If currently on completion view
    if (view.value === 'complete') return

    // If currently on assembly view, next goes to complete
    if (view.value === 'assembly') {
      view.value = 'complete'
      triggerSave()
      return
    }

    // Step view navigation
    const rep = activeRepeatGroup.value
    if (rep && iteration.value !== null && iteration.value < rep.repeat - 1) {
      iteration.value++
      triggerSave()
      return
    }

    const currentPartObj = pattern.value.parts[partIndex.value]
    if (!currentPartObj) return

    if (stepIndex.value < currentPartObj.steps.length - 1) {
      // Advance to next step in current part
      stepIndex.value++
      const nextRep = analysis.value.parts[partIndex.value]?.steps[stepIndex.value]?.repeatGroup
      iteration.value = settingsStore.countRepeats && nextRep ? 0 : null
      triggerSave()
      return
    }

    // End of current part
    if (partIndex.value < pattern.value.parts.length - 1) {
      partIndex.value++
      stepIndex.value = 0
      const nextRep = analysis.value.parts[partIndex.value]?.steps[0]?.repeatGroup
      iteration.value = settingsStore.countRepeats && nextRep ? 0 : null
      triggerSave()
      return
    }

    // End of last part: check if multiple parts for assembly view
    if (pattern.value.parts.length > 1) {
      view.value = 'assembly'
    } else {
      view.value = 'complete'
    }
    triggerSave()
  }

  function prev() {
    if (!pattern.value || !analysis.value) return

    if (view.value === 'complete') {
      if (pattern.value.parts.length > 1) {
        view.value = 'assembly'
      } else {
        view.value = 'steps'
        setStepToLast()
      }
      triggerSave()
      return
    }

    if (view.value === 'assembly') {
      view.value = 'steps'
      setStepToLast()
      triggerSave()
      return
    }

    // Step view navigation
    if (iteration.value !== null && iteration.value > 0) {
      iteration.value--
      triggerSave()
      return
    }

    if (stepIndex.value > 0) {
      stepIndex.value--
      const prevRep = analysis.value.parts[partIndex.value]?.steps[stepIndex.value]?.repeatGroup
      iteration.value = settingsStore.countRepeats && prevRep ? prevRep.repeat - 1 : null
      triggerSave()
      return
    }

    if (partIndex.value > 0) {
      partIndex.value--
      const prevPart = pattern.value.parts[partIndex.value]!
      stepIndex.value = prevPart.steps.length - 1
      const prevRep = analysis.value.parts[partIndex.value]?.steps[stepIndex.value]?.repeatGroup
      iteration.value = settingsStore.countRepeats && prevRep ? prevRep.repeat - 1 : null
      triggerSave()
      return
    }

    // At very first step, prev is a no-op
  }

  function setStepToLast() {
    if (!pattern.value || !analysis.value) return
    partIndex.value = pattern.value.parts.length - 1
    const lastPart = pattern.value.parts[partIndex.value]!
    stepIndex.value = lastPart.steps.length - 1
    const rep = analysis.value.parts[partIndex.value]?.steps[stepIndex.value]?.repeatGroup
    iteration.value = settingsStore.countRepeats && rep ? rep.repeat - 1 : null
  }

  function jumpToStep(pIdx: number, sIdx: number) {
    if (!pattern.value || !analysis.value) return
    partIndex.value = pIdx
    stepIndex.value = sIdx
    view.value = 'steps'
    const rep = analysis.value.parts[pIdx]?.steps[sIdx]?.repeatGroup
    iteration.value = settingsStore.countRepeats && rep ? 0 : null
    triggerSave()
  }

  function resetProgress() {
    partIndex.value = 0
    stepIndex.value = 0
    view.value = 'steps'
    const rep = analysis.value?.parts[0]?.steps[0]?.repeatGroup
    iteration.value = settingsStore.countRepeats && rep ? 0 : null
    triggerSave()
  }

  return {
    patternId,
    partIndex,
    stepIndex,
    iteration,
    view,
    pattern,
    analysis,
    currentPart,
    currentStep,
    currentStepAnalysis,
    activeRepeatGroup,
    isFirstStep,
    isLastStep,
    globalProgress,
    initPlayer,
    cleanupPlayer,
    next,
    prev,
    jumpToStep,
    resetProgress,
    flushSave
  }
})
