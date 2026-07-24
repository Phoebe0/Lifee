import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import type {
  MonthlyTransactionSummary,
  Transaction
} from '../models/transaction'
import { transactionRepository } from '../repositories/transactionRepository'

const TRANSACTION_PAGE_SIZE = 20
const LOAD_MORE_FEEDBACK_MS = 420

const wait = (duration: number) => new Promise<void>(resolve => {
  setTimeout(resolve, duration)
})

const createEmptySummary = (): MonthlyTransactionSummary => {
  const now = new Date()
  return {
    monthLabel: `${now.getMonth() + 1}月`,
    expenseCent: 0,
    incomeCent: 0,
    balanceCent: 0
  }
}

export function useTransactionList() {
  const requestId = useRef(0)
  const currentPage = useRef(0)
  const hasMoreRef = useRef(true)
  const loadingMoreRef = useRef(false)
  const loadingFirstPageRef = useRef(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<MonthlyTransactionSummary>(createEmptySummary)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (
    mode: 'initial' | 'refresh' | 'more' = 'initial'
  ) => {
    if (mode === 'more') {
      if (
        currentPage.current < 1 ||
        !hasMoreRef.current ||
        loadingMoreRef.current ||
        loadingFirstPageRef.current
      ) return
      loadingMoreRef.current = true
      setIsLoadingMore(true)
    } else {
      loadingFirstPageRef.current = true
    }

    const currentRequestId = ++requestId.current
    if (mode === 'refresh') setIsRefreshing(true)
    else if (mode === 'initial') setIsLoading(true)

    try {
      const page = mode === 'more' ? currentPage.current + 1 : 1
      const pageRequest = transactionRepository.listPage({
        page,
        pagSize: TRANSACTION_PAGE_SIZE
      })
      const [result, nextSummary] = await Promise.all([
        mode === 'more'
          ? Promise.all([pageRequest, wait(LOAD_MORE_FEEDBACK_MS)])
              .then(([pageResult]) => pageResult)
          : pageRequest,
        mode === 'more'
          ? Promise.resolve(null)
          : transactionRepository.getCurrentMonthSummary()
      ])

      if (currentRequestId !== requestId.current) return
      setTransactions(current => mode === 'more'
        ? [
            ...current,
            ...result.items.filter(item =>
              !current.some(existing => existing.id === item.id)
            )
          ]
        : result.items
      )
      if (nextSummary) setSummary(nextSummary)
      currentPage.current = result.page
      hasMoreRef.current = result.hasMore
      setHasMore(result.hasMore)
      setTotal(result.total)
      setError(null)
    } catch (loadError) {
      if (currentRequestId !== requestId.current) return
      setError(loadError instanceof Error ? loadError.message : '账单加载失败，请稍后重试。')
    } finally {
      if (currentRequestId !== requestId.current) return
      setIsLoading(false)
      setIsRefreshing(false)
      setIsLoadingMore(false)
      loadingMoreRef.current = false
      loadingFirstPageRef.current = false
    }
  }, [])

  useFocusEffect(useCallback(() => {
    void load()
    return () => {
      requestId.current += 1
      loadingMoreRef.current = false
      loadingFirstPageRef.current = false
    }
  }, [load]))

  const remove = useCallback(async (transactionId: string) => {
    setDeletingId(transactionId)
    try {
      await transactionRepository.remove(transactionId)
      const [firstPage, nextSummary] = await Promise.all([
        transactionRepository.listPage({
          page: 1,
          pagSize: TRANSACTION_PAGE_SIZE
        }),
        transactionRepository.getCurrentMonthSummary()
      ])

      // OFFSET 分页删除数据后会发生位移，回到第一页可避免下一页漏掉一条记录。
      setTransactions(firstPage.items)
      setTotal(firstPage.total)
      setSummary(nextSummary)
      currentPage.current = firstPage.page
      hasMoreRef.current = firstPage.hasMore
      setHasMore(firstPage.hasMore)
      setError(null)
    } catch (removeError) {
      const message = removeError instanceof Error ? removeError.message : '删除失败，请稍后重试。'
      setError(message)
      throw removeError
    } finally {
      setDeletingId(null)
    }
  }, [])

  return {
    transactions,
    summary,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    total,
    deletingId,
    error,
    refresh: () => load('refresh'),
    retry: () => load('initial'),
    loadMore: () => load('more'),
    remove
  }
}
