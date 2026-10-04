import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Pattern, PatternAnalysis } from '../domain/types'
import { analyzePattern } from '../domain/analyze'
import { PatternSchema } from '../domain/schema'
import { patternRepository } from '../repositories/dexie/DexiePatternRepository'
import type { PatternSummary } from '../repositories/PatternRepository'

export const usePatternStore = defineStore('pattern', () => {
  const currentPattern = ref<Pattern | null>(null)
  const patternAnalysis = ref<PatternAnalysis | null>(null)
  const patternsList = ref<PatternSummary[]>([])
  const isLoading = ref<boolean>(false)

  async function fetchPatterns() {
    isLoading.value = true
    try {
      patternsList.value = await patternRepository.list()
    } finally {
      isLoading.value = false
    }
  }

  async function loadPattern(id: string): Promise<Pattern | null> {
    isLoading.value = true
    try {
      const p = await patternRepository.get(id)
      if (p) {
        currentPattern.value = p
        patternAnalysis.value = analyzePattern(p)
      } else {
        currentPattern.value = null
        patternAnalysis.value = null
      }
      return p
    } finally {
      isLoading.value = false
    }
  }

  async function saveImportedPattern(pattern: Pattern): Promise<void> {
    await patternRepository.save(pattern)
    await fetchPatterns()
  }

  async function deletePattern(id: string): Promise<void> {
    await patternRepository.remove(id)
    if (currentPattern.value?.id === id) {
      currentPattern.value = null
      patternAnalysis.value = null
    }
    await fetchPatterns()
  }

  function validateRawJson(jsonString: string): {
    isValid: boolean
    pattern?: Pattern
    analysis?: PatternAnalysis
    schemaErrors?: { path: string; message: string }[]
  } {
    try {
      const parsed = JSON.parse(jsonString)
      const parseResult = PatternSchema.safeParse(parsed)

      if (!parseResult.success) {
        const schemaErrors = parseResult.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message
        }))
        return { isValid: false, schemaErrors }
      }

      const pattern = parseResult.data as Pattern
      const analysis = analyzePattern(pattern)

      return {
        isValid: analysis.isValid,
        pattern,
        analysis
      }
    } catch (err: unknown) {
      return {
        isValid: false,
        schemaErrors: [
          {
            path: 'root',
            message: err instanceof Error ? err.message : 'Invalid JSON syntax'
          }
        ]
      }
    }
  }

  return {
    currentPattern,
    patternAnalysis,
    patternsList,
    isLoading,
    fetchPatterns,
    loadPattern,
    saveImportedPattern,
    deletePattern,
    validateRawJson
  }
})
