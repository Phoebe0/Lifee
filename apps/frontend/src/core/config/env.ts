import type { AppEnv } from '@lifee/shared'

export interface AppEnvConfig {
  env: AppEnv
  apiBaseURL: string
  enableLog: boolean
  requestTimeout: number
}

const defaultConfig: AppEnvConfig = {
  env: 'dev',
  apiBaseURL: 'http://localhost:3000/api/v1',
  enableLog: true,
  requestTimeout: 15000
}

export function getEnvConfig(): AppEnvConfig {
  return {
    ...defaultConfig,
    env: ((import.meta.env.VITE_APP_ENV as AppEnv | undefined) ?? defaultConfig.env),
    apiBaseURL: import.meta.env.VITE_API_BASE_URL ?? defaultConfig.apiBaseURL,
    enableLog: (import.meta.env.VITE_ENABLE_LOG ?? 'true') === 'true',
    requestTimeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT ?? defaultConfig.requestTimeout)
  }
}
