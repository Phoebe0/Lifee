import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getTheme, setTheme } from '../core/theme/theme'
import type { ThemeName } from '@lifee/shared'

export const useAppStore = defineStore('app', () => {
  const theme = ref<ThemeName>(getTheme())

  function updateTheme(nextTheme: ThemeName) {
    theme.value = nextTheme
    setTheme(nextTheme)
  }

  return {
    theme,
    updateTheme
  }
})
