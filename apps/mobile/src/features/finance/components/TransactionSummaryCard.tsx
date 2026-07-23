import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { theme } from '../../../design/theme'
import type { MonthlyTransactionSummary } from '../utils/transactionList'

interface TransactionSummaryCardProps {
  summary: MonthlyTransactionSummary
  onShowAnalytics: () => void
}

const money = (cent: number) => `¥ ${(cent / 100).toLocaleString('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`

export const TransactionSummaryCard = memo(function TransactionSummaryCard({
  summary,
  onShowAnalytics
}: TransactionSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View style={styles.metrics}>
        <View style={styles.primaryMetric}>
          <Text style={styles.label}>{summary.monthLabel}总支出</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.expense}>
            {money(summary.expenseCent)}
          </Text>
        </View>
        <View style={styles.secondaryMetric}>
          <Text style={styles.label}>本月收入</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.income}>
            {money(summary.incomeCent)}
          </Text>
        </View>
      </View>
      <View pointerEvents="none" style={styles.glowBottom} />
      <View style={styles.footer}>
        <View style={styles.balanceRow}>
          <View style={styles.balanceDot} />
          <Text numberOfLines={1} style={styles.balanceText}>
            本月结余: {money(summary.balanceCent)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="查看分析详情"
          hitSlop={6}
          style={({ pressed }) => [styles.analyticsButton, pressed && styles.pressed]}
          onPress={onShowAnalytics}
        >
          <Text style={styles.analyticsText}>分析详情</Text>
        </Pressable>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing[4],
    overflow: 'hidden',
    padding: 19,
    backgroundColor: theme.color.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.color.borderOverlay,
    borderRadius: theme.radius.xl,
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 3
  },
  metrics: {
    zIndex: theme.zIndex.content,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.spacing[3]
  },
  primaryMetric: { flex: 1, minWidth: 0, gap: theme.spacing[1] },
  secondaryMetric: { maxWidth: '44%', alignItems: 'flex-end', gap: theme.spacing[1] },
  label: {
    color: theme.color.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.24
  },
  expense: {
    color: theme.color.text,
    fontSize: 30,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 40,
    letterSpacing: -0.6
  },
  income: {
    color: theme.color.accent,
    fontSize: 21,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: 30
  },
  footer: {
    zIndex: theme.zIndex.content,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
    paddingTop: 17,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.color.borderOverlay
  },
  balanceRow: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  balanceDot: { width: 8, height: 8, flexShrink: 0, backgroundColor: theme.color.brand, borderRadius: theme.radius.full },
  balanceText: {
    flex: 1,
    color: theme.color.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    lineHeight: 16,
    letterSpacing: 0.24
  },
  analyticsButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 6,
    backgroundColor: 'rgba(79,87,149,0.10)',
    borderRadius: theme.radius.full
  },
  analyticsText: {
    color: theme.color.brand,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.24
  },
  glowTop: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(108,213,237,0.16)',
    borderRadius: theme.radius.full
  },
  glowBottom: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 96,
    height: 96,
    backgroundColor: 'rgba(104,112,175,0.08)',
    borderRadius: theme.radius.full
  },
  pressed: { opacity: theme.opacity.pressed }
})
