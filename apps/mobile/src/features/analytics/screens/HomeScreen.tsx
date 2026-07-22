import { useCallback, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import DeleteIcon from '../../../../assets/icons/actions/delete.svg'
import EditIcon from '../../../../assets/icons/actions/edit.svg'
import { Screen } from '../../../components/base/Screen'
import { SwipeActionRow } from '../../../components/interaction/SwipeActionRow'
import { theme } from '../../../design/theme'
import { transactionRepository } from '../../finance/repositories/transactionRepository'
import type { Transaction } from '../../finance/models/transaction'
import type { RootStackParamList } from '../../../application/navigation/types'

const money = (cent: number) => `¥ ${(cent / 100).toFixed(2)}`

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(() => {
    void transactionRepository.list().then(setTransactions)
  }, [])

  useFocusEffect(load)

  const income = transactions.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amountCent, 0)
  const expense = transactions.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amountCent, 0)

  const deleteTransaction = (transaction: Transaction) => {
    Alert.alert('删除这笔记录？', '删除后将从账本中移除。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          setDeletingId(transaction.id)
          void transactionRepository.remove(transaction.id)
            .then(() => setTransactions(current => current.filter(item => item.id !== transaction.id)))
            .catch(error => Alert.alert('删除失败', error instanceof Error ? error.message : '请稍后重试。'))
            .finally(() => setDeletingId(null))
        }
      }
    ])
  }

  return (
    <Screen scroll contentStyle={styles.screen}>
      <Text style={styles.brand}>Lifee</Text>
      <View style={styles.summary}>
        <Text style={styles.caption}>当前结余</Text>
        <Text style={styles.balance}>{money(income - expense)}</Text>
        <View style={styles.metrics}>
          <View><Text style={styles.caption}>收入</Text><Text style={styles.income}>{money(income)}</Text></View>
          <View><Text style={styles.caption}>支出</Text><Text style={styles.expense}>{money(expense)}</Text></View>
          <View><Text style={styles.caption}>记录</Text><Text style={styles.metricValue}>{transactions.length} 笔</Text></View>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="记一笔"
        style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        onPress={() => navigation.navigate('CreateTransaction')}
      >
        <Text style={styles.actionPlus}>＋</Text>
        <Text style={styles.actionText}>记一笔</Text>
      </Pressable>
      <Text style={styles.sectionTitle}>最近记录</Text>
      {transactions.slice(0, 3).map(item => (
        <SwipeActionRow
          key={item.id}
          actions={[
            {
              key: 'edit',
              accessibilityLabel: '编辑这笔记录',
              backgroundColor: theme.color.actionEditSurface,
              icon: <EditIcon color={theme.color.actionEdit} width={26} height={26} />,
              onPress: () => navigation.navigate('CreateTransaction', { transactionId: item.id })
            },
            {
              key: 'delete',
              accessibilityLabel: '删除这笔记录',
              backgroundColor: theme.color.actionDeleteSurface,
              disabled: deletingId === item.id,
              icon: <DeleteIcon color={theme.color.actionDelete} width={26} height={26} />,
              onPress: () => deleteTransaction(item)
            }
          ]}
        >
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text numberOfLines={1} style={styles.rowTitle}>{item.note || (item.type === 'income' ? '收入' : '支出')}</Text>
              <Text style={styles.caption}>{item.occurredAt.slice(0, 10)}</Text>
            </View>
            <Text numberOfLines={1} style={item.type === 'income' ? styles.income : styles.expense}>{item.type === 'income' ? '+' : '-'} {money(item.amountCent)}</Text>
          </View>
        </SwipeActionRow>
      ))}
      {!transactions.length && <Text style={styles.empty}>还没有记录，先记下第一笔吧。</Text>}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { gap: theme.spacing[6], paddingBottom: 48 },
  brand: { color: theme.color.brand, fontSize: 28, fontWeight: '800' },
  summary: { gap: 8, padding: 24, backgroundColor: theme.color.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.color.border },
  caption: { color: theme.color.textSecondary, fontSize: 13 },
  balance: { color: theme.color.brand, fontSize: 34, fontWeight: '800' },
  metrics: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  metricValue: { color: theme.color.brand, marginTop: 6, fontSize: 16, fontWeight: '700' },
  income: { color: theme.color.income, marginTop: 6, fontSize: 16, fontWeight: '700' },
  expense: { color: theme.color.expense, marginTop: 6, fontSize: 16, fontWeight: '700' },
  action: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', width: 128, height: 128, backgroundColor: theme.color.brand, borderRadius: theme.radius.full },
  actionPressed: { opacity: 0.82 },
  actionPlus: { color: theme.color.onBrand, fontSize: 38, lineHeight: 42 },
  actionText: { color: theme.color.onBrand, fontSize: 17, fontWeight: '700' },
  sectionTitle: { color: theme.color.text, fontSize: 20, fontWeight: '700' },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing[3], padding: 16, backgroundColor: theme.color.surface },
  rowContent: { flex: 1, minWidth: 0 },
  rowTitle: { color: theme.color.text, fontSize: 16, fontWeight: '600' },
  empty: { padding: 24, color: theme.color.textSecondary, textAlign: 'center', backgroundColor: theme.color.surface, borderRadius: theme.radius.md }
})
