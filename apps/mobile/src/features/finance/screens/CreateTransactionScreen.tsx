import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Screen } from '../../../components/base/Screen'
import { theme } from '../../../design/theme'
import type { RootStackParamList } from '../../../application/navigation/types'
import { transactionRepository } from '../repositories/transactionRepository'
import type { TransactionType } from '../models/transaction'

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTransaction'>

export function CreateTransactionScreen({ navigation, route }: Props) {
  const [type, setType] = useState<TransactionType>(route.params?.initialType ?? 'expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    const amountCent = Math.round(Number(amount) * 100)
    if (!Number.isInteger(amountCent) || amountCent <= 0) {
      Alert.alert('金额不正确', '请输入大于 0 的金额。')
      return
    }

    try {
      setSaving(true)
      await transactionRepository.create({
        type,
        amountCent,
        occurredAt: new Date().toISOString(),
        note
      })
      navigation.goBack()
    } catch (error) {
      Alert.alert('保存失败', error instanceof Error ? error.message : '请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen scroll contentStyle={styles.screen}>
      <View style={styles.segment}>
        {(['expense', 'income'] as const).map(item => (
          <Pressable key={item} style={[styles.segmentItem, type === item && styles.segmentActive]} onPress={() => setType(item)}>
            <Text style={[styles.segmentText, type === item && styles.segmentTextActive]}>{item === 'expense' ? '支出' : '收入'}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>金额</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>¥</Text>
          <TextInput
            accessibilityLabel="金额"
            autoFocus
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.color.textSecondary}
            value={amount}
            onChangeText={setAmount}
            style={styles.amountInput}
          />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>备注</Text>
        <TextInput accessibilityLabel="备注" maxLength={50} placeholder="写点什么（选填）" value={note} onChangeText={setNote} style={styles.noteInput} />
      </View>
      <Pressable accessibilityRole="button" disabled={saving} style={[styles.save, saving && styles.disabled]} onPress={() => void save()}>
        <Text style={styles.saveText}>{saving ? '保存中…' : '保存这笔记录'}</Text>
      </Pressable>
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { gap: theme.spacing[5] },
  segment: { flexDirection: 'row', alignSelf: 'center', padding: 4, backgroundColor: theme.color.brandSoft, borderRadius: theme.radius.full },
  segmentItem: { paddingVertical: 10, paddingHorizontal: 28, borderRadius: theme.radius.full },
  segmentActive: { backgroundColor: theme.color.surface },
  segmentText: { color: theme.color.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: theme.color.brand },
  card: { padding: 20, backgroundColor: theme.color.surface, borderRadius: theme.radius.lg },
  label: { color: theme.color.textSecondary, fontSize: 14 },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  currency: { color: theme.color.text, fontSize: 30, fontWeight: '600' },
  amountInput: { flex: 1, marginLeft: 12, color: theme.color.text, fontSize: 44, fontWeight: '700' },
  noteInput: { marginTop: 12, color: theme.color.text, fontSize: 16 },
  save: { alignItems: 'center', padding: 16, backgroundColor: theme.color.brand, borderRadius: theme.radius.full },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.5 }
})
