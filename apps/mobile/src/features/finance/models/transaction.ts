export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  userId: string | null
  categoryId: string | null
  type: TransactionType
  amountCent: number
  currency: string
  occurredAt: string
  note: string
  syncStatus: 'pending' | 'synced' | 'failed'
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionInput {
  userId?: string | null
  categoryId?: string | null
  type: TransactionType
  amountCent: number
  currency?: string
  occurredAt: string
  note?: string
}

export interface TransactionPageQuery {
  page: number
  pagSize: number
}

export interface TransactionPageResult {
  items: Transaction[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface MonthlyTransactionSummary {
  monthLabel: string
  expenseCent: number
  incomeCent: number
  balanceCent: number
}
