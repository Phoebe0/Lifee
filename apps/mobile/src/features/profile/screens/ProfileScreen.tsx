import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Screen } from '../../../components/base/Screen'
import { isSupabaseConfigured } from '../../../core/config/env'
import { supabase } from '../../../core/supabase/client'
import { theme } from '../../../design/theme'
import { useAuthStore } from '../../../stores/authStore'

export function ProfileScreen() {
  const session = useAuthStore(state => state.session)

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
      {session && <Pressable accessibilityRole="button" style={styles.signOut} onPress={() => void signOut()}><Text style={styles.signOutText}>退出登录</Text></Pressable>}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { gap: 20 },
  title: { color: theme.color.text, fontSize: 28, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, backgroundColor: theme.color.surface, borderRadius: theme.radius.lg },
  avatar: { alignItems: 'center', justifyContent: 'center', width: 56, height: 56, backgroundColor: theme.color.brand, borderRadius: theme.radius.full },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  name: { color: theme.color.text, fontSize: 17, fontWeight: '700' },
  caption: { marginTop: 5, color: theme.color.textSecondary, fontSize: 13 },
  signOut: { alignItems: 'center', padding: 14, borderWidth: 1, borderColor: theme.color.border, borderRadius: theme.radius.full },
  signOutText: { color: theme.color.expense, fontWeight: '700' }
})
