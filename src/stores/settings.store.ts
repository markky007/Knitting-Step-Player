import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const storedLocale = typeof window !== 'undefined' ? localStorage.getItem('kp_locale') : null
  const locale = ref<'th' | 'en'>(storedLocale === 'en' ? 'en' : 'th')

  const storedRepeats = typeof window !== 'undefined' ? localStorage.getItem('kp_count_repeats') : null
  const countRepeats = ref<boolean>(storedRepeats !== null ? storedRepeats === 'true' : true)

  const storedAnim = typeof window !== 'undefined' ? localStorage.getItem('kp_animation') : null
  const enableAnimation = ref<boolean>(storedAnim !== null ? storedAnim === 'true' : true)

  const storedFocus = typeof window !== 'undefined' ? localStorage.getItem('kp_autofocus') : null
  const enableAutoFocus = ref<boolean>(storedFocus !== null ? storedFocus === 'true' : true)

  watch(locale, (val) => {
    localStorage.setItem('kp_locale', val)
  })

  watch(countRepeats, (val) => {
    localStorage.setItem('kp_count_repeats', String(val))
  })

  watch(enableAnimation, (val) => {
    localStorage.setItem('kp_animation', String(val))
  })

  watch(enableAutoFocus, (val) => {
    localStorage.setItem('kp_autofocus', String(val))
  })

  return {
    locale,
    countRepeats,
    enableAnimation,
    enableAutoFocus
  }
})
