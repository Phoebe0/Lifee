const storagePrefix = 'lifee:'

function withKey(key: string) {
  return `${storagePrefix}${key}`
}

export const cache = {
  get<T>(key: string): T | null {
    try {
      return uni.getStorageSync(withKey(key)) as T | null
    } catch {
      return null
    }
  },
  set<T>(key: string, value: T) {
    uni.setStorageSync(withKey(key), value)
  },
  remove(key: string) {
    uni.removeStorageSync(withKey(key))
  },
  clear() {
    uni.clearStorageSync()
  }
}
