import { Pressable, StyleSheet, Text, View } from 'react-native'
import { theme } from '../../../design/theme'
import type { AnalyticsRange } from '../models/analytics'

const options: { value: AnalyticsRange; label: string }[] = [
  { value: 7, label: '近一周' },
  { value: 30, label: '近30天' },
  { value: 90, label: '近90天' }
]

interface AnalyticsRangeSelectorProps {
  value: AnalyticsRange
  onChange: (value: AnalyticsRange) => void
  disabled?: boolean
}

export function AnalyticsRangeSelector({
  value,
  onChange,
  disabled = false
}: AnalyticsRangeSelectorProps) {
  return (
    <View accessibilityRole="tablist" style={styles.container}>
      {options.map(option => {
        const selected = option.value === value
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.pressed
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing[1],
    padding: theme.spacing[1],
    backgroundColor: theme.color.brandSurface,
    borderWidth: 1,
    borderColor: theme.auth.brandBorder,
    borderRadius: theme.radius.md
  },
  option: {
    minHeight: 34,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[2],
    borderRadius: 9
  },
  optionSelected: {
    backgroundColor: theme.color.brand,
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2
  },
  label: {
    color: theme.color.textTertiary,
    fontSize: 12,
    fontWeight: '600'
  },
  labelSelected: {
    color: theme.color.onBrand,
    fontWeight: '800'
  },
  pressed: {
    opacity: theme.opacity.pressed
  }
})
