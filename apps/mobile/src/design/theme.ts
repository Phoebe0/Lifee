export const theme = {
  color: {
    brand: '#4F5795',
    brandSoft: '#E6EEFF',
    accent: '#006879',
    background: '#F7F8FF',
    surface: '#FFFFFF',
    text: '#121C2A',
    textSecondary: '#5E6170',
    border: '#E4E7F2',
    income: '#2ECC71',
    expense: '#FF6B6B'
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 },
  radius: { sm: 6, md: 12, lg: 24, full: 999 }
} as const

export type AppTheme = typeof theme
