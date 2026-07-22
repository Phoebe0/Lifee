import 'react-native-url-polyfill/auto'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AppNavigator } from './src/application/navigation/AppNavigator'
import { initializeApp } from './src/application/bootstrap/initializeApp'
import { useAppStore } from './src/stores/appStore'
import { theme } from './src/design/theme'

export default function App() {
  const bootstrapStatus = useAppStore(state => state.bootstrapStatus)
  const bootstrapError = useAppStore(state => state.bootstrapError)

  useEffect(() => {
    void initializeApp()
  }, [])

  if (bootstrapStatus !== 'ready') {
    return (
      <SafeAreaProvider>
        <View style={styles.bootstrap}>
          {bootstrapStatus === 'error' ? (
            <>
              <Text style={styles.title}>Lifee 启动失败</Text>
              <Text style={styles.message}>{bootstrapError}</Text>
            </>
          ) : (
            <>
              <ActivityIndicator color={theme.color.brand} size="large" />
              <Text style={styles.message}>正在准备你的本地账本…</Text>
            </>
          )}
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  bootstrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[4],
    padding: theme.spacing[6],
    backgroundColor: theme.color.background
  },
  title: {
    color: theme.color.text,
    fontSize: 22,
    fontWeight: '700'
  },
  message: {
    color: theme.color.textSecondary,
    fontSize: 15,
    textAlign: 'center'
  }
})
