import { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { LineChart, PieChart, type CartesianChartTheme } from 'react-native-chart-kit/v2'
import { Screen } from '../../../components/base/Screen'
import {
  YearMonthSwitcher,
  type YearMonthValue
} from '../../../components/date/YearMonthSwitcher'
import { theme } from '../../../design/theme'
import { transactionRepository } from '../../finance/repositories/transactionRepository'
import { AnalyticsRangeSelector } from '../components/AnalyticsRangeSelector'
import type { AnalyticsRange } from '../models/analytics'
import {
  buildExpenseCategories,
  buildTrendPoints,
  currentYearMonth,
  filterMonthTransactions,
  getAnalyticsQueryBounds,
  getReferenceEnd,
  hasTrendData,
  summarizeTransactions
} from '../utils/analytics'
import type { Transaction } from '../../finance/models/transaction'

const chartTheme: CartesianChartTheme = {
  background: 'transparent',
  plotBackground: 'transparent',
  grid: theme.color.divider,
  axis: theme.color.border,
  text: theme.color.textSecondary,
  mutedText: theme.color.textTertiary,
  series: [theme.color.income, theme.color.expense],
  typography: {
    fontFamily: theme.typography.fontFamily.ui,
    axisLabelSize: 10,
    legendLabelSize: 11
  },
  tooltip: {
    background: theme.color.surface,
    border: theme.color.border,
    text: theme.color.text,
    mutedText: theme.color.textTertiary,
    borderRadius: theme.radius.md
  }
}

export function AnalyticsScreen() {
  const { width } = useWindowDimensions()
  const [period, setPeriod] = useState<YearMonthValue>(() => currentYearMonth())
  const [range, setRange] = useState<AnalyticsRange>(30)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useFocusEffect(
    useCallback(() => {
      let active = true
      const { start, endExclusive } = getAnalyticsQueryBounds(period)

      setLoading(true)
      setError(null)
      void transactionRepository.listBetween(start, endExclusive)
        .then(items => {
          if (active) setTransactions(items)
        })
        .catch(loadError => {
          if (!active) return
          setError(loadError instanceof Error ? loadError.message : '分析数据载入失败。')
        })
        .finally(() => {
          if (active) setLoading(false)
        })

      return () => {
        active = false
      }
    }, [period])
  )

  const monthTransactions = useMemo(
    () => filterMonthTransactions(transactions, period),
    [period, transactions]
  )
  const summary = useMemo(
    () => summarizeTransactions(monthTransactions),
    [monthTransactions]
  )
  const trend = useMemo(
    () => buildTrendPoints(transactions, range, getReferenceEnd(period)),
    [period, range, transactions]
  )
  const categories = useMemo(
    () => buildExpenseCategories(monthTransactions),
    [monthTransactions]
  )
  const chartWidth = Math.max(260, Math.min(520, width - 72))
  const flowTotal = summary.incomeCent + summary.expenseCent
  const incomeShare = flowTotal ? summary.incomeCent / flowTotal : 0.5
  const expenseShare = flowTotal ? summary.expenseCent / flowTotal : 0.5

  return (
    <Screen scroll contentStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.pageEyebrow}>MONTHLY LEDGER</Text>
          <Text style={styles.title}>收支分析</Text>
          <Text style={styles.subtitle}>看清每一笔钱的去向</Text>
        </View>
        <View accessibilityLabel={`${period.month + 1}月`} style={styles.monthMark}>
          <Text style={styles.monthMarkValue}>{period.month + 1}</Text>
          <Text style={styles.monthMarkUnit}>月</Text>
        </View>
      </View>

      <YearMonthSwitcher value={period} loading={loading} onChange={setPeriod} />

      {loading ? (
        <AnalyticsLoadingState />
      ) : error ? (
        <AnalyticsErrorState
          message={error}
          onRetry={() => setPeriod(current => ({ ...current }))}
        />
      ) : (
        <>
          <View style={styles.summaryCard}>
            <View style={styles.summaryBubbleLarge} />
            <View style={styles.summaryBubbleSmall} />
            <View style={styles.cardHeading}>
              <View>
                <Text style={styles.summaryEyebrow}>
                  {period.year}年{period.month + 1}月账单
                </Text>
                <Text style={styles.summaryTitle}>月度收支概览</Text>
              </View>
              {!monthTransactions.length && (
                <Text style={styles.summaryEmptyBadge}>暂无数据</Text>
              )}
            </View>
            <Text style={styles.summaryLabel}>本月净结余</Text>
            <Text style={styles.summaryAmount}>{formatMoney(summary.balanceCent)}</Text>
            <View style={styles.metricRow}>
              <Metric
                label="收入"
                value={formatMoney(summary.incomeCent)}
                dotColor={theme.color.income}
              />
              <Metric
                label="支出"
                value={formatMoney(summary.expenseCent)}
                dotColor={theme.color.expense}
              />
              <Metric label="记录" value={`${summary.transactionCount} 笔`} />
            </View>
            <View style={styles.flowBlock}>
              <View style={styles.flowLabels}>
                <Text style={styles.flowLabel}>收入 {(incomeShare * 100).toFixed(0)}%</Text>
                <Text style={styles.flowLabel}>支出 {(expenseShare * 100).toFixed(0)}%</Text>
              </View>
              <View
                accessibilityLabel={`收入占比${(incomeShare * 100).toFixed(0)}%，支出占比${(expenseShare * 100).toFixed(0)}%`}
                style={styles.flowRail}
              >
                <View style={[styles.flowIncome, { flex: Math.max(incomeShare, 0.015) }]} />
                <View style={[styles.flowExpense, { flex: Math.max(expenseShare, 0.015) }]} />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeading}>
              <View>
                <Text style={styles.cardTitle}>收支趋势</Text>
                <Text style={styles.cardCaption}>按时间观察收入与支出变化</Text>
              </View>
            </View>
            <AnalyticsRangeSelector value={range} onChange={setRange} />
            {hasTrendData(trend) ? (
              <>
                <View style={styles.legend}>
                  <LegendDot color={theme.color.income} label="收入" />
                  <LegendDot color={theme.color.expense} label="支出" />
                </View>
                <View style={styles.chart}>
                  <LineChart
                    data={trend}
                    xKey="label"
                    series={[
                      {
                        yKey: 'income',
                        key: 'income',
                        label: '收入',
                        color: theme.color.income,
                        strokeWidth: 2.5
                      },
                      {
                        yKey: 'expense',
                        key: 'expense',
                        label: '支出',
                        color: theme.color.expense,
                        strokeWidth: 2.5
                      }
                    ]}
                    width={chartWidth}
                    height={230}
                    curve="monotone"
                    dots={{ visible: true, radius: 3, strokeWidth: 2, fill: 'background' }}
                    interaction={{ mode: 'tap' }}
                    tooltip
                    legend={false}
                    labelStrategy="auto"
                    edgeLabelPolicy="shift"
                    showHorizontalGridLines
                    showVerticalGridLines={false}
                    formatYLabel={formatChartAmount}
                    theme={chartTheme}
                    accessibilityLabel={`近${range}天收入支出趋势图`}
                  />
                </View>
              </>
            ) : (
              <EmptyChart />
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeading}>
              <View>
                <Text style={styles.cardTitle}>支出构成</Text>
                <Text style={styles.cardCaption}>本月各消费分类占比</Text>
              </View>
            </View>
            {categories.length ? (
              <>
                <View style={styles.chart}>
                  <PieChart
                    data={categories}
                    valueKey="value"
                    labelKey="label"
                    colorKey="color"
                    width={chartWidth}
                    height={220}
                    innerRadiusRatio={0.62}
                    legend={false}
                    arcLabels={false}
                    sliceSeparator={{ visible: true, color: theme.color.surface, width: 3 }}
                    centerLabel={formatCompactMoney(summary.expenseCent)}
                    theme={chartTheme}
                    accessibilityLabel={`${period.month + 1}月支出分类占比图`}
                  />
                </View>
                <View style={styles.categoryList}>
                  {categories.map(category => (
                    <View key={category.id} style={styles.categoryRow}>
                      <View style={styles.categoryName}>
                        <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                        <Text style={styles.categoryLabel}>{category.label}</Text>
                      </View>
                      <View style={styles.categoryValue}>
                        <Text style={styles.categoryAmount}>{formatMoney(category.amountCent)}</Text>
                        <Text style={styles.categoryPercentage}>
                          {(category.percentage * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <EmptyChart />
            )}
          </View>
        </>
      )}
    </Screen>
  )
}

interface MetricProps {
  label: string
  value: string
  dotColor?: string
}

function Metric({ label, value, dotColor }: MetricProps) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricLabelRow}>
        {dotColor && <View style={[styles.metricDot, { backgroundColor: dotColor }]} />}
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit style={styles.metricValue}>
        {value}
      </Text>
    </View>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  )
}

function EmptyChart() {
  return (
    <View accessibilityRole="text" style={styles.empty}>
      <View style={styles.emptyMark}>
        <View style={styles.emptyBarSmall} />
        <View style={styles.emptyBarLarge} />
        <View style={styles.emptyBarMedium} />
      </View>
      <Text style={styles.emptyTitle}>暂无数据</Text>
      <Text style={styles.emptyCaption}>记录收支后，这里会自动生成分析</Text>
    </View>
  )
}

function AnalyticsLoadingState() {
  return (
    <View accessibilityLabel="分析数据载入中" style={styles.loadingStack}>
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator color={theme.color.brand} size="small" />
        <Text style={styles.loadingText}>正在整理你的收支数据…</Text>
      </View>
      <View style={[styles.skeletonCard, styles.skeletonTall]}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonChart} />
      </View>
      <View style={[styles.skeletonCard, styles.skeletonMedium]}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonCircle} />
      </View>
    </View>
  )
}

function AnalyticsErrorState({
  message,
  onRetry
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <View style={[styles.card, styles.error]}>
      <Text style={styles.errorTitle}>暂时无法载入分析</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        onPress={onRetry}
      >
        <Text style={styles.retryText}>重新载入</Text>
      </Pressable>
    </View>
  )
}

function formatMoney(cent: number) {
  const sign = cent < 0 ? '-' : ''
  return `${sign}¥ ${Math.abs(cent / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

function formatChartAmount(value: number) {
  const absolute = Math.abs(value)
  if (absolute >= 10_000) return `${(value / 10_000).toFixed(1)}万`
  if (absolute >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toFixed(0)
}

function formatCompactMoney(cent: number) {
  const value = cent / 100
  if (Math.abs(value) >= 10_000) return `¥${(value / 10_000).toFixed(1)}万`
  if (Math.abs(value) >= 1_000) return `¥${(value / 1_000).toFixed(1)}k`
  return `¥${value.toFixed(0)}`
}

const styles = StyleSheet.create({
  screen: {
    gap: 18,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[4],
    paddingTop: theme.spacing[1]
  },
  headerCopy: {
    flex: 1
  },
  pageEyebrow: {
    marginBottom: theme.spacing[1],
    color: theme.color.brand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4
  },
  title: {
    color: theme.color.text,
    fontSize: 28,
    fontWeight: '800'
  },
  subtitle: {
    marginTop: 3,
    color: theme.color.textTertiary,
    fontSize: 13
  },
  monthMark: {
    width: 54,
    height: 54,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingTop: 11,
    backgroundColor: theme.color.brandSurface,
    borderWidth: 1,
    borderColor: theme.auth.brandBorder,
    borderRadius: 18
  },
  monthMarkValue: {
    color: theme.color.brand,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6
  },
  monthMarkUnit: {
    marginLeft: 2,
    color: theme.color.brand,
    fontSize: 10,
    fontWeight: '700'
  },
  card: {
    gap: 18,
    padding: theme.spacing[5],
    overflow: 'hidden',
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.divider,
    borderRadius: theme.radius.lg,
    shadowColor: theme.color.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 1
  },
  summaryCard: {
    position: 'relative',
    gap: 16,
    padding: theme.spacing[5],
    overflow: 'hidden',
    backgroundColor: theme.color.brand,
    borderRadius: 28,
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5
  },
  summaryBubbleLarge: {
    position: 'absolute',
    top: -72,
    right: -42,
    width: 176,
    height: 176,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.radius.full
  },
  summaryBubbleSmall: {
    position: 'absolute',
    right: 36,
    bottom: -48,
    width: 112,
    height: 112,
    backgroundColor: 'rgba(126,230,255,0.10)',
    borderRadius: theme.radius.full
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing[3]
  },
  summaryEyebrow: {
    color: theme.color.onBrandMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  summaryTitle: {
    marginTop: 3,
    color: theme.color.onBrand,
    fontSize: 18,
    fontWeight: '800'
  },
  cardTitle: {
    color: theme.color.text,
    fontSize: 18,
    fontWeight: '800'
  },
  cardCaption: {
    marginTop: 3,
    color: theme.color.textTertiary,
    fontSize: 12
  },
  summaryEmptyBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    color: theme.color.onBrandMuted,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: theme.radius.full
  },
  summaryLabel: {
    color: theme.color.onBrandMuted,
    fontSize: 13
  },
  summaryAmount: {
    marginTop: -10,
    color: theme.color.onBrand,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8
  },
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing[2]
  },
  metric: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing[1],
    padding: theme.spacing[3],
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.radius.md
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.full
  },
  metricLabel: {
    color: theme.color.onBrandMuted,
    fontSize: 11
  },
  metricValue: {
    color: theme.color.onBrand,
    fontSize: 13,
    fontWeight: '800'
  },
  flowBlock: {
    gap: theme.spacing[2],
    marginTop: 2
  },
  flowLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  flowLabel: {
    color: theme.color.onBrandMuted,
    fontSize: 10,
    fontWeight: '600'
  },
  flowRail: {
    height: 7,
    flexDirection: 'row',
    gap: 3,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: theme.radius.full
  },
  flowIncome: {
    backgroundColor: theme.color.income,
    borderRadius: theme.radius.full
  },
  flowExpense: {
    backgroundColor: theme.color.expense,
    borderRadius: theme.radius.full
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing[4]
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.full
  },
  legendLabel: {
    color: theme.color.textSecondary,
    fontSize: 11
  },
  chart: {
    marginHorizontal: -theme.spacing[2],
    alignItems: 'center'
  },
  categoryList: {
    gap: theme.spacing[2]
  },
  categoryRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: theme.radius.md
  },
  categoryName: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2]
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.full
  },
  categoryLabel: {
    color: theme.color.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  categoryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3]
  },
  categoryAmount: {
    color: theme.color.text,
    fontSize: 13,
    fontWeight: '700'
  },
  categoryPercentage: {
    width: 34,
    color: theme.color.textTertiary,
    fontSize: 12,
    textAlign: 'right'
  },
  empty: {
    minHeight: 190,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2]
  },
  emptyMark: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing[1],
    marginBottom: theme.spacing[2]
  },
  emptyBarSmall: {
    width: 8,
    height: 14,
    backgroundColor: theme.color.disabled,
    borderRadius: theme.radius.sm
  },
  emptyBarLarge: {
    width: 8,
    height: 34,
    backgroundColor: theme.color.disabled,
    borderRadius: theme.radius.sm
  },
  emptyBarMedium: {
    width: 8,
    height: 24,
    backgroundColor: theme.color.disabled,
    borderRadius: theme.radius.sm
  },
  emptyTitle: {
    color: theme.color.textSecondary,
    fontSize: 15,
    fontWeight: '800'
  },
  emptyCaption: {
    color: theme.color.textTertiary,
    fontSize: 12,
    textAlign: 'center'
  },
  loadingStack: {
    gap: theme.spacing[5]
  },
  loadingCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: theme.color.textSecondary,
    fontSize: 13
  },
  skeletonCard: {
    padding: theme.spacing[4],
    backgroundColor: theme.color.surfaceSubtle,
    borderRadius: theme.radius.lg
  },
  skeletonTall: {
    height: 330
  },
  skeletonMedium: {
    height: 300
  },
  skeletonTitle: {
    width: 112,
    height: 18,
    backgroundColor: theme.color.disabled,
    borderRadius: theme.radius.sm
  },
  skeletonChart: {
    height: 200,
    marginTop: theme.spacing[8],
    backgroundColor: theme.color.surfaceControl,
    borderRadius: theme.radius.md
  },
  skeletonCircle: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginTop: theme.spacing[8],
    backgroundColor: theme.color.surfaceControl,
    borderRadius: theme.radius.full
  },
  error: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorTitle: {
    color: theme.color.text,
    fontSize: 17,
    fontWeight: '800'
  },
  errorMessage: {
    color: theme.color.textTertiary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center'
  },
  retryButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.color.brand,
    borderRadius: theme.radius.full
  },
  retryText: {
    color: theme.color.onBrand,
    fontSize: 13,
    fontWeight: '800'
  },
  pressed: {
    opacity: theme.opacity.pressed
  }
})
