import { Injectable } from '@nestjs/common'

@Injectable()
export class AnalyticsService {
  getMonthlySummary() {
    return {
      month: new Date().toISOString().slice(0, 7),
      incomeCent: 0,
      expenseCent: 0,
      netCent: 0,
      currency: 'CNY'
    }
  }
}
