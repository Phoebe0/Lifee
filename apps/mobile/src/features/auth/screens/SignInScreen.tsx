import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Screen } from '../../../components/base/Screen'
import { supabase } from '../../../core/supabase/client'
import { theme } from '../../../design/theme'

export function SignInScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const sendOtp = async () => {
    if (!email.includes('@')) {
      Alert.alert('邮箱不正确', '请输入有效邮箱地址。')
      return
    }
    setLoading(true)
    const { error } = await supabase!.auth.signInWithOtp({ email: email.trim() })
    setLoading(false)
    if (error) Alert.alert('发送失败', error.message)
    else Alert.alert('邮件已发送', '请打开邮件中的登录链接。')
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.logo}><Text style={styles.logoText}>L</Text></View>
      <Text style={styles.title}>登录 Lifee</Text>
      <Text style={styles.caption}>使用邮箱验证码登录并开启云同步。</Text>
      <TextInput accessibilityLabel="邮箱" autoCapitalize="none" keyboardType="email-address" placeholder="name@example.com" value={email} onChangeText={setEmail} style={styles.input} />
      <Pressable accessibilityRole="button" disabled={loading} style={styles.button} onPress={() => void sendOtp()}><Text style={styles.buttonText}>{loading ? '发送中…' : '发送登录邮件'}</Text></Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', gap: 16 },
  logo: { alignItems: 'center', justifyContent: 'center', width: 72, height: 72, backgroundColor: theme.color.brand, borderRadius: 24 },
  logoText: { color: theme.color.onBrand, fontSize: 30, fontWeight: '800' },
  title: { color: theme.color.text, fontSize: 28, fontWeight: '800' },
  caption: { color: theme.color.textSecondary, lineHeight: 22 },
  input: { marginTop: 16, padding: 16, color: theme.color.text, backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.border, borderRadius: theme.radius.md },
  button: { alignItems: 'center', padding: 16, backgroundColor: theme.color.brand, borderRadius: theme.radius.full },
  buttonText: { color: theme.color.onBrand, fontWeight: '700' }
})
