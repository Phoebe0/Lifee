import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import type { Transaction } from '../models/transaction'
import { transactionRepository } from '../repositories/transactionRepository'

export function useTransactionList() {
  const requestId = useRef(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    const currentRequestId = ++requestId.current
    if (mode === 'refresh') setIsRefreshing(true)
    else setIsLoading(true)

    try {
      const result = await transactionRepository.list()
      if (currentRequestId !== requestId.current) return
      setTransactions(result)
      setError(null)
    } catch (loadError) {
      if (currentRequestId !== requestId.current) return
      setError(loadError instanceof Error ? loadError.message : '账单加载失败，请稍后重试。')
    } finally {
      if (currentRequestId !== requestId.current) return
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useFocusEffect(useCallback(() => {
    void load()
    return () => {
      requestId.current += 1
    }
  }, [load]))

  const remove = useCallback(async (transactionId: string) => {
    setDeletingId(transactionId)
    try {
      await transactionRepository.remove(transactionId)
      setTransactions(current => current.filter(transaction => transaction.id !== transactionId))
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
    isLoading,
    isRefreshing,
    deletingId,
    error,
    refresh: () => load('refresh'),
    retry: () => load('initial'),
    remove
  }
}
