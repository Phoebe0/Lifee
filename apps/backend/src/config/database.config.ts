export interface DatabaseConfig {
  url: string
}

export function databaseConfig(): DatabaseConfig {
  return {
    url: process.env.DATABASE_URL ?? ''
  }
}
