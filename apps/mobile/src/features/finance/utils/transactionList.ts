import type {
  MonthlyTransactionSummary,
  Transaction
} from '../models/transaction'

export interface TransactionSection {
  title: string
  dateKey: string
  expenseCent: number
  incomeCent: number
  data: Transaction[]
}

const DAY_IN_MS = 86_400_000

function safeDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function sectionTitle(date: Date, today: Date) {
  const difference = Math.round(
    (startOfDay(today).getTime() - startOfDay(date).getTime()) / DAY_IN_MS
  )

  if (difference === 0) return '今天'
  if (difference === 1) return '昨天'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export function formatTransactionTime(occurredAt: string) {
  const date = safeDate(occurredAt)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function sortTransactionsDescending(transactions: Transaction[]) {
  return [...transactions].sort((left, right) => {
    const occurredDifference = safeDate(right.occurredAt).getTime() - safeDate(left.occurredAt).getTime()
    if (occurredDifference !== 0) return occurredDifference
    return safeDate(right.createdAt).getTime() - safeDate(left.createdAt).getTime()
  })
}

export function groupTransactionsByDate(
  transactions: Transaction[],
  today = new Date()
): TransactionSection[] {
  const sections = new Map<string, TransactionSection>()

  for (const transaction of sortTransactionsDescending(transactions)) {
    const occurredAt = safeDate(transaction.occurredAt)
    const key = dateKey(occurredAt)
    const existing = sections.get(key)

    if (existing) {
      existing.data.push(transaction)
      if (transaction.type === 'income') existing.incomeCent += transaction.amountCent
      else existing.expenseCent += transaction.amountCent
      continue
    }

    sections.set(key, {
      title: sectionTitle(occurredAt, today),
      dateKey: key,
      expenseCent: transaction.type === 'expense' ? transaction.amountCent : 0,
      incomeCent: transaction.type === 'income' ? transaction.amountCent : 0,
      data: [transaction]
    })
  }

  return [...sections.values()]
}

export function summarizeCurrentMonth(
  transactions: Transaction[],
  today = new Date()
): MonthlyTransactionSummary {
  const currentMonthTransactions = transactions.filter(transaction => {
    const occurredAt = safeDate(transaction.occurredAt)
    return occurredAt.getFullYear() === today.getFullYear() &&
      occurredAt.getMonth() === today.getMonth()
  })

  const incomeCent = currentMonthTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amountCent, 0)
  const expenseCent = currentMonthTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amountCent, 0)

  return {
    monthLabel: `${today.getMonth() + 1}月`,
    expenseCent,
    incomeCent,
    balanceCent: incomeCent - expenseCent
  }
}
