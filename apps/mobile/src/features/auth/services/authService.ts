import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import type { Provider } from '@supabase/supabase-js'
import { env } from '../../../core/config/env'
import { supabase } from '../../../core/supabase/client'
import type { SocialProvider } from '../models/auth'

WebBrowser.maybeCompleteAuthSession()

const redirectTo = env.authRedirectUrl ?? makeRedirectUri({
  scheme: 'lifee',
  path: 'auth/callback'
})

function getClient() {
  if (!supabase) throw new Error('云端登录尚未配置，请先补充 Supabase 环境变量。')
  return supabase
}

function readAuthParam(url: URL, key: string) {
  const queryValue = url.searchParams.get(key)
  if (queryValue) return queryValue
  return new URLSearchParams(url.hash.replace(/^#/, '')).get(key)
}

export async function createSessionFromAuthUrl(callbackUrl: string) {
  const client = getClient()
  const url = new URL(callbackUrl)
  const errorDescription = readAuthParam(url, 'error_description')
  if (errorDescription) throw new Error(decodeURIComponent(errorDescription))

  // PKCE 回调返回 code；旧式 implicit 回调返回 access_token/refresh_token。
  const code = readAuthParam(url, 'code')
  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code)
    if (error) throw error
    return data.session
  }

  const accessToken = readAuthParam(url, 'access_token')
  const refreshToken = readAuthParam(url, 'refresh_token')
  if (!accessToken || !refreshToken) return null

  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  })
  if (error) throw error
  return data.session
}

async function signInWithSocialProvider(provider: SocialProvider) {
  const client = getClient()
  const providerId = provider === 'github' ? 'github' : env.wechatOAuthProvider
  const { data, error } = await client.auth.signInWithOAuth({
    provider: providerId as Provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true
    }
  })

  if (error) throw error
  if (!data.url) throw new Error('登录服务没有返回授权地址。')

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
  if (result.type === 'success') return createSessionFromAuthUrl(result.url)
  if (result.type === 'cancel' || result.type === 'dismiss') return null
  throw new Error('授权窗口未能正常完成，请重试。')
}

export const authService = {
  redirectTo,

  async sendPhoneOtp(phone: string) {
    const { error } = await getClient().auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true }
    })
    if (error) throw error
  },

  async verifyPhoneOtp(phone: string, token: string) {
    const { data, error } = await getClient().auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
    if (error) throw error
    return data.session
  },

  async sendEmailOtp(email: string) {
    const { error } = await getClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true
      }
    })
    if (error) throw error
  },

  async verifyEmailOtp(email: string, token: string) {
    const { data, error } = await getClient().auth.verifyOtp({
      email,
      token,
      type: 'email'
    })
    if (error) throw error
    return data.session
  },

  signInWithSocialProvider
}
