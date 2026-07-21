import { http } from '../../../core/request/request'

export interface CreateTransactionParams {
  type: 'income' | 'expense'
  amountCent: number
  categoryId: string
  occurredAt: string
  remark?: string
}

export const financeRepository = {
  createTransaction(params: CreateTransactionParams) {
    return http.post('/finance/transactions', params)
  },
  listTransactions(params: Record<string, unknown>) {
    return http.get('/finance/transactions', params)
  },
  getCategories(type: 'income' | 'expense') {
    return http.get('/finance/categories', { type })
  }
}
