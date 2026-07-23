import * as SecureStore from 'expo-secure-store'

const LOGIN_HINT_KEY = 'lifee.login-hint.v1'
const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/

export interface PhoneLoginHint {
  version: 1
  method: 'phone'
  e164: string
  region: 'mainland' | 'international'
  verifiedAt: string
}

function isPhoneLoginHint(value: unknown): value is PhoneLoginHint {
  if (!value || typeof value !== 'object') return false

  const hint = value as Partial<PhoneLoginHint>
  return hint.version === 1
    && hint.method === 'phone'
    && typeof hint.e164 === 'string'
    && E164_PHONE_REGEX.test(hint.e164)
    && (hint.region === 'mainland' || hint.region === 'international')
    && typeof hint.verifiedAt === 'string'
    && !Number.isNaN(Date.parse(hint.verifiedAt))
}

async function isSecureStorageAvailable() {
  try {
    return await SecureStore.isAvailableAsync()
  } catch {
    return false
  }
}

export const secureLoginHintStorage = {
  async get(): Promise<PhoneLoginHint | null> {
    if (!await isSecureStorageAvailable()) return null

    const storedValue = await SecureStore.getItemAsync(LOGIN_HINT_KEY)
    if (!storedValue) return null

    try {
      const parsedValue: unknown = JSON.parse(storedValue)
      if (isPhoneLoginHint(parsedValue)) return parsedValue
    } catch {
      // 数据损坏时按“没有登录提示”降级，不能影响应用启动。
    }

    await SecureStore.deleteItemAsync(LOGIN_HINT_KEY)
    return null
  },

  async set(hint: PhoneLoginHint): Promise<void> {
    if (!isPhoneLoginHint(hint)) {
      throw new Error('登录账号提示格式无效。')
    }
    if (!await isSecureStorageAvailable()) return

    await SecureStore.setItemAsync(LOGIN_HINT_KEY, JSON.stringify(hint), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    })
  },

  async clear(): Promise<void> {
    if (!await isSecureStorageAvailable()) return
    await SecureStore.deleteItemAsync(LOGIN_HINT_KEY)
  }
}
