import type { PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { theme } from '../../../design/theme'

export function AuthGlassCard({ children }: PropsWithChildren) {
  return (
    <View style={styles.shell}>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={42}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    backgroundColor: theme.auth.glassSurface,
    borderWidth: 1,
    borderColor: theme.auth.glassBorder,
    borderRadius: 34,
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 34,
    elevation: 8
  },
  content: {
    gap: theme.spacing[4],
    padding: theme.spacing[5]
  }
})
