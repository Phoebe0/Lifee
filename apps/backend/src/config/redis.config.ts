export interface RedisConfig {
  url: string
  keyPrefix: string
}

export function redisConfig(): RedisConfig {
  return {
    url: process.env.REDIS_URL ?? '',
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'lifee:dev'
  }
}
