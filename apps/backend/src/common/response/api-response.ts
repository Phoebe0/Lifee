import type { ApiResponse } from '@lifee/shared'

export function createApiResponse<T>(data: T, traceId = 'unknown'): ApiResponse<T> {
  return {
    code: 'OK',
    message: 'success',
    data,
    traceId,
    serverTime: Date.now()
  }
}
