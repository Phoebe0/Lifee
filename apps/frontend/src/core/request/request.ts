import { getEnvConfig } from '../config/env'
import { logger } from '../logger/logger'
import { cache } from '../cache/cache'
import type { ApiResponse } from '@lifee/shared'

export interface RequestOptions {
  showErrorToast?: boolean
  skipAuth?: boolean
  cacheKey?: string
}

type RequestData = UniApp.RequestOptions['data']

export async function request<T>(
  options: UniApp.RequestOptions & RequestOptions
): Promise<T> {
  const config = getEnvConfig()
  const token = options.skipAuth ? '' : cache.get<string>('auth:token') ?? ''

  return new Promise<T>((resolve, reject) => {
    uni.request({
      ...options,
      url: `${config.apiBaseURL}${options.url}`,
      timeout: options.timeout ?? config.requestTimeout,
      header: {
        ...(options.header ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'x-trace-id': `lifee-${Date.now()}`
      },
      success: (result) => {
        const payload = result.data as ApiResponse<T>

        if (result.statusCode >= 200 && result.statusCode < 300 && payload.code === 'OK') {
          resolve(payload.data)
          return
        }

        logger.warn('request failed', {
          url: options.url,
          statusCode: result.statusCode,
          code: payload?.code
        })
        reject(new Error(payload?.message ?? 'request failed'))
      },
      fail: (error) => {
        logger.error('network error', { url: options.url, error })
        reject(error)
      }
    })
  })
}

export const http = {
  get<T>(url: string, data?: Record<string, unknown>, options?: RequestOptions) {
    return request<T>({
      url,
      method: 'GET',
      data,
      ...options
    })
  },
  post<T>(url: string, data?: RequestData, options?: RequestOptions) {
    return request<T>({
      url,
      method: 'POST',
      data,
      ...options
    })
  },
  put<T>(url: string, data?: RequestData, options?: RequestOptions) {
    return request<T>({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }
}
