import { http } from '../../../core/request/request'

export const analyticsRepository = {
  getMonthlySummary(month?: string) {
    return http.get('/analytics/monthly-summary', month ? { month } : undefined)
  }
}
