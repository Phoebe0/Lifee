import { lightColor } from './tokens/color'

export const theme = {
  color: lightColor,
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 },
  radius: { sm: 6, md: 12, lg: 24, xl: 32, panel: 48, full: 999 },
  typography: {
    caption: 12,
    body: 14,
    title: 22,
    amount: 40,
    keypad: 22
  },
  duration: { fast: 120, normal: 220, slow: 320 },
  opacity: { pressed: 0.72, muted: 0.8, disabled: 0.45 },
  zIndex: { content: 1, floating: 10, modal: 100 }
} as const

export type AppTheme = typeof theme
