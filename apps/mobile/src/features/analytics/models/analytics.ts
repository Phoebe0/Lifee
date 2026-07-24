export type AnalyticsRange = 7 | 30 | 90

export interface AnalyticsSummary {
  incomeCent: number
  expenseCent: number
  balanceCent: number
  transactionCount: number
}

export type TrendPoint = Record<string, unknown> & {
  label: string
  income: number
  expense: number
}

export type CategorySlice = Record<string, unknown> & {
  id: string
  label: string
  value: number
  amountCent: number
  color: string
  percentage: number
}
