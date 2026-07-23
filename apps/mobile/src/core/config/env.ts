import { z } from 'zod'

const environmentSchema = z.object({
  appEnv: z.enum(['development', 'preview', 'production']).default('development'),
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().min(1).optional(),
  authRedirectUrl: z.string().url().optional(),
  wechatOAuthProvider: z.string().regex(/^custom:[a-z0-9:-]+$/).default('custom:wechat'),
  termsUrl: z.string().url().optional(),
  privacyUrl: z.string().url().optional()
})

const emptyToUndefined = (value: string | undefined) => value?.trim() || undefined

export const env = environmentSchema.parse({
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  supabaseUrl: emptyToUndefined(process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: emptyToUndefined(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  authRedirectUrl: emptyToUndefined(process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL),
  wechatOAuthProvider: emptyToUndefined(process.env.EXPO_PUBLIC_WECHAT_OAUTH_PROVIDER),
  termsUrl: emptyToUndefined(process.env.EXPO_PUBLIC_TERMS_URL),
  privacyUrl: emptyToUndefined(process.env.EXPO_PUBLIC_PRIVACY_URL)
})

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)
