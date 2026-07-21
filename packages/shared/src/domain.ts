export type AppEnv = 'dev' | 'test' | 'prod'
export type ThemeName = 'light' | 'dark'
export type CurrencyCode = 'CNY' | 'USD' | 'HKD' | 'EUR'
export type TransactionType = 'income' | 'expense'

export interface Money {
  amountCent: number
  currency: CurrencyCode
}

export interface UserProfile {
  id: string
  nickname: string
  avatarUrl?: string
}

export interface CurrentUserSession {
  user: UserProfile
  accessToken: string
  expiresIn: number
}
