import { useCallback, useMemo } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native'
import {
  type CompositeNavigationProp,
  useNavigation
} from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import type {
  AppTabParamList,
  RootStackParamList
} from '../../../application/navigation/types'
import { ScrollList } from '../../../components/list/ScrollList'
import { theme } from '../../../design/theme'
import { TransactionListItem } from '../components/TransactionListItem'
import { TransactionSummaryCard } from '../components/TransactionSummaryCard'
import { useTransactionList } from '../hooks/useTransactionList'
import type { Transaction } from '../models/transaction'
import {
  groupTransactionsByDate,
  type TransactionSection
} from '../utils/transactionList'

type Navigation = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList, 'Transactions'>,
  NativeStackNavigationProp<RootStackParamList>
>

const money = (cent: number) => `¥${(cent / 100).toLocaleString('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`

export function TransactionListScreen() {
  const navigation = useNavigation<Navigation>()
  const {
    transactions,
    summary,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore,
    deletingId,
    error,
    refresh,
    retry,
    loadMore,
    remove
  } = useTransactionList()

  const sections = useMemo(() => groupTransactionsByDate(transactions), [transactions])

  const editTransaction = useCallback((transaction: Transaction) => {
    navigation.navigate('CreateTransaction', { transactionId: transaction.id })
  }, [navigation])

  const deleteTransaction = useCallback((transaction: Transaction) => {
    const title = transaction.note || (transaction.type === 'income' ? '这笔收入' : '这笔支出')
    Alert.alert(`删除“${title}”？`, '删除后将从账本中移除。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          void remove(transaction.id).catch(deleteError => {
            Alert.alert(
              '删除失败',
              deleteError instanceof Error ? deleteError.message : '请稍后重试。'
            )
          })
        }
      }
    ])
  }, [remove])

  const renderItem = useCallback(({
    item,
    index,
    section
  }: {
    item: Transaction
    index: number
    section: TransactionSection
  }) => (
    <View style={[
      styles.itemContainer,
      index === section.data.length - 1 && styles.lastItemContainer
    ]}>
      <TransactionListItem
        deleting={deletingId === item.id}
        transaction={item}
        onDelete={deleteTransaction}
        onEdit={editTransaction}
      />
    </View>
  ), [deleteTransaction, deletingId, editTransaction])

  const renderSectionHeader = useCallback(({ section }: { section: TransactionSection }) => (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionTotals}>
        {section.expenseCent > 0 && (
          <Text style={styles.sectionTotal}>支出: {money(section.expenseCent)}</Text>
        )}
        {section.incomeCent > 0 && (
          <Text style={[styles.sectionTotal, styles.sectionIncome]}>
            收入: {money(section.incomeCent)}
          </Text>
        )}
      </View>
    </View>
  ), [])

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollList<Transaction, TransactionSection>
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        loadingText="正在为您努力加载..."
        onLoadMore={() => void loadMore()}
        contentContainerStyle={[
          styles.content,
          sections.length === 0 && styles.emptyContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={theme.color.brand}
            colors={[theme.color.brand]}
            onRefresh={() => void refresh()}
          />
        }
        ListHeaderComponent={
          <>
            <Text accessibilityRole="header" style={styles.pageTitle}>明细</Text>
            <TransactionSummaryCard
              summary={summary}
              onShowAnalytics={() => navigation.navigate('Home')}
            />
            {error && transactions.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="账单刷新失败，点击重试"
                style={({ pressed }) => [styles.errorBanner, pressed && styles.pressed]}
                onPress={() => void retry()}
              >
                <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
                <Text style={styles.retryText}>重试</Text>
              </Pressable>
            )}
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator color={theme.color.brand} size="large" />
              <Text style={styles.stateText}>正在加载账单…</Text>
            </View>
          ) : error ? (
            <View style={styles.state}>
              <Text style={styles.stateTitle}>账单暂时没有加载出来</Text>
              <Text style={styles.stateText}>{error}</Text>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.stateButton, pressed && styles.pressed]}
                onPress={() => void retry()}
              >
                <Text style={styles.stateButtonText}>重新加载</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.state}>
              <Text style={styles.stateTitle}>还没有账单</Text>
              <Text style={styles.stateText}>记下第一笔收支后，会按时间倒序显示在这里。</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="记下第一笔收支"
                style={({ pressed }) => [styles.stateButton, pressed && styles.pressed]}
                onPress={() => navigation.navigate('CreateTransaction')}
              >
                <Text style={styles.stateButtonText}>记一笔</Text>
              </Pressable>
            </View>
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.color.background },
  content: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[2],
    paddingBottom: 48
  },
  emptyContent: { flexGrow: 1 },
  pageTitle: {
    marginBottom: theme.spacing[4],
    color: theme.color.text,
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[2],
    paddingHorizontal: theme.spacing[1]
  },
  sectionTitle: {
    color: theme.color.textSecondary,
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.24
  },
  sectionTotals: {
    flexShrink: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing[4]
  },
  sectionTotal: {
    color: theme.color.textTertiary,
    fontFamily: theme.typography.fontFamily.numbers,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    lineHeight: 16,
    letterSpacing: 0.24
  },
  sectionIncome: { color: theme.color.accent },
  itemContainer: { marginBottom: theme.spacing[4] },
  lastItemContainer: { marginBottom: 0 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: theme.color.dangerSurface,
    borderRadius: theme.radius.md
  },
  errorText: { flex: 1, color: theme.color.danger, fontFamily: theme.typography.fontFamily.ui, fontSize: 13, lineHeight: 18 },
  retryText: { color: theme.color.danger, fontFamily: theme.typography.fontFamily.ui, fontSize: 13, fontWeight: '700' },
  state: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[6]
  },
  stateTitle: { color: theme.color.text, fontFamily: theme.typography.fontFamily.ui, fontSize: 18, fontWeight: '700' },
  stateText: {
    color: theme.color.textTertiary,
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  },
  stateButton: {
    marginTop: theme.spacing[2],
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.color.brand,
    borderRadius: theme.radius.full
  },
  stateButtonText: { color: theme.color.onBrand, fontFamily: theme.typography.fontFamily.ui, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: theme.opacity.pressed }
})
