export function envValidationSchema(env: Record<string, unknown>) {
  const requiredStrings = ['DATABASE_URL', 'REDIS_URL', 'JWT_ACCESS_SECRET']

  for (const key of requiredStrings) {
    const value = env[key]
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }

  return env
}
