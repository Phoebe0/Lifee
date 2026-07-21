export interface TransactionEntity {
  id: string
  userId: string
  categoryId: string
  type: 'income' | 'expense'
  amountCent: number
  currency: string
  occurredAt: string
  occurredDate: string
  occurredMonth: string
  remark: string | null
  source: 'manual' | 'import' | 'ai'
  createdAt: string
  updatedAt: string
}
