import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import ChevronLeftIcon from '../../../assets/icons/common/chevron-left.svg'
import ChevronRightIcon from '../../../assets/icons/common/chevron-right.svg'
import { theme } from '../../design/theme'

export interface YearMonthValue {
  year: number
  month: number
}

interface YearMonthSwitcherProps {
  value: YearMonthValue
  onChange: (value: YearMonthValue) => void
  loading?: boolean
  disabled?: boolean
}

type Unit = 'year' | 'month'

export function YearMonthSwitcher({
  value,
  onChange,
  loading = false,
  disabled = false
}: YearMonthSwitcherProps) {
  const isDisabled = disabled || loading

  const shift = (unit: Unit, direction: -1 | 1) => {
    if (unit === 'year') {
      onChange({ ...value, year: value.year + direction })
      return
    }

    const nextMonth = value.month + direction
    if (nextMonth < 0) {
      onChange({ year: value.year - 1, month: 11 })
    } else if (nextMonth > 11) {
      onChange({ year: value.year + 1, month: 0 })
    } else {
      onChange({ ...value, month: nextMonth })
    }
  }

  return (
    <View
      accessibilityLabel={`当前选择 ${value.year}年${value.month + 1}月`}
      style={[styles.container, isDisabled && styles.disabled]}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.color.brand} size="small" />
          <Text style={styles.loadingText}>正在切换账期</Text>
        </View>
      ) : (
        <>
          <DateStepper
            label={`${value.year}年`}
            unitLabel="年份"
            disabled={isDisabled}
            onPrevious={() => shift('year', -1)}
            onNext={() => shift('year', 1)}
          />
          <View style={styles.divider} />
          <DateStepper
            label={`${value.month + 1}月`}
            unitLabel="月份"
            disabled={isDisabled}
            onPrevious={() => shift('month', -1)}
            onNext={() => shift('month', 1)}
          />
        </>
      )}
    </View>
  )
}

interface DateStepperProps {
  label: string
  unitLabel: string
  disabled: boolean
  onPrevious: () => void
  onNext: () => void
}

function DateStepper({
  label,
  unitLabel,
  disabled,
  onPrevious,
  onNext
}: DateStepperProps) {
  return (
    <View style={styles.stepper}>
      <ArrowButton
        accessibilityLabel={`上一个${unitLabel}`}
        disabled={disabled}
        direction="previous"
        onPress={onPrevious}
      />
      <Text style={styles.value}>{label}</Text>
      <ArrowButton
        accessibilityLabel={`下一个${unitLabel}`}
        disabled={disabled}
        direction="next"
        onPress={onNext}
      />
    </View>
  )
}

interface ArrowButtonProps {
  accessibilityLabel: string
  direction: 'previous' | 'next'
  disabled: boolean
  onPress: () => void
}

function ArrowButton({
  accessibilityLabel,
  direction,
  disabled,
  onPress
}: ArrowButtonProps) {
  const Icon = direction === 'previous' ? ChevronLeftIcon : ChevronRightIcon

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Icon color={theme.color.textSecondary} width={16} height={16} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[2],
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.divider,
    borderRadius: theme.radius.lg,
    shadowColor: theme.color.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1
  },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  arrow: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full
  },
  value: {
    minWidth: 58,
    color: theme.color.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center'
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: theme.color.divider
  },
  loading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2]
  },
  loadingText: {
    color: theme.color.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  disabled: {
    opacity: theme.opacity.muted
  },
  pressed: {
    backgroundColor: theme.color.brandSurface,
    opacity: theme.opacity.pressed
  }
})
