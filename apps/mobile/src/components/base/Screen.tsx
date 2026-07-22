import type { PropsWithChildren } from 'react'
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../design/theme'

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean
  contentStyle?: StyleProp<ViewStyle>
}

export function Screen({ children, scroll = false, contentStyle }: ScreenProps) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </SafeAreaView>
    )
  }

  return <SafeAreaView style={[styles.safeArea, styles.content, contentStyle]} edges={['top']}>{children}</SafeAreaView>
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.color.background },
  content: { padding: theme.spacing[5], backgroundColor: theme.color.background }
})
