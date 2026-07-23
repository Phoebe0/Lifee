import { StyleSheet, Text, View } from 'react-native'
import { theme } from '../../../design/theme'

export function AuthBrand() {
  return (
    <View style={styles.container}>
      <View style={styles.mark}>
        <Text style={styles.markText}>L</Text>
        <View style={styles.markDot} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>LIFEE · 日序</Text>
        <Text style={styles.title}>欢迎回来</Text>
        <Text style={styles.subtitle}>让每一笔生活，都有清晰的方向。</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    paddingHorizontal: theme.spacing[1]
  },
  mark: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.brand,
    borderRadius: 22,
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 7
  },
  markText: {
    color: theme.color.onBrand,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1.5
  },
  markDot: {
    position: 'absolute',
    right: 12,
    bottom: 13,
    width: 8,
    height: 8,
    backgroundColor: theme.auth.markAccent,
    borderWidth: 2,
    borderColor: theme.color.brand,
    borderRadius: theme.radius.full
  },
  copy: { flex: 1, minWidth: 0 },
  eyebrow: {
    color: theme.color.brand,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6
  },
  title: {
    marginTop: 3,
    color: theme.color.text,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 37,
    letterSpacing: -0.8
  },
  subtitle: {
    marginTop: 2,
    color: theme.color.textTertiary,
    fontSize: 13,
    lineHeight: 19
  }
})
