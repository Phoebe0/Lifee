import { memo, type ComponentType } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { SvgProps } from 'react-native-svg'
import { SwipeActionRow } from '../../../components/interaction/SwipeActionRow'
import DeleteIcon from '../../../../assets/icons/actions/delete.svg'
import EditIcon from '../../../../assets/icons/actions/edit.svg'
import { theme } from '../../../design/theme'
import { transactionCategories } from '../constants/categories'
import type { Transaction } from '../models/transaction'
import { formatTransactionTime } from '../utils/transactionList'

interface TransactionListItemProps {
  transaction: Transaction
  deleting?: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

interface CategoryPresentation {
  name: string
  Icon: ComponentType<SvgProps>
  iconColor: string
  surfaceColor: string
  iconWidth: number
  iconHeight: number
}

type CategoryVisual = Omit<CategoryPresentation, 'name' | 'Icon'>

const fallbackPalette: CategoryVisual = {
  iconColor: theme.color.brand,
  surfaceColor: theme.color.brandSurface,
  iconWidth: 20,
  iconHeight: 20
}

const categoryPalette: Record<string, CategoryVisual> = {
  food: { iconColor: theme.transactionCategory.food.icon, surfaceColor: theme.transactionCategory.food.surface, iconWidth: 15, iconHeight: 20 },
  shopping: { iconColor: theme.transactionCategory.shopping.icon, surfaceColor: theme.transactionCategory.shopping.surface, iconWidth: 16, iconHeight: 20 },
  transport: { iconColor: theme.transactionCategory.transport.icon, surfaceColor: theme.transactionCategory.transport.surface, iconWidth: 18, iconHeight: 16 },
  home: { iconColor: theme.transactionCategory.home.icon, surfaceColor: theme.transactionCategory.home.surface, iconWidth: 18, iconHeight: 21 },
  entertainment: { iconColor: theme.transactionCategory.entertainment.icon, surfaceColor: theme.transactionCategory.entertainment.surface, iconWidth: 22, iconHeight: 20 },
  medical: { iconColor: theme.transactionCategory.medical.icon, surfaceColor: theme.transactionCategory.medical.surface, iconWidth: 20, iconHeight: 20 },
  education: { iconColor: theme.transactionCategory.education.icon, surfaceColor: theme.transactionCategory.education.surface, iconWidth: 22, iconHeight: 18 },
  salary: { iconColor: theme.transactionCategory.salary.icon, surfaceColor: theme.transactionCategory.salary.surface, iconWidth: 19, iconHeight: 18 },
  bonus: { iconColor: theme.transactionCategory.bonus.icon, surfaceColor: theme.transactionCategory.bonus.surface, iconWidth: 20, iconHeight: 20 },
  investment: { iconColor: theme.transactionCategory.investment.icon, surfaceColor: theme.transactionCategory.investment.surface, iconWidth: 20, iconHeight: 20 },
  'part-time': { iconColor: theme.transactionCategory.partTime.icon, surfaceColor: theme.transactionCategory.partTime.surface, iconWidth: 20, iconHeight: 20 },
  'red-packet': { iconColor: theme.transactionCategory.redPacket.icon, surfaceColor: theme.transactionCategory.redPacket.surface, iconWidth: 20, iconHeight: 20 },
  reimbursement: { iconColor: theme.transactionCategory.reimbursement.icon, surfaceColor: theme.transactionCategory.reimbursement.surface, iconWidth: 20, iconHeight: 20 },
  refund: { iconColor: theme.transactionCategory.refund.icon, surfaceColor: theme.transactionCategory.refund.surface, iconWidth: 20, iconHeight: 20 },
  other: fallbackPalette
}

function getCategoryPresentation(transaction: Transaction): CategoryPresentation {
  const category = transactionCategories[transaction.type].find(item => item.id === transaction.categoryId) ??
    transactionCategories[transaction.type].at(-1)!
  const paletteKey = category.id.replace(/^default-(income|expense)-/, '')
  const palette = categoryPalette[paletteKey] ?? fallbackPalette

  return {
    name: category.name,
    Icon: category.icon,
    ...palette
  }
}

function formatAmount(transaction: Transaction) {
  const sign = transaction.type === 'income' ? '+' : '-'
  return `${sign}${(transaction.amountCent / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

function TransactionListItemComponent({
  transaction,
  deleting = false,
  onEdit,
  onDelete
}: TransactionListItemProps) {
  const category = getCategoryPresentation(transaction)
  const { Icon } = category
  const title = transaction.note || `${category.name}${transaction.type === 'income' ? '收入' : '支出'}`

  return (
    <SwipeActionRow
      borderRadius={theme.radius.xl}
      actions={[
        {
          key: 'edit',
          accessibilityLabel: `编辑${title}`,
          backgroundColor: theme.color.actionEditSurface,
          icon: <EditIcon color={theme.color.actionEdit} width={25} height={25} />,
          onPress: () => onEdit(transaction)
        },
        {
          key: 'delete',
          accessibilityLabel: `删除${title}`,
          backgroundColor: theme.color.actionDeleteSurface,
          disabled: deleting,
          icon: <DeleteIcon color={theme.color.actionDelete} width={25} height={25} />,
          onPress: () => onDelete(transaction)
        }
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}，${formatAmount(transaction)}元，点击编辑`}
        accessibilityHint="向左轻扫可显示编辑和删除操作"
        disabled={deleting}
        style={({ pressed }) => [
          styles.pressTarget,
          deleting && styles.deleting,
          pressed && styles.pressed
        ]}
        onPress={() => onEdit(transaction)}
      >
        <View style={styles.card}>
          <View style={[styles.iconSurface, { backgroundColor: category.surfaceColor }]}>
            <Icon
              color={category.iconColor}
              width={category.iconWidth}
              height={category.iconHeight}
            />
          </View>
          <View style={styles.content}>
            <Text numberOfLines={1} style={styles.title}>{title}</Text>
            <Text numberOfLines={1} style={styles.meta}>
              {formatTransactionTime(transaction.occurredAt)} · {category.name}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={[styles.amount, transaction.type === 'income' && styles.income]}
          >
            {formatAmount(transaction)}
          </Text>
        </View>
      </Pressable>
    </SwipeActionRow>
  )
}

export const TransactionListItem = memo(TransactionListItemComponent)

const styles = StyleSheet.create({
  pressTarget: {
    minHeight: 86,
    borderRadius: theme.radius.xl
  },
  card: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: theme.finance.glassSurface,
    borderWidth: 1,
    borderColor: theme.finance.glassBorder,
    borderRadius: theme.radius.xl
  },
  iconSurface: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2
  },
  content: { flex: 1, minWidth: 0 },
  title: {
    color: theme.color.text,
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24
  },
  meta: {
    color: theme.color.textTertiary,
    fontFamily: theme.typography.fontFamily.ui,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.24
  },
  amount: {
    maxWidth: 112,
    flexShrink: 0,
    color: theme.color.text,
    fontFamily: theme.typography.fontFamily.numbers,
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    lineHeight: 24,
    textAlign: 'right'
  },
  income: { color: theme.color.accent },
  deleting: { opacity: theme.opacity.disabled },
  pressed: { opacity: theme.opacity.pressed }
})
