import { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import ChevronLeftIcon from '../../../assets/icons/common/chevron-left.svg'
import ChevronRightIcon from '../../../assets/icons/common/chevron-right.svg'
import CloseIcon from '../../../assets/icons/common/modal-close.svg'
import { theme } from '../../design/theme'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export interface DatePickerModalProps {
  visible: boolean
  value: Date
  onConfirm: (date: Date) => void
  onClose: () => void
  minimumDate?: Date
  maximumDate?: Date
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const isSameDay = (left: Date, right: Date) => startOfDay(left).getTime() === startOfDay(right).getTime()
const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
const validDate = (date: Date) => Number.isNaN(date.getTime()) ? new Date() : date

export function DatePickerModal({
  visible,
  value,
  onConfirm,
  onClose,
  minimumDate,
  maximumDate = new Date()
}: DatePickerModalProps) {
  const [draft, setDraft] = useState(() => startOfDay(validDate(value)))
  const [month, setMonth] = useState(() => {
    const initial = validDate(value)
    return new Date(initial.getFullYear(), initial.getMonth(), 1)
  })

  useEffect(() => {
    if (!visible) return
    const next = startOfDay(validDate(value))
    setDraft(next)
    setMonth(new Date(next.getFullYear(), next.getMonth(), 1))
  }, [visible, value])

  const days = useMemo(() => {
    const firstWeekday = (month.getDay() + 6) % 7
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstWeekday + 1
      return day > 0 && day <= count ? new Date(month.getFullYear(), month.getMonth(), day) : null
    })
  }, [month])

  const isDisabled = (date: Date) => {
    if (minimumDate && startOfDay(date) < startOfDay(minimumDate)) return true
    return maximumDate ? startOfDay(date) > startOfDay(maximumDate) : false
  }

  const maxMonth = new Date(maximumDate.getFullYear(), maximumDate.getMonth(), 1)
  const canGoNext = month < maxMonth

  const selectQuickDate = (offset: number) => {
    const date = addDays(startOfDay(maximumDate), offset)
    if (isDisabled(date)) return
    setDraft(date)
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  return (
    <Modal animationType="fade" transparent statusBarTranslucent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="关闭日期选择器" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View accessibilityViewIsModal style={styles.modal}>
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>选择日期</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="关闭"
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={onClose}
              >
                <CloseIcon color={theme.color.textSecondary} width={14} height={14} />
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
              {[
                { label: '前天', offset: -2 },
                { label: '昨天', offset: -1 },
                { label: '今天', offset: 0 }
              ].map(item => {
                const date = addDays(startOfDay(maximumDate), item.offset)
                const selected = isSameDay(date, draft)
                return (
                  <Pressable
                    key={item.label}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled: isDisabled(date) }}
                    disabled={isDisabled(date)}
                    style={({ pressed }) => [styles.quickButton, selected && styles.quickButtonSelected, pressed && styles.pressed]}
                    onPress={() => selectQuickDate(item.offset)}
                  >
                    <Text style={[styles.quickText, selected && styles.quickTextSelected]}>{item.label}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            <View style={styles.calendar}>
              <View style={styles.monthHeader}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="上个月"
                  hitSlop={8}
                  style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
                  onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                >
                  <ChevronLeftIcon color={theme.color.textSecondary} width={8} height={12} />
                </Pressable>
                <Text style={styles.monthTitle}>{month.getFullYear()}年 {month.getMonth() + 1}月</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="下个月"
                  accessibilityState={{ disabled: !canGoNext }}
                  disabled={!canGoNext}
                  hitSlop={8}
                  style={({ pressed }) => [styles.monthButton, !canGoNext && styles.invisible, pressed && styles.pressed]}
                  onPress={() => setMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                >
                  <ChevronRightIcon color={theme.color.textSecondary} width={8} height={12} />
                </Pressable>
              </View>

              <View style={styles.weekRow}>
                {WEEKDAYS.map(day => <Text key={day} style={styles.weekday}>{day}</Text>)}
              </View>
              <View style={styles.grid}>
                {days.map((date, index) => {
                  if (!date) return <View key={`empty-${index}`} style={styles.dayCell} />
                  const selected = isSameDay(date, draft)
                  const disabled = isDisabled(date)
                  return (
                    <View key={date.toISOString()} style={styles.dayCell}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${date.getMonth() + 1}月${date.getDate()}日`}
                        accessibilityState={{ selected, disabled }}
                        disabled={disabled}
                        style={({ pressed }) => [styles.dayButton, selected && styles.daySelected, pressed && !disabled && styles.pressed]}
                        onPress={() => setDraft(date)}
                      >
                        <Text style={[styles.dayText, selected && styles.dayTextSelected, disabled && styles.dayTextDisabled]}>{date.getDate()}</Text>
                      </Pressable>
                    </View>
                  )
                })}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="确认日期"
              style={({ pressed }) => [styles.confirm, pressed && styles.confirmPressed]}
              onPress={() => onConfirm(draft)}
            >
              <Text style={styles.confirmText}>确定</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing[5], backgroundColor: theme.color.backdrop },
  modal: {
    width: '100%',
    maxWidth: 350,
    maxHeight: '94%',
    backgroundColor: theme.color.surfaceModal,
    borderWidth: 1,
    borderColor: theme.color.borderOverlay,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16
  },
  modalContent: { padding: 25 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: theme.color.text, fontSize: theme.typography.title, lineHeight: 30, fontWeight: '600' },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.surfaceControl, borderRadius: theme.radius.full },
  quickRow: { gap: theme.spacing[2], paddingTop: theme.spacing[6], paddingBottom: theme.spacing[1] },
  quickButton: { minWidth: 66, alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[5], paddingVertical: 10, backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.border, borderRadius: theme.radius.full },
  quickButtonSelected: { backgroundColor: theme.color.brand, borderColor: theme.color.brand },
  quickText: { color: theme.color.textSecondary, fontSize: theme.typography.caption, lineHeight: 16, fontWeight: '500' },
  quickTextSelected: { color: theme.color.onBrand },
  calendar: { marginTop: theme.spacing[6], padding: 19, backgroundColor: theme.color.surfaceCalendar, borderWidth: 1, borderColor: theme.color.borderOverlay, borderRadius: theme.radius.xl },
  monthHeader: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing[2] },
  monthButton: { width: 32, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full },
  monthTitle: { color: theme.color.text, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  weekRow: { flexDirection: 'row', marginTop: theme.spacing[2], marginBottom: theme.spacing[1] },
  weekday: { width: '14.2857%', color: theme.color.textTertiary, fontSize: theme.typography.caption, lineHeight: 24, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.2857%', height: 40, alignItems: 'center', justifyContent: 'center' },
  dayButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full },
  daySelected: { backgroundColor: theme.color.brand, shadowColor: theme.color.brand, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  dayText: { color: theme.color.text, fontSize: 15, lineHeight: 22 },
  dayTextSelected: { color: theme.color.onBrand },
  dayTextDisabled: { color: theme.color.textDisabled },
  confirm: { height: 56, marginTop: theme.spacing[10], alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.brand, borderRadius: theme.radius.full, shadowColor: theme.color.shadowBrand, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 5 },
  confirmPressed: { backgroundColor: theme.color.brandPressed, transform: [{ scale: 0.99 }] },
  confirmText: { color: theme.color.onBrand, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  pressed: { opacity: theme.opacity.pressed },
  invisible: { opacity: 0.25 }
})
