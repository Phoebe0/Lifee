import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import CalendarIcon from '../../../../assets/icons/common/calendar.svg'
import CloseIcon from '../../../../assets/icons/common/close.svg'
import NoteIcon from '../../../../assets/icons/common/note.svg'
import type { RootStackParamList } from '../../../application/navigation/types'
import { DatePickerModal } from '../../../components/date/DatePickerModal'
import { NumericKeypad } from '../../../components/input/NumericKeypad'
import { theme } from '../../../design/theme'
import { transactionCategories } from '../constants/categories'
import type { TransactionType } from '../models/transaction'
import { transactionRepository } from '../repositories/transactionRepository'

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTransaction'>

const MAX_AMOUNT_CENT = 9_999_999_999
const NOTE_MAX_LENGTH = 50

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const isSameDay = (left: Date, right: Date) => startOfDay(left).getTime() === startOfDay(right).getTime()

function formatDateLabel(date: Date) {
  const today = startOfDay(new Date())
  const difference = Math.round((today.getTime() - startOfDay(date).getTime()) / 86_400_000)
  if (difference === 0) return '今天'
  if (difference === 1) return '昨天'
  if (difference === 2) return '前天'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function amountDisplay(value: string) {
  return value || '0.00'
}

function amountInputValue(amountCent: number) {
  return (amountCent / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
}

function draftFingerprint(type: TransactionType, amount: string, categoryId: string, date: Date, note: string) {
  return JSON.stringify([type, amount, categoryId, date.getFullYear(), date.getMonth(), date.getDate(), note])
}

export function CreateTransactionScreen({ navigation, route }: Props) {
  const transactionId = route.params?.transactionId
  const initialType = route.params?.initialType ?? 'expense'
  const [type, setType] = useState<TransactionType>(initialType)
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(transactionCategories[initialType][0]?.id ?? '')
  const [date, setDate] = useState(new Date())
  const [note, setNote] = useState('')
  const [datePickerVisible, setDatePickerVisible] = useState(false)
  const [amountFocused, setAmountFocused] = useState(false)
  const [noteFocused, setNoteFocused] = useState(false)
  const [loadingRecord, setLoadingRecord] = useState(Boolean(transactionId))
  const [originalOccurredAt, setOriginalOccurredAt] = useState<Date | null>(null)
  const [initialFingerprint, setInitialFingerprint] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const categories = transactionCategories[type]
  const amountCent = useMemo(() => Math.round(Number(amount) * 100), [amount])
  const canSubmit = Number.isInteger(amountCent) && amountCent > 0 && amountCent <= MAX_AMOUNT_CENT && Boolean(categoryId) && !saving && !loadingRecord

  useEffect(() => {
    if (!transactionId) return
    let active = true

    void transactionRepository.getById(transactionId)
      .then(transaction => {
        if (!active) return
        if (!transaction) throw new Error('这笔记录不存在或已被删除。')
        const occurredAt = new Date(transaction.occurredAt)
        const safeDate = Number.isNaN(occurredAt.getTime()) ? new Date() : occurredAt
        const availableCategories = transactionCategories[transaction.type]
        const loadedAmount = amountInputValue(transaction.amountCent)
        const loadedCategoryId = availableCategories.some(item => item.id === transaction.categoryId)
          ? transaction.categoryId ?? availableCategories[0]?.id ?? ''
          : availableCategories[0]?.id ?? ''
        setType(transaction.type)
        setAmount(loadedAmount)
        setCategoryId(loadedCategoryId)
        setDate(safeDate)
        setOriginalOccurredAt(safeDate)
        setNote(transaction.note)
        setInitialFingerprint(draftFingerprint(transaction.type, loadedAmount, loadedCategoryId, safeDate, transaction.note))
      })
      .catch(error => {
        if (active) setErrorMessage(error instanceof Error ? error.message : '记录加载失败，请稍后重试。')
      })
      .finally(() => {
        if (active) setLoadingRecord(false)
      })

    return () => {
      active = false
    }
  }, [transactionId])

  const changeType = (nextType: TransactionType) => {
    setAmountFocused(false)
    if (nextType === type || saving) return
    setType(nextType)
    setCategoryId(transactionCategories[nextType][0]?.id ?? '')
    setErrorMessage(null)
  }

  const close = () => {
    const hasChanges = transactionId
      ? initialFingerprint !== null && initialFingerprint !== draftFingerprint(type, amount, categoryId, date, note)
      : Boolean(amount || note) || type !== initialType ||
        categoryId !== (transactionCategories[initialType][0]?.id ?? '') || !isSameDay(date, new Date())
    if (!hasChanges) {
      navigation.goBack()
      return
    }

    Alert.alert('放弃这笔记录？', '已填写的内容不会保存。', [
      { text: '继续填写', style: 'cancel' },
      { text: '放弃', style: 'destructive', onPress: () => navigation.goBack() }
    ])
  }

  const save = async () => {
    Keyboard.dismiss()

    if (!Number.isInteger(amountCent) || amountCent <= 0) {
      setErrorMessage('请输入大于 0 的金额。')
      return
    }
    if (amountCent > MAX_AMOUNT_CENT) {
      setErrorMessage('单笔金额不能超过 ¥99,999,999.99。')
      return
    }
    if (!categories.some(category => category.id === categoryId)) {
      setErrorMessage('请选择一个有效分类后再保存。')
      return
    }

    const now = originalOccurredAt ?? new Date()
    const occurredAt = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    )

    try {
      setSaving(true)
      setErrorMessage(null)
      const input = {
        type,
        amountCent,
        categoryId,
        occurredAt: occurredAt.toISOString(),
        note
      }
      if (transactionId) await transactionRepository.update(transactionId, input)
      else await transactionRepository.create(input)
      navigation.goBack()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存失败，请稍后重试。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.layout} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="关闭记账页面"
            hitSlop={8}
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            onPress={close}
          >
            <CloseIcon color={theme.color.brand} width={14} height={14} />
          </Pressable>
          <Text accessibilityRole="header" style={styles.headerTitle}>{transactionId ? '编辑记录' : '记一笔'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={[styles.form, amountFocused && styles.formWithKeypad]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => setAmountFocused(false)}
          showsVerticalScrollIndicator={false}
        >
          <View accessibilityRole="tablist" style={styles.segment}>
            {(['expense', 'income'] as const).map(item => {
              const selected = type === item
              return (
                <Pressable
                  key={item}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  disabled={saving || loadingRecord}
                  style={({ pressed }) => [styles.segmentItem, selected && styles.segmentActive, pressed && styles.pressed]}
                  onPress={() => changeType(item)}
                >
                  <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{item === 'expense' ? '支出' : '收入'}</Text>
                </Pressable>
              )
            })}
          </View>

          {errorMessage && (
            <View accessibilityRole="alert" style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setErrorMessage(null)}>
                <Text style={styles.errorDismiss}>关闭</Text>
              </Pressable>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`金额 ${amountDisplay(amount)} 元，点击输入`}
            accessibilityState={{ selected: amountFocused }}
            disabled={loadingRecord}
            style={({ pressed }) => [
              styles.amountSection,
              amountFocused && styles.amountSectionFocused,
              pressed && styles.pressed
            ]}
            onPress={() => {
              Keyboard.dismiss()
              setNoteFocused(false)
              setAmountFocused(true)
            }}
          >
            <Text style={styles.sectionLabel}>金额</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>¥</Text>
              <Text adjustsFontSizeToFit minimumFontScale={0.65} numberOfLines={1} style={styles.amount}>{amountDisplay(amount)}</Text>
              <View style={[styles.cursor, !amountFocused && styles.cursorHidden]} />
            </View>
          </Pressable>

          <View style={styles.categoriesSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionLabel}>选择分类</Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => {
                  setAmountFocused(false)
                  Alert.alert('分类管理', '自定义分类将在后续版本开放。')
                }}
              >
                <Text style={styles.moreText}>更多</Text>
              </Pressable>
            </View>
            <View style={styles.categoryGrid}>
              {categories.map(category => {
                const selected = categoryId === category.id
                const Icon = category.icon
                return (
                  <Pressable
                    key={category.id}
                    accessibilityRole="button"
                    accessibilityLabel={category.name}
                    accessibilityState={{ selected }}
                    disabled={saving || loadingRecord}
                    style={({ pressed }) => [styles.category, pressed && styles.pressed]}
                    onPress={() => {
                      setAmountFocused(false)
                      setCategoryId(category.id)
                      setErrorMessage(null)
                    }}
                  >
                    <View style={[styles.categoryIcon, selected && styles.categoryIconSelected]}>
                      <Icon color={selected ? theme.color.onBrand : theme.color.textSecondary} width={25} height={25} />
                    </View>
                    <Text numberOfLines={1} style={[styles.categoryText, selected && styles.categoryTextSelected]}>{category.name}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <View style={styles.detailsCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`日期，${formatDateLabel(date)}`}
              style={({ pressed }) => [styles.detailRow, pressed && styles.pressed]}
              onPress={() => {
                setAmountFocused(false)
                setDatePickerVisible(true)
              }}
            >
              <View style={styles.detailLabel}>
                <CalendarIcon color={theme.color.textTertiary} width={18} height={20} />
                <Text style={styles.detailText}>日期</Text>
              </View>
              <View style={styles.datePill}><Text style={styles.dateText}>{formatDateLabel(date)}</Text></View>
            </Pressable>
            <View style={styles.divider} />
            <View style={styles.noteRow}>
              <NoteIcon color={theme.color.textTertiary} width={18} height={16} />
              <TextInput
                accessibilityLabel="备注"
                maxLength={NOTE_MAX_LENGTH}
                placeholder="添加备注..."
                placeholderTextColor={theme.color.textDisabled}
                returnKeyType="done"
                editable={!loadingRecord && !saving}
                value={note}
                style={styles.noteInput}
                onBlur={() => setNoteFocused(false)}
                onChangeText={setNote}
                onFocus={() => {
                  setAmountFocused(false)
                  setNoteFocused(true)
                }}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              {noteFocused && <Text style={styles.noteCount}>{note.length}/{NOTE_MAX_LENGTH}</Text>}
            </View>
          </View>
        </ScrollView>

        <NumericKeypad
          disabled={saving || loadingRecord}
          submitDisabled={!canSubmit}
          submitLabel={loadingRecord ? '加载中' : saving ? '保存中' : 'DONE'}
          value={amount}
          visible={amountFocused && !noteFocused}
          onChange={value => {
            setAmount(value)
            setErrorMessage(null)
          }}
          onLimitReached={() => setErrorMessage('金额最多输入 8 位整数和 2 位小数。')}
          onRequestClose={() => setAmountFocused(false)}
          onSubmit={() => void save()}
        />
      </KeyboardAvoidingView>

      <DatePickerModal
        maximumDate={new Date()}
        value={date}
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onConfirm={nextDate => {
          setDate(nextDate)
          setDatePickerVisible(false)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.color.background },
  layout: { flex: 1 },
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.color.surfaceHeader
  },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full },
  headerTitle: { color: theme.color.brand, fontSize: 24, lineHeight: 32, fontWeight: '600' },
  headerSpacer: { width: 40, height: 40 },
  formScroll: { flex: 1 },
  form: { gap: theme.spacing[4], paddingTop: theme.spacing[6], paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[5] },
  formWithKeypad: { paddingBottom: 340 },
  segment: { flexDirection: 'row', padding: theme.spacing[1], backgroundColor: theme.color.brandSurface, borderRadius: theme.radius.full, shadowColor: theme.color.brand, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing[2], borderRadius: theme.radius.full },
  segmentActive: { backgroundColor: theme.color.brand },
  segmentText: { color: theme.color.textSecondary, fontSize: theme.typography.caption, lineHeight: 16, fontWeight: '600' },
  segmentTextActive: { color: theme.color.onBrand },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], backgroundColor: theme.color.dangerSurface, borderRadius: theme.radius.md },
  errorText: { flex: 1, color: theme.color.danger, fontSize: theme.typography.caption, lineHeight: 18 },
  errorDismiss: { color: theme.color.danger, fontSize: theme.typography.caption, lineHeight: 18, fontWeight: '700' },
  amountSection: { alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing[6] },
  amountSectionFocused: { backgroundColor: theme.color.surfaceSubtle, borderRadius: theme.radius.lg },
  sectionLabel: { color: theme.color.textSecondary, fontSize: theme.typography.caption, lineHeight: 16, fontWeight: '500' },
  amountRow: { maxWidth: '100%', minHeight: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  currency: { color: theme.color.brand, fontSize: 28, lineHeight: 36, fontWeight: '700', marginRight: theme.spacing[1] },
  amount: { flexShrink: 1, color: theme.color.brand, fontSize: theme.typography.amount, lineHeight: 48, fontWeight: '800' },
  cursor: { width: 4, height: 40, marginLeft: theme.spacing[1], backgroundColor: theme.color.cursor, borderRadius: theme.radius.full },
  cursorHidden: { opacity: 0 },
  categoriesSection: { gap: theme.spacing[2] },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  moreText: { color: theme.color.brand, fontSize: theme.typography.caption, lineHeight: 16, fontWeight: '500' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: theme.spacing[4] },
  category: { width: '25%', minWidth: 0, height: 77, alignItems: 'center', gap: 3 },
  categoryIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.color.categorySurface, borderRadius: 16 },
  categoryIconSelected: { backgroundColor: theme.color.brand, shadowColor: theme.color.brand, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },
  categoryText: { maxWidth: '100%', color: theme.color.textSecondary, fontSize: 11, lineHeight: 16, fontWeight: '500' },
  categoryTextSelected: { color: theme.color.brand },
  detailsCard: { gap: theme.spacing[4], padding: 19, backgroundColor: theme.color.surfaceSubtle, borderWidth: 1, borderColor: theme.color.borderOverlay, borderRadius: theme.radius.xl },
  detailRow: { minHeight: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailLabel: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  detailText: { color: theme.color.textSecondary, fontSize: theme.typography.body, lineHeight: 20, fontWeight: '500' },
  datePill: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[1], backgroundColor: theme.color.brandSoft, borderRadius: theme.radius.full },
  dateText: { color: theme.color.brand, fontSize: theme.typography.caption, lineHeight: 16, fontWeight: '500' },
  divider: { height: 1, backgroundColor: theme.color.divider },
  noteRow: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  noteInput: { flex: 1, minWidth: 0, paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[3], color: theme.color.text, fontSize: theme.typography.body, lineHeight: 20 },
  noteCount: { color: theme.color.textTertiary, fontSize: 10, lineHeight: 14 },
  pressed: { opacity: theme.opacity.pressed }
})
