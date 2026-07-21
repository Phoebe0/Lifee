import { cache } from '../cache/cache'
import type { ThemeName } from '@lifee/shared'

export function initTheme() {
  const theme = cache.get<ThemeName>('theme:current') ?? 'light'
  cache.set('theme:current', theme)
}

export function setTheme(theme: ThemeName) {
  cache.set('theme:current', theme)
}

export function getTheme(): ThemeName {
  return cache.get<ThemeName>('theme:current') ?? 'light'
}
