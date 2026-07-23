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
  zIndex: { content: 1, floating: 10, modal: 100 },
  transactionCategory: {
    food: { icon: '#FF4B4B', surface: '#FFEBEE' },
    shopping: { icon: '#B026D3', surface: '#F3E5F5' },
    transport: { icon: '#29A84A', surface: '#E8F5E9' },
    home: { icon: '#7A5AC8', surface: '#F0EBFA' },
    entertainment: { icon: '#E05C9B', surface: '#FCEAF3' },
    medical: { icon: '#EF5350', surface: '#FFEBEE' },
    education: { icon: '#2196F3', surface: '#E3F2FD' },
    salary: { icon: '#006879', surface: 'rgba(126,230,255,0.30)' },
    bonus: { icon: '#E08A00', surface: '#FFF3E0' },
    investment: { icon: '#2B8C62', surface: '#E8F5E9' },
    partTime: { icon: '#5963AA', surface: '#ECEEFA' },
    redPacket: { icon: '#E5484D', surface: '#FFEBEE' },
    reimbursement: { icon: '#1A7F8E', surface: '#E2F6F8' },
    refund: { icon: '#2B8C62', surface: '#E8F5E9' }
  },
  auth: {
    glassSurface: 'rgba(255,255,255,0.48)',
    glassStrong: 'rgba(255,255,255,0.62)',
    glassControl: 'rgba(255,255,255,0.40)',
    glassBorder: 'rgba(255,255,255,0.78)',
    brandTint: 'rgba(79,87,149,0.11)',
    brandBorder: 'rgba(79,87,149,0.26)',
    brandGlow: 'rgba(104,112,175,0.22)',
    accentGlow: 'rgba(126,230,255,0.20)',
    flowRing: 'rgba(79,87,149,0.14)',
    controlTrack: 'rgba(223,233,252,0.46)',
    noticeSurface: 'rgba(230,244,254,0.82)',
    dangerSurface: 'rgba(255,237,234,0.82)',
    markAccent: '#7EE6FF'
  }
} as const

export type AppTheme = typeof theme
