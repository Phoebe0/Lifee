import { Body, Controller, Get, Post } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { AuthUser } from '../../common/decorators/current-user.decorator'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { FinanceService } from './finance.service'

@Controller('api/v1/finance/transactions')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTransactionDto) {
    return this.financeService.createTransaction(user.id, dto)
  }

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.financeService.listTransactions(user.id)
  }
}
