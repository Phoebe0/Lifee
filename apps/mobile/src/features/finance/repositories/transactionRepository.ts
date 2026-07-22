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

const transactionColumns = `
  id, user_id, category_id, type, amount_cent, currency,
  occurred_at, note, sync_status, created_at, updated_at
`

const validateInput = (input: CreateTransactionInput) => {
  if (!Number.isInteger(input.amountCent) || input.amountCent <= 0) {
    throw new Error('金额必须大于 0。')
  }
  if (input.amountCent > 9_999_999_999) {
    throw new Error('单笔金额不能超过 ¥99,999,999.99。')
  }
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
      SELECT ${transactionColumns}
      FROM transactions
      WHERE deleted_at IS NULL
      ORDER BY occurred_at DESC
    `)
    return rows.map(mapRow)
  },

  async getById(id: string): Promise<Transaction | null> {
    const db = await getDatabase()
    const row = await db.getFirstAsync<TransactionRow>(`
      SELECT ${transactionColumns}
      FROM transactions
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `, id)
    return row ? mapRow(row) : null
  },

  async create(input: CreateTransactionInput): Promise<Transaction> {
    validateInput(input)

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
  },

  async update(id: string, input: CreateTransactionInput): Promise<Transaction> {
    validateInput(input)
    const db = await getDatabase()
    const row = await db.getFirstAsync<TransactionRow>(`
      SELECT ${transactionColumns}
      FROM transactions
      WHERE id = ? AND deleted_at IS NULL
      LIMIT 1
    `, id)
    if (!row) throw new Error('这笔记录不存在或已被删除。')

    const current = mapRow(row)
    const now = new Date().toISOString()
    const transaction: Transaction = {
      ...current,
      userId: input.userId ?? current.userId,
      categoryId: input.categoryId ?? null,
      type: input.type,
      amountCent: input.amountCent,
      currency: input.currency ?? current.currency,
      occurredAt: input.occurredAt,
      note: input.note?.trim() ?? '',
      syncStatus: 'pending',
      updatedAt: now
    }

    await db.withTransactionAsync(async () => {
      const result = await db.runAsync(
        `UPDATE transactions
         SET user_id = ?, category_id = ?, type = ?, amount_cent = ?, currency = ?,
             occurred_at = ?, note = ?, sync_status = 'pending', updated_at = ?
         WHERE id = ? AND deleted_at IS NULL`,
        transaction.userId,
        transaction.categoryId,
        transaction.type,
        transaction.amountCent,
        transaction.currency,
        transaction.occurredAt,
        transaction.note,
        transaction.updatedAt,
        transaction.id
      )
      if (result.changes !== 1) throw new Error('更新失败，这笔记录可能已被删除。')
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
  },

  async remove(id: string): Promise<void> {
    const db = await getDatabase()
    const now = new Date().toISOString()

    await db.withTransactionAsync(async () => {
      const result = await db.runAsync(
        `UPDATE transactions
         SET deleted_at = ?, sync_status = 'pending', updated_at = ?
         WHERE id = ? AND deleted_at IS NULL`,
        now,
        now,
        id
      )
      if (result.changes !== 1) throw new Error('这笔记录不存在或已被删除。')
      await db.runAsync(
        `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, created_at)
         VALUES (?, 'transaction', ?, 'delete', ?, ?)`,
        randomUUID(),
        id,
        JSON.stringify({ id, deletedAt: now }),
        now
      )
    })
  }
}
