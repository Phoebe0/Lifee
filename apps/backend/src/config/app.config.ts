export interface AppConfig {
  name: string
  env: string
  port: number
}

export function appConfig(): AppConfig {
  return {
    name: process.env.APP_NAME ?? 'Lifee API',
    env: process.env.APP_ENV ?? 'dev',
    port: Number(process.env.PORT ?? 3000)
  }
}
