import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { theme } from '../../../design/theme'
import type { MonthlyTransactionSummary } from '../models/transaction'

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
          <Text numberOfLines={1} style={styles.expense}>
            {money(summary.expenseCent)}
          </Text>
        </View>
        <View style={styles.secondaryMetric}>
          <Text style={styles.label}>本月收入</Text>
          <Text numberOfLines={1} style={styles.income}>
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
    backgroundColor: theme.finance.glassSurface,
    borderWidth: 1,
    borderColor: theme.finance.glassBorder,
    borderRadius: theme.radius.xl
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
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.24
  },
  expense: {
    color: theme.color.text,
    fontFamily: theme.typography.fontFamily.numbers,
    fontSize: 32,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 40,
    letterSpacing: -0.64
  },
  income: {
    color: theme.color.accent,
    fontFamily: theme.typography.fontFamily.numbers,
    fontSize: 22,
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
    borderTopColor: theme.finance.divider
  },
  balanceRow: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  balanceDot: { width: 8, height: 8, flexShrink: 0, backgroundColor: theme.color.brand, borderRadius: theme.radius.full },
  balanceText: {
    flex: 1,
    color: theme.color.textSecondary,
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    lineHeight: 16,
    letterSpacing: 0.24
  },
  analyticsButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 6,
    backgroundColor: theme.finance.analysisSurface,
    borderRadius: theme.radius.full
  },
  analyticsText: {
    color: theme.color.brand,
    fontFamily: theme.typography.fontFamily.ui,
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
    backgroundColor: theme.finance.cyanGlow,
    borderRadius: theme.radius.full
  },
  glowBottom: {
    position: 'absolute',
    bottom: -32,
    left: -32,
    width: 96,
    height: 96,
    backgroundColor: theme.finance.indigoGlow,
    borderRadius: theme.radius.full
  },
  pressed: { opacity: theme.opacity.pressed }
})
