import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { cache } from '../core/cache/cache'
import type { FinanceCategory, FinanceType, LocalTransaction } from '../features/finance/models/transaction'

const STORAGE_KEY = 'finance:transactions'

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<LocalTransaction[]>(cache.get<LocalTransaction[]>(STORAGE_KEY) ?? [])

  const currentMonthTransactions = computed(() => {
    const month = dayjs().format('YYYY-MM')
    return transactions.value
      .filter(item => item.occurredAt.startsWith(month))
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.createdAt.localeCompare(a.createdAt))
  })

  const summary = computed(() => {
    const incomeCent = currentMonthTransactions.value
      .filter(item => item.type === 'income')
      .reduce((total, item) => total + item.amountCent, 0)
    const expenseCent = currentMonthTransactions.value
      .filter(item => item.type === 'expense')
      .reduce((total, item) => total + item.amountCent, 0)

    return {
      incomeCent,
      expenseCent,
      balanceCent: incomeCent - expenseCent,
      count: currentMonthTransactions.value.length
    }
  })

  const allTimeSummary = computed(() => ({
    incomeCent: transactions.value.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amountCent, 0),
    expenseCent: transactions.value.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amountCent, 0),
    count: transactions.value.length
  }))

  function addTransaction(input: {
    type: FinanceType
    amountCent: number
    category: FinanceCategory
    occurredAt: string
    remark?: string
  }) {
    const createdAt = new Date().toISOString()
    const item: LocalTransaction = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: input.type,
      amountCent: input.amountCent,
      categoryId: input.category.id,
      categoryName: input.category.name,
      categoryGlyph: input.category.glyph,
      occurredAt: input.occurredAt,
      remark: input.remark?.trim() ?? '',
      createdAt
    }
    transactions.value.unshift(item)
    cache.set(STORAGE_KEY, transactions.value)
    return item
  }

  return { transactions, currentMonthTransactions, summary, allTimeSummary, addTransaction }
})
