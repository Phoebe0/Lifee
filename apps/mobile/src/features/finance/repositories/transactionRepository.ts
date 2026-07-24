import { getDatabase } from '../../../core/database/database'
import { randomUUID } from 'expo-crypto'
import type {
  CreateTransactionInput,
  MonthlyTransactionSummary,
  Transaction,
  TransactionPageQuery,
  TransactionPageResult
} from '../models/transaction'

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

interface TransactionCountRow {
  total: number
}

interface TransactionSummaryRow {
  income_cent: number
  expense_cent: number
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

const validatePagination = ({ page, pagSize }: TransactionPageQuery) => {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error('page 必须是大于等于 1 的整数。')
  }
  if (!Number.isInteger(pagSize) || pagSize < 1 || pagSize > 100) {
    throw new Error('pagSize 必须是 1 到 100 之间的整数。')
  }
}

export const transactionRepository = {
  async list(): Promise<Transaction[]> {
    const db = await getDatabase()
    const rows = await db.getAllAsync<TransactionRow>(`
      SELECT ${transactionColumns}
      FROM transactions
      WHERE deleted_at IS NULL
      ORDER BY occurred_at DESC, created_at DESC
    `)
    return rows.map(mapRow)
  },

  async listBetween(startInclusive: Date, endExclusive: Date): Promise<Transaction[]> {
    if (
      Number.isNaN(startInclusive.getTime()) ||
      Number.isNaN(endExclusive.getTime()) ||
      startInclusive >= endExclusive
    ) {
      throw new Error('交易查询日期范围无效。')
    }

    const db = await getDatabase()
    const rows = await db.getAllAsync<TransactionRow>(`
      SELECT ${transactionColumns}
      FROM transactions
      WHERE deleted_at IS NULL
        AND occurred_at >= ?
        AND occurred_at < ?
      ORDER BY occurred_at ASC, created_at ASC
    `, startInclusive.toISOString(), endExclusive.toISOString())

    return rows.map(mapRow)
  },

  async listPage(query: TransactionPageQuery): Promise<TransactionPageResult> {
    validatePagination(query)

    const db = await getDatabase()
    const offset = (query.page - 1) * query.pagSize

    // 计数与分页都在数据库层完成，前端不会先读取全表再切片。
    const [countRow, rows] = await Promise.all([
      db.getFirstAsync<TransactionCountRow>(`
        SELECT COUNT(*) AS total
        FROM transactions
        WHERE deleted_at IS NULL
      `),
      db.getAllAsync<TransactionRow>(`
        SELECT ${transactionColumns}
        FROM transactions
        WHERE deleted_at IS NULL
        ORDER BY occurred_at DESC, created_at DESC, id DESC
        LIMIT ? OFFSET ?
      `, query.pagSize, offset)
    ])

    const total = countRow?.total ?? 0
    return {
      items: rows.map(mapRow),
      page: query.page,
      pageSize: query.pagSize,
      total,
      hasMore: offset + rows.length < total
    }
  },

  async getCurrentMonthSummary(referenceDate = new Date()): Promise<MonthlyTransactionSummary> {
    const db = await getDatabase()
    const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
    const nextMonthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1)
    const row = await db.getFirstAsync<TransactionSummaryRow>(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cent ELSE 0 END), 0) AS income_cent,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount_cent ELSE 0 END), 0) AS expense_cent
      FROM transactions
      WHERE deleted_at IS NULL
        AND occurred_at >= ?
        AND occurred_at < ?
    `, monthStart.toISOString(), nextMonthStart.toISOString())

    const incomeCent = row?.income_cent ?? 0
    const expenseCent = row?.expense_cent ?? 0
    return {
      monthLabel: `${referenceDate.getMonth() + 1}月`,
      incomeCent,
      expenseCent,
      balanceCent: incomeCent - expenseCent
    }
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
