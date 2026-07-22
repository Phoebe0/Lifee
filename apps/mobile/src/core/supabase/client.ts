import { createClient } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '../config/env'
import { secureSessionStorage } from '../security/secureSessionStorage'

export const supabase = isSupabaseConfigured
  ? createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: {
        storage: secureSessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null
