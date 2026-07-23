import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../application/navigation/types'
import { Screen } from '../../../components/base/Screen'
import { env, isSupabaseConfigured } from '../../../core/config/env'
import { supabase } from '../../../core/supabase/client'
import { theme } from '../../../design/theme'
import { useAuthStore } from '../../../stores/authStore'

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const session = useAuthStore(state => state.session)
  const canPreviewAuth = env.appEnv !== 'production' && !isSupabaseConfigured

  const signOut = async () => {
    await supabase?.auth.signOut()
    useAuthStore.getState().clear()
  }

  return (
    <Screen contentStyle={styles.screen}>
      <Text style={styles.title}>我的</Text>
      <View style={styles.card}>
        <View style={styles.avatar}><Text style={styles.avatarText}>L</Text></View>
        <View><Text style={styles.name}>{session?.user.email ?? '本地模式'}</Text><Text style={styles.caption}>{isSupabaseConfigured ? 'Supabase 云同步已配置' : '配置 Supabase 后开启多设备同步'}</Text></View>
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
      {session && <Pressable accessibilityRole="button" style={styles.signOut} onPress={() => void signOut()}><Text style={styles.signOutText}>退出登录</Text></Pressable>}
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
  signOut: { alignItems: 'center', padding: 14, borderWidth: 1, borderColor: theme.color.border, borderRadius: theme.radius.full },
  signOutText: { color: theme.color.expense, fontWeight: '700' },
  pressed: { opacity: theme.opacity.pressed }
})
