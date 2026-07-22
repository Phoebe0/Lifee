import { create } from 'zustand'

type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error'

interface AppState {
  bootstrapStatus: BootstrapStatus
  bootstrapError: string | null
  setBootstrapStatus: (status: BootstrapStatus, error?: string) => void
}

export const useAppStore = create<AppState>(set => ({
  bootstrapStatus: 'idle',
  bootstrapError: null,
  setBootstrapStatus: (bootstrapStatus, error) => set({
    bootstrapStatus,
    bootstrapError: error ?? null
  })
}))
