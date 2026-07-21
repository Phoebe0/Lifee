import { Injectable } from '@nestjs/common'

@Injectable()
export class HealthService {
  getStatus() {
    return {
      status: 'ok',
      service: 'lifee-api',
      timestamp: new Date().toISOString()
    }
  }
}
