import { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Screen } from '../../../components/base/Screen'
import { theme } from '../../../design/theme'
import type { Transaction } from '../models/transaction'
import { transactionRepository } from '../repositories/transactionRepository'

export function TransactionListScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  useFocusEffect(useCallback(() => {
    void transactionRepository.list().then(setTransactions)
  }, []))

  return (
    <Screen scroll contentStyle={styles.screen}>
      <Text style={styles.title}>明细</Text>
      {transactions.map(item => (
        <View key={item.id} style={styles.row}>
          <View style={styles.rowText}><Text style={styles.name}>{item.note || (item.type === 'income' ? '收入' : '支出')}</Text><Text style={styles.meta}>{item.occurredAt.slice(0, 16).replace('T', ' ')} · {item.syncStatus === 'synced' ? '已同步' : '等待同步'}</Text></View>
          <Text style={[styles.amount, item.type === 'income' ? styles.income : styles.expense]}>{item.type === 'income' ? '+' : '-'} ¥{(item.amountCent / 100).toFixed(2)}</Text>
        </View>
      ))}
      {!transactions.length && <Text style={styles.empty}>暂无记录</Text>}
    </Screen>
  )
}

const styles = StyleSheet.create({
  screen: { gap: 12 },
  title: { marginBottom: 12, color: theme.color.text, fontSize: 28, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: theme.color.surface, borderRadius: theme.radius.md },
  rowText: { flex: 1, marginRight: 12 },
  name: { color: theme.color.text, fontSize: 16, fontWeight: '600' },
  meta: { marginTop: 5, color: theme.color.textSecondary, fontSize: 12 },
  amount: { fontSize: 16, fontWeight: '700' },
  income: { color: theme.color.income },
  expense: { color: theme.color.expense },
  empty: { padding: 32, color: theme.color.textSecondary, textAlign: 'center' }
})
