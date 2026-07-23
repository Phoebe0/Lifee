import { AppState, Platform } from 'react-native'
import { createClient, processLock } from '@supabase/supabase-js'
import { env, isSupabaseConfigured } from '../config/env'
import { secureSessionStorage } from '../security/secureSessionStorage'

export const supabase = isSupabaseConfigured
  ? createClient(env.supabaseUrl!, env.supabaseAnonKey!, {
      auth: {
        storage: secureSessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock
      }
    })
  : null

// 移动端只在前台刷新令牌，避免 App 后台运行时产生无意义的网络请求。
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') supabase.auth.startAutoRefresh()
    else supabase.auth.stopAutoRefresh()
  })
}
