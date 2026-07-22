import { initializeDatabase } from '../../core/database/database'
import { supabase } from '../../core/supabase/client'
import { useAppStore } from '../../stores/appStore'
import { useAuthStore } from '../../stores/authStore'

let initialized = false

export async function initializeApp() {
  if (initialized) return
  initialized = true
  const appStore = useAppStore.getState()
  appStore.setBootstrapStatus('loading')

  try {
    await initializeDatabase()

    if (supabase) {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      useAuthStore.getState().setSession(data.session)
      supabase.auth.onAuthStateChange((_event, session) => {
        useAuthStore.getState().setSession(session)
      })
    }

    useAppStore.getState().setBootstrapStatus('ready')
  } catch (error) {
    initialized = false
    const message = error instanceof Error ? error.message : '未知启动错误'
    useAppStore.getState().setBootstrapStatus('error', message)
  }
}
