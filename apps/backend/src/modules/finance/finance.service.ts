import { Injectable } from '@nestjs/common'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { FinanceRepository } from './finance.repository'

@Injectable()
export class FinanceService {
  constructor(private readonly financeRepository: FinanceRepository) {}

  createTransaction(userId: string, dto: CreateTransactionDto) {
    return this.financeRepository.createTransaction(userId, dto)
  }

  listTransactions(userId: string) {
    return this.financeRepository.listTransactions(userId)
  }
}
