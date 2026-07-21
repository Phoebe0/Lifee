import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { cache } from '../core/cache/cache'
import type { UserProfile } from '@lifee/shared'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(cache.get<string>('auth:token') ?? '')
  const user = ref<UserProfile | null>(cache.get<UserProfile>('auth:user'))

  const isLoggedIn = computed(() => Boolean(token.value && user.value))

  function setSession(nextToken: string, nextUser: UserProfile) {
    token.value = nextToken
    user.value = nextUser
    cache.set('auth:token', nextToken)
    cache.set('auth:user', nextUser)
  }

  function clearSession() {
    token.value = ''
    user.value = null
    cache.remove('auth:token')
    cache.remove('auth:user')
  }

  return {
    token,
    user,
    isLoggedIn,
    setSession,
    clearSession
  }
})
