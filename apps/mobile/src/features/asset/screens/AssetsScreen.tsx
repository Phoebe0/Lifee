import { StyleSheet, Text, View } from 'react-native'
import { Screen } from '../../../components/base/Screen'
import { theme } from '../../../design/theme'

export function AssetsScreen() {
  return (
    <Screen contentStyle={styles.screen}>
      <Text style={styles.title}>资产</Text>
      <View style={styles.card}><Text style={styles.caption}>净资产</Text><Text style={styles.value}>¥ 0.00</Text><Text style={styles.hint}>账户管理将在下一阶段接入 SQLite 与 Supabase。</Text></View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { gap: 20 },
  title: { color: theme.color.text, fontSize: 28, fontWeight: '800' },
  card: { padding: 24, backgroundColor: theme.color.brand, borderRadius: theme.radius.lg },
  caption: { color: theme.color.onBrandMuted, fontSize: 14 },
  value: { marginTop: 8, color: theme.color.onBrand, fontSize: 34, fontWeight: '800' },
  hint: { marginTop: 24, color: theme.color.onBrandMuted, lineHeight: 20 }
})
