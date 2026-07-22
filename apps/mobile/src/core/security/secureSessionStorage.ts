import * as SecureStore from 'expo-secure-store'

const prefix = 'lifee.session.'

export const secureSessionStorage = {
  getItem(key: string) {
    return SecureStore.getItemAsync(`${prefix}${key}`)
  },
  setItem(key: string, value: string) {
    return SecureStore.setItemAsync(`${prefix}${key}`, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    })
  },
  removeItem(key: string) {
    return SecureStore.deleteItemAsync(`${prefix}${key}`)
  }
}
