import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  session: Session | null
  setSession: (session: Session | null) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  session: null,
  setSession: session => set({ session }),
  clear: () => set({ session: null })
}))
