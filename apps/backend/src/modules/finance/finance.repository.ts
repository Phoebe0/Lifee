import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'

@Injectable()
export class FinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  createTransaction(userId: string, data: {
    type: 'income' | 'expense'
    amountCent: number
    categoryId: string
    occurredAt: string
    remark?: string
  }) {
    const occurredDate = data.occurredAt.slice(0, 10)
    const occurredMonth = data.occurredAt.slice(0, 7)

    return this.prisma.transaction.create({
      data: {
        userId,
        categoryId: data.categoryId,
        type: data.type,
        amountCent: data.amountCent,
        currency: 'CNY',
        occurredAt: new Date(data.occurredAt),
        occurredDate: new Date(occurredDate),
        occurredMonth,
        remark: data.remark,
        source: 'manual'
      } satisfies Prisma.TransactionUncheckedCreateInput
    })
  }

  listTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null
      },
      orderBy: {
        occurredAt: 'desc'
      }
    })
  }
}
