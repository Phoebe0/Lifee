import type { YearMonthValue } from '../../../components/date/YearMonthSwitcher'
import { transactionCategories } from '../../finance/constants/categories'
import type { Transaction } from '../../finance/models/transaction'
import type {
  AnalyticsRange,
  AnalyticsSummary,
  CategorySlice,
  TrendPoint
} from '../models/analytics'

const CATEGORY_COLORS = [
  '#4F5795',
  '#7A5AC8',
  '#006879',
  '#E05C9B',
  '#E08A00',
  '#29A84A',
  '#EF5350',
  '#6870AF'
] as const

const expenseCategoryName = new Map(
  transactionCategories.expense.map(category => [category.id, category.name])
)

export function currentYearMonth(date = new Date()): YearMonthValue {
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function getMonthBounds(value: YearMonthValue) {
  return {
    start: new Date(value.year, value.month, 1),
    endExclusive: new Date(value.year, value.month + 1, 1)
  }
}

export function getReferenceEnd(value: YearMonthValue, today = new Date()) {
  const isCurrentMonth = value.year === today.getFullYear() && value.month === today.getMonth()
  if (isCurrentMonth) {
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  }
  return getMonthBounds(value).endExclusive
}

export function getAnalyticsQueryBounds(
  value: YearMonthValue,
  maximumRange: AnalyticsRange = 90,
  today = new Date()
) {
  const month = getMonthBounds(value)
  const referenceEnd = getReferenceEnd(value, today)
  const trendStart = shiftDays(referenceEnd, -maximumRange)

  return {
    start: new Date(Math.min(month.start.getTime(), trendStart.getTime())),
    endExclusive: new Date(Math.max(month.endExclusive.getTime(), referenceEnd.getTime()))
  }
}

export function filterMonthTransactions(
  transactions: Transaction[],
  value: YearMonthValue
) {
  const { start, endExclusive } = getMonthBounds(value)
  return filterTransactions(transactions, start, endExclusive)
}

export function summarizeTransactions(transactions: Transaction[]): AnalyticsSummary {
  let incomeCent = 0
  let expenseCent = 0

  for (const transaction of transactions) {
    if (transaction.type === 'income') incomeCent += transaction.amountCent
    else expenseCent += transaction.amountCent
  }

  return {
    incomeCent,
    expenseCent,
    balanceCent: incomeCent - expenseCent,
    transactionCount: transactions.length
  }
}

export function buildTrendPoints(
  transactions: Transaction[],
  range: AnalyticsRange,
  referenceEnd: Date
): TrendPoint[] {
  const bucketDays = range === 7 ? 1 : range === 30 ? 5 : 15
  const start = shiftDays(referenceEnd, -range)
  const bucketCount = Math.ceil(range / bucketDays)

  const points = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = shiftDays(start, index * bucketDays)
    return {
      label: formatShortDate(bucketStart),
      income: 0,
      expense: 0
    } satisfies TrendPoint
  })

  for (const transaction of filterTransactions(transactions, start, referenceEnd)) {
    const occurredAt = new Date(transaction.occurredAt)
    const elapsedDays = Math.floor(
      (startOfDay(occurredAt).getTime() - startOfDay(start).getTime()) / 86_400_000
    )
    const index = Math.min(points.length - 1, Math.floor(elapsedDays / bucketDays))
    const point = points[index]
    if (!point) continue

    const amount = transaction.amountCent / 100
    if (transaction.type === 'income') point.income += amount
    else point.expense += amount
  }

  return points
}

export function buildExpenseCategories(transactions: Transaction[]): CategorySlice[] {
  const expenseTransactions = transactions.filter(transaction => transaction.type === 'expense')
  const totalCent = expenseTransactions.reduce(
    (sum, transaction) => sum + transaction.amountCent,
    0
  )
  const amounts = new Map<string, number>()

  for (const transaction of expenseTransactions) {
    const categoryId = transaction.categoryId ?? 'uncategorized'
    amounts.set(categoryId, (amounts.get(categoryId) ?? 0) + transaction.amountCent)
  }

  return [...amounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([id, amountCent], index) => ({
      id,
      label: expenseCategoryName.get(id) ?? '未分类',
      value: amountCent / 100,
      amountCent,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? CATEGORY_COLORS[0],
      percentage: totalCent ? amountCent / totalCent : 0
    }))
}

export function hasTrendData(points: TrendPoint[]) {
  return points.some(point => point.income > 0 || point.expense > 0)
}

function filterTransactions(
  transactions: Transaction[],
  start: Date,
  endExclusive: Date
) {
  const startTime = start.getTime()
  const endTime = endExclusive.getTime()
  return transactions.filter(transaction => {
    const occurredAt = new Date(transaction.occurredAt).getTime()
    return occurredAt >= startTime && occurredAt < endTime
  })
}

function shiftDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatShortDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`
}
