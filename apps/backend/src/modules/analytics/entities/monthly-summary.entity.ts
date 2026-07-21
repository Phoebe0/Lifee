export interface MonthlySummaryEntity {
  id: string
  userId: string
  month: string
  currency: string
  incomeCent: bigint
  expenseCent: bigint
  netCent: bigint
  transactionCount: number
  calculatedAt: string
  createdAt: string
  updatedAt: string
}
