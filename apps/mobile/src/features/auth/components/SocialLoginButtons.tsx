import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { theme } from '../../../design/theme'
import type { SocialProvider } from '../models/auth'
import { GitHubIcon, WechatIcon } from './AuthIcons'

interface SocialLoginButtonsProps {
  loadingProvider: SocialProvider | null
  disabled?: boolean
  onPress: (provider: SocialProvider) => void
}

export function SocialLoginButtons({
  loadingProvider,
  disabled = false,
  onPress
}: SocialLoginButtonsProps) {
  return (
    <View style={styles.row}>
      <SocialButton
        label="微信登录"
        loading={loadingProvider === 'wechat'}
        disabled={disabled}
        icon={<WechatIcon color="#1FAF5A" />}
        onPress={() => onPress('wechat')}
      />
      <SocialButton
        label="GitHub"
        loading={loadingProvider === 'github'}
        disabled={disabled}
        icon={<GitHubIcon color={theme.color.text} />}
        onPress={() => onPress('github')}
      />
    </View>
  )
}

interface SocialButtonProps {
  label: string
  icon: React.ReactNode
  loading: boolean
  disabled: boolean
  onPress: () => void
}

function SocialButton({ label, icon, loading, disabled, onPress }: SocialButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      {loading ? <ActivityIndicator color={theme.color.brand} size="small" /> : icon}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: theme.spacing[3] },
  button: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.auth.glassStrong,
    borderWidth: 1,
    borderColor: theme.color.borderOverlay,
    borderRadius: theme.radius.full
  },
  label: { color: theme.color.text, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: theme.opacity.disabled },
  pressed: { opacity: theme.opacity.pressed }
})
