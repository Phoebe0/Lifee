import { z } from 'zod'

const environmentSchema = z.object({
  appEnv: z.enum(['development', 'preview', 'production']).default('development'),
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().min(1).optional()
})

const emptyToUndefined = (value: string | undefined) => value?.trim() || undefined

export const env = environmentSchema.parse({
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  supabaseUrl: emptyToUndefined(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: emptyToUndefined(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY)
})

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)
