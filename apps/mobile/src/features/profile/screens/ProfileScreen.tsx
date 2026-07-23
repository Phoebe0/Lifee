import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../application/navigation/types'
import { Screen } from '../../../components/base/Screen'
import { env, isSupabaseConfigured } from '../../../core/config/env'
import { secureLoginHintStorage } from '../../../core/security/secureLoginHintStorage'
import { supabase } from '../../../core/supabase/client'
import { theme } from '../../../design/theme'
import { maskPhone } from '../../auth/utils/authValidation'
import { useAuthStore } from '../../../stores/authStore'

type AccountAction = 'sign-out' | 'switch-account' | null

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const session = useAuthStore(state => state.session)
  const [accountAction, setAccountAction] = useState<AccountAction>(null)
  const canPreviewAuth = env.appEnv !== 'production' && !isSupabaseConfigured

  const displayName = session?.user.email
    ?? (session?.user.phone ? maskPhone(session.user.phone) : '本地模式')

  const signOut = async (forgetLoginHint: boolean) => {
    const action: AccountAction = forgetLoginHint ? 'switch-account' : 'sign-out'
    setAccountAction(action)

    try {
      if (forgetLoginHint) {
        // “切换账号”代表用户明确要求本机忘记上次验证手机号。
        await secureLoginHintStorage.clear()
      }

      const { error } = await supabase?.auth.signOut() ?? { error: null }
      if (error) throw error
      useAuthStore.getState().clear()
    } catch {
      Alert.alert(
        forgetLoginHint ? '切换账号失败' : '退出登录失败',
        '本机登录状态暂时无法安全清理，请稍后重试。'
      )
    } finally {
      setAccountAction(null)
    }
  }

  const confirmSwitchAccount = () => {
    Alert.alert(
      '切换账号',
      '将退出当前账号，并删除本机保存的手机号登录提示。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认切换',
          style: 'destructive',
          onPress: () => void signOut(true)
        }
      ]
    )
  }

  return (
    <Screen contentStyle={styles.screen}>
      <Text style={styles.title}>我的</Text>
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>L</Text></View>
        <View><Text style={styles.name}>{displayName}</Text><Text style={styles.caption}>{isSupabaseConfigured ? 'Supabase 云同步已配置' : '配置 Supabase 后开启多设备同步'}</Text></View>
      </View>
      {canPreviewAuth && (
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.previewButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('AuthPreview')}
        >
          <Text style={styles.previewButtonTitle}>预览登录流程</Text>
          <Text style={styles.previewButtonCaption}>无需后端配置，先检查页面和交互</Text>
        </Pressable>
      )}
      {session && (
        <View style={styles.accountActions}>
          <Pressable
            accessibilityRole="button"
            disabled={accountAction !== null}
            style={({ pressed }) => [
              styles.signOut,
              accountAction !== null && styles.disabled,
              pressed && styles.pressed
            ]}
            onPress={() => void signOut(false)}
          >
            {accountAction === 'sign-out' && (
              <ActivityIndicator color={theme.color.expense} size="small" />
            )}
            <Text style={styles.signOutText}>退出登录</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={accountAction !== null}
            style={({ pressed }) => [
              styles.switchAccount,
              accountAction !== null && styles.disabled,
              pressed && styles.pressed
            ]}
            onPress={confirmSwitchAccount}
          >
            {accountAction === 'switch-account' && (
              <ActivityIndicator color={theme.color.textSecondary} size="small" />
            )}
            <Text style={styles.switchAccountText}>切换账号</Text>
          </Pressable>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { gap: 20 },
  title: { color: theme.color.text, fontSize: 28, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, backgroundColor: theme.color.surface, borderRadius: theme.radius.lg },
  avatar: { alignItems: 'center', justifyContent: 'center', width: 56, height: 56, backgroundColor: theme.color.brand, borderRadius: theme.radius.full },
  avatarText: { color: theme.color.onBrand, fontSize: 22, fontWeight: '800' },
  name: { color: theme.color.text, fontSize: 17, fontWeight: '700' },
  caption: { marginTop: 5, color: theme.color.textSecondary, fontSize: 13 },
  previewButton: {
    gap: 4,
    padding: 16,
    backgroundColor: theme.auth.brandTint,
    borderWidth: 1,
    borderColor: theme.auth.brandBorder,
    borderRadius: theme.radius.lg
  },
  previewButtonTitle: { color: theme.color.brand, fontSize: 15, fontWeight: '800' },
  previewButtonCaption: { color: theme.color.textTertiary, fontSize: 12 },
  accountActions: { gap: 10 },
  signOut: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.full
  },
  signOutText: { color: theme.color.expense, fontWeight: '700' },
  switchAccount: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.full
  },
  switchAccountText: { color: theme.color.textSecondary, fontWeight: '700' },
  disabled: { opacity: theme.opacity.disabled },
  pressed: { opacity: theme.opacity.pressed }
})
