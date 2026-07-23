import * as Linking from 'expo-linking'
import { createSessionFromAuthUrl } from './authService'

let listening = false

function isAuthCallback(url: string) {
  return url.includes('auth/callback')
}

async function handleUrl(url: string | null) {
  if (!url || !isAuthCallback(url)) return
  try {
    await createSessionFromAuthUrl(url)
  } catch {
    // 深链错误由登录页面的显式流程展示；这里不记录令牌或回调参数。
  }
}

export function startAuthDeepLinkListener() {
  if (listening) return
  listening = true

  void Linking.getInitialURL().then(handleUrl)
  Linking.addEventListener('url', event => {
    void handleUrl(event.url)
  })
}
