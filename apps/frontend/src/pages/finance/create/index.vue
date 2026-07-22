<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { FINANCE_CATEGORIES, type FinanceType } from '../../../features/finance/models/transaction'
import { useFinanceStore } from '../../../stores/finance.store'

const financeStore = useFinanceStore()
const type = ref<FinanceType>('expense')
const amount = ref('')
const categoryId = ref('food')
const date = ref(dayjs().format('YYYY-MM-DD'))
const remark = ref('')
const saving = ref(false)

const categories = computed(() => FINANCE_CATEGORIES.filter(item => item.type === type.value))
const selectedCategory = computed(() => categories.value.find(item => item.id === categoryId.value) ?? categories.value[0])
const canSave = computed(() => Number(amount.value) > 0 && !saving.value)

watch(type, () => { categoryId.value = categories.value[0]?.id ?? '' })

function onAmountInput(event: Event) {
  const value = (event as Event & { detail: { value: string } }).detail.value
  const normalized = value.replace(/[^\d.]/g, '').replace(/(\.\d{2}).+/, '$1')
  const [integer = '', ...decimal] = normalized.split('.')
  amount.value = decimal.length ? `${integer}.${decimal.join('')}` : integer
}

function onDateChange(event: { detail: { value: string } }) {
  date.value = event.detail.value
}

function save() {
  const amountCent = Math.round(Number(amount.value) * 100)
  if (!amountCent || !selectedCategory.value) {
    uni.showToast({ title: '请输入有效金额', icon: 'none' })
    return
  }
  saving.value = true
  financeStore.addTransaction({
    type: type.value,
    amountCent,
    category: selectedCategory.value,
    occurredAt: dayjs(`${date.value} ${dayjs().format('HH:mm:ss')}`).toISOString(),
    remark: remark.value
  })
  uni.showToast({ title: '已记下', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 450)
}
</script>

<template>
  <view class="create-page">
    <view class="type-switch">
      <button :class="['type-switch__item', { 'type-switch__item--active': type === 'expense' }]" @tap="type = 'expense'">支出</button>
      <button :class="['type-switch__item', { 'type-switch__item--active': type === 'income' }]" @tap="type = 'income'">收入</button>
    </view>

    <view class="amount-panel">
      <text class="amount-panel__label">{{ type === 'expense' ? '支出金额' : '收入金额' }}</text>
      <view class="amount-panel__input-row">
        <text class="amount-panel__currency">¥</text>
        <input :value="amount" class="amount-panel__input" type="digit" placeholder="0.00" focus @input="onAmountInput" />
      </view>
    </view>

    <view class="form-section">
      <text class="form-section__title">选择分类</text>
      <view class="category-grid">
        <button
          v-for="category in categories"
          :key="category.id"
          :class="['category-item', { 'category-item--active': categoryId === category.id }]"
          @tap="categoryId = category.id"
        >
          <text class="category-item__glyph">{{ category.glyph }}</text>
          <text class="category-item__name">{{ category.name }}</text>
        </button>
      </view>
    </view>

    <view class="form-card">
      <picker mode="date" :value="date" @change="onDateChange">
        <view class="form-row">
          <text class="form-row__label">日期</text>
          <text class="form-row__value">{{ date }}　›</text>
        </view>
      </picker>
      <view class="form-row form-row--remark">
        <text class="form-row__label">备注</text>
        <input v-model="remark" class="form-row__input" maxlength="30" placeholder="写点什么（选填）" />
      </view>
    </view>

    <button class="save-button" :disabled="!canSave" @tap="save">保存这笔记录</button>
  </view>
</template>

<style scoped>
.create-page { min-height: 100vh; padding: 28rpx 32rpx calc(env(safe-area-inset-bottom) + 40rpx); }
.type-switch { display: flex; width: 300rpx; margin: 0 auto 38rpx; padding: 6rpx; background: var(--color-bg-subtle); border-radius: var(--radius-pill); }
.type-switch__item { flex: 1; margin: 0; padding: 14rpx 0; font-size: 26rpx; color: var(--color-text-secondary); line-height: 1.4; background: transparent; border-radius: var(--radius-pill); }
.type-switch__item--active { color: var(--color-text-primary); font-weight: var(--font-weight-semibold); background: var(--color-bg-surface); box-shadow: 0 4rpx 12rpx rgba(24,32,27,.08); }
.amount-panel { padding: 36rpx 36rpx 44rpx; background: var(--color-bg-surface); border-radius: var(--radius-large); }
.amount-panel__label { font-size: 24rpx; color: var(--color-text-secondary); }
.amount-panel__input-row { display: flex; align-items: center; margin-top: 18rpx; }
.amount-panel__currency { margin-right: 18rpx; font-size: 42rpx; font-weight: var(--font-weight-medium); }
.amount-panel__input { flex: 1; height: 90rpx; font-size: 70rpx; font-weight: var(--font-weight-semibold); line-height: 90rpx; }
.form-section { margin-top: 42rpx; }
.form-section__title { font-size: 28rpx; font-weight: var(--font-weight-semibold); }
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18rpx; margin-top: 20rpx; }
.category-item { display: flex; flex-direction: column; align-items: center; margin: 0; padding: 20rpx 8rpx 16rpx; font-size: 24rpx; line-height: 1.4; color: var(--color-text-secondary); background: var(--color-bg-surface); border: 2rpx solid transparent; border-radius: var(--radius-medium); }
.category-item--active { color: var(--color-brand); background: var(--color-brand-soft); border-color: rgba(25,135,84,.3); }
.category-item__glyph { display: flex; align-items: center; justify-content: center; width: 58rpx; height: 58rpx; font-weight: var(--font-weight-semibold); background: rgba(255,255,255,.72); border-radius: 18rpx; }
.category-item__name { margin-top: 10rpx; }
.form-card { margin-top: 32rpx; padding: 0 28rpx; background: var(--color-bg-surface); border-radius: var(--radius-large); }
.form-row { display: flex; align-items: center; justify-content: space-between; min-height: 100rpx; }
.form-row--remark { border-top: 1rpx solid var(--color-border); }
.form-row__label { font-size: 26rpx; font-weight: var(--font-weight-medium); }
.form-row__value { font-size: 24rpx; color: var(--color-text-secondary); }
.form-row__input { flex: 1; height: 84rpx; margin-left: 50rpx; font-size: 24rpx; text-align: right; }
.save-button { margin-top: 46rpx; padding: 24rpx; font-size: 28rpx; font-weight: var(--font-weight-semibold); color: #fff; line-height: 1.5; background: var(--color-brand); border-radius: var(--radius-pill); box-shadow: var(--shadow-action); }
.save-button[disabled] { opacity: var(--opacity-disabled); }
</style>
