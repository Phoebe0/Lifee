import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BackspaceIcon from '../../../assets/icons/common/backspace.svg'
import CheckIcon from '../../../assets/icons/common/check.svg'
import { theme } from '../../design/theme'
import { BottomDrawer } from '../overlay/BottomDrawer'

const MAX_INTEGER_DIGITS = 8
const DECIMAL_DIGITS = 2

export interface NumericKeypadProps {
  visible: boolean
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onRequestClose?: () => void
  onLimitReached?: () => void
  disabled?: boolean
  submitDisabled?: boolean
  submitLabel?: string
}

export function getNextAmountValue(current: string, key: string) {
  if (key === 'clear') return ''
  if (key === 'backspace') return current.slice(0, -1)

  if (key === '.') {
    if (current.includes('.')) return current
    return current ? `${current}.` : '0.'
  }

  const [integer = '', decimal] = current.split('.')
  if (decimal !== undefined) {
    if (decimal.length >= DECIMAL_DIGITS) return current
    return `${integer}.${decimal}${key}`
  }

  if (current === '0') return key === '0' ? current : key
  if (integer.length >= MAX_INTEGER_DIGITS) return current
  return `${current}${key}`
}

export function NumericKeypad({
  visible,
  value,
  onChange,
  onSubmit,
  onRequestClose,
  onLimitReached,
  disabled = false,
  submitDisabled = false,
  submitLabel = 'DONE'
}: NumericKeypadProps) {
  const insets = useSafeAreaInsets()

  const input = (key: string) => {
    if (disabled) return
    const next = getNextAmountValue(value, key)
    if (next === value && key !== 'clear') onLimitReached?.()
    onChange(next)
  }

  return (
    <BottomDrawer
      accessibilityLabel="金额数字键盘"
      showBackdrop={false}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, theme.spacing[4]) }]}>
        <View style={styles.columns}>
          <View style={styles.numberColumn}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9']
            ].map(row => (
              <View key={row.join('')} style={styles.row}>
                {row.map(key => <KeyButton key={key} label={key} onPress={() => input(key)} disabled={disabled} />)}
              </View>
            ))}
            <View style={styles.row}>
              <KeyButton label="." accessibilityLabel="小数点" onPress={() => input('.')} disabled={disabled} />
              <KeyButton label="0" onPress={() => input('0')} disabled={disabled} wide />
            </View>
          </View>

          <View style={styles.actionColumn}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="删除一位"
              disabled={disabled}
              style={({ pressed }) => [styles.actionKey, pressed && styles.keyPressed]}
              onPress={() => input('backspace')}
            >
              <BackspaceIcon color={theme.color.danger} width={20} height={16} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="清空金额"
              disabled={disabled}
              style={({ pressed }) => [styles.actionKey, pressed && styles.keyPressed]}
              onPress={() => input('clear')}
            >
              <Text style={styles.clearText}>C</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={submitLabel === 'DONE' ? '保存记录' : submitLabel}
              disabled={disabled || submitDisabled}
              style={({ pressed }) => [
                styles.submit,
                (disabled || submitDisabled) && styles.submitDisabled,
                pressed && styles.submitPressed
              ]}
              onPress={onSubmit}
            >
              <CheckIcon color={theme.color.onBrand} width={17} height={13} />
              <Text style={styles.submitText}>{submitLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </BottomDrawer>
  )
}

interface KeyButtonProps {
  label: string
  onPress: () => void
  accessibilityLabel?: string
  disabled: boolean
  wide?: boolean
}

function KeyButton({ label, onPress, accessibilityLabel, disabled, wide = false }: KeyButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `数字 ${label}`}
      disabled={disabled}
      style={({ pressed }) => [styles.numberKey, wide && styles.wideKey, pressed && styles.keyPressed]}
      onPress={onPress}
    >
      <Text style={styles.numberText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  panel: {
    paddingTop: 17,
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.color.surfaceTranslucent,
    borderTopWidth: 1,
    borderColor: theme.color.borderPanel,
    borderTopLeftRadius: theme.radius.panel,
    borderTopRightRadius: theme.radius.panel,
    shadowColor: theme.color.shadow,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 12
  },
  columns: { flexDirection: 'row', gap: theme.spacing[2], height: 256 },
  numberColumn: { flex: 3, gap: theme.spacing[2] },
  actionColumn: { flex: 1, gap: theme.spacing[2] },
  row: { flexDirection: 'row', gap: theme.spacing[2], height: 58 },
  numberKey: {
    flex: 1,
    minWidth: 0,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.xl
  },
  wideKey: { flex: 2 },
  actionKey: { height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.xl },
  keyPressed: { backgroundColor: theme.color.brandSoft },
  numberText: { color: theme.color.text, fontSize: theme.typography.keypad, lineHeight: 30, fontWeight: '600' },
  clearText: { color: theme.color.textSecondary, fontSize: theme.typography.caption, lineHeight: 16, fontWeight: '600' },
  submit: {
    flex: 1,
    minHeight: 124,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[1],
    backgroundColor: theme.color.brand,
    borderRadius: theme.radius.panel,
    shadowColor: theme.color.brand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  submitPressed: { backgroundColor: theme.color.brandPressed, transform: [{ scale: 0.98 }] },
  submitDisabled: { backgroundColor: theme.color.disabled, shadowOpacity: 0 },
  submitText: { color: theme.color.onBrand, fontSize: 10, lineHeight: 15, fontWeight: '500' }
})
