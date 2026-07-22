import { getDatabase } from '../../../core/database/database'
import { randomUUID } from 'expo-crypto'
import type { CreateTransactionInput, Transaction } from '../models/transaction'

interface TransactionRow {
  id: string
  user_id: string | null
  category_id: string | null
  type: 'income' | 'expense'
  amount_cent: number
  currency: string
  occurred_at: string
  note: string
  sync_status: 'pending' | 'synced' | 'failed'
  created_at: string
  updated_at: string
}

const mapRow = (row: TransactionRow): Transaction => ({
  id: row.id,
  userId: row.user_id,
  categoryId: row.category_id,
  type: row.type,
  amountCent: row.amount_cent,
  currency: row.currency,
  occurredAt: row.occurred_at,
  note: row.note,
  syncStatus: row.sync_status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

export const transactionRepository = {
  async list(): Promise<Transaction[]> {
    const db = await getDatabase()
    const rows = await db.getAllAsync<TransactionRow>(`
      SELECT id, user_id, category_id, type, amount_cent, currency,
             occurred_at, note, sync_status, created_at, updated_at
      FROM transactions
      WHERE deleted_at IS NULL
      ORDER BY occurred_at DESC
    `)
    return rows.map(mapRow)
  },

  async create(input: CreateTransactionInput): Promise<Transaction> {
    if (!Number.isInteger(input.amountCent) || input.amountCent <= 0) {
      throw new Error('amountCent 必须是大于 0 的整数')
    }

    const db = await getDatabase()
    const id = randomUUID()
    const now = new Date().toISOString()
    const transaction: Transaction = {
      id,
      userId: input.userId ?? null,
      categoryId: input.categoryId ?? null,
      type: input.type,
      amountCent: input.amountCent,
      currency: input.currency ?? 'CNY',
      occurredAt: input.occurredAt,
      note: input.note?.trim() ?? '',
      syncStatus: 'pending',
      createdAt: now,
      updatedAt: now
    }

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO transactions (
          id, user_id, category_id, type, amount_cent, currency, occurred_at,
          note, sync_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        transaction.id,
        transaction.userId,
        transaction.categoryId,
        transaction.type,
        transaction.amountCent,
        transaction.currency,
        transaction.occurredAt,
        transaction.note,
        transaction.syncStatus,
        transaction.createdAt,
        transaction.updatedAt
      )
      await db.runAsync(
        `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at)
         VALUES (?, 'transaction', ?, 'upsert', ?, ?)`,
        randomUUID(),
        transaction.id,
        JSON.stringify(transaction),
        now
      )
    })

    return transaction
  }
}
