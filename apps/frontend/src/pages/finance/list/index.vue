<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import TransactionItem from '../../../features/finance/components/TransactionItem.vue'
import { formatMoney, type FinanceType } from '../../../features/finance/models/transaction'
import { useFinanceStore } from '../../../stores/finance.store'

const financeStore = useFinanceStore()
const filter = ref<'all' | FinanceType>('all')
const month = ref(dayjs().format('YYYY-MM'))
const monthLabel = computed(() => dayjs(`${month.value}-01`).format('YYYY年M月'))
const items = computed(() => financeStore.transactions
  .filter(item => item.occurredAt.startsWith(month.value))
  .filter(item => filter.value === 'all' || item.type === filter.value)
  .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)))
const monthIncomeCent = computed(() => items.value.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amountCent, 0))
const monthExpenseCent = computed(() => items.value.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amountCent, 0))

function changeMonth(offset: number) {
  month.value = dayjs(`${month.value}-01`).add(offset, 'month').format('YYYY-MM')
}

function openCreate() {
  uni.navigateTo({ url: '/pages/finance/create/index' })
}
</script>

<template>
  <view class="list-page">
    <view class="month-switcher">
      <button class="month-switcher__button" @tap="changeMonth(-1)">‹</button>
      <view class="month-switcher__center">
        <text class="month-switcher__month">{{ monthLabel }}</text>
        <text class="month-switcher__count">共 {{ items.length }} 笔记录</text>
      </view>
      <button class="month-switcher__button" @tap="changeMonth(1)">›</button>
    </view>
    <view class="overview">
      <view><text class="overview__label">收入</text><text class="overview__value overview__value--income">¥{{ formatMoney(monthIncomeCent) }}</text></view>
      <view><text class="overview__label">支出</text><text class="overview__value">¥{{ formatMoney(monthExpenseCent) }}</text></view>
    </view>
    <view class="filter-tabs">
      <button :class="['filter-tabs__item', { 'filter-tabs__item--active': filter === 'all' }]" @tap="filter = 'all'">全部</button>
      <button :class="['filter-tabs__item', { 'filter-tabs__item--active': filter === 'expense' }]" @tap="filter = 'expense'">支出</button>
      <button :class="['filter-tabs__item', { 'filter-tabs__item--active': filter === 'income' }]" @tap="filter = 'income'">收入</button>
    </view>
    <view v-if="items.length" class="transaction-list">
      <TransactionItem v-for="item in items" :key="item.id" :item="item" />
    </view>
    <view v-else class="empty-list">
      <text class="empty-list__mark">空</text>
      <text class="empty-list__title">这个月还没有记录</text>
      <button class="empty-list__action" @tap="openCreate">去记一笔</button>
    </view>
  </view>
</template>

<style scoped>
.list-page { min-height: 100vh; padding: 26rpx 32rpx 48rpx; }
.month-switcher { display: flex; align-items: center; justify-content: space-between; }
.month-switcher__button { width: 66rpx; height: 66rpx; margin: 0; padding: 0; color: var(--color-text-secondary); font-size: 44rpx; line-height: 62rpx; background: var(--color-bg-surface); border-radius: 50%; }
.month-switcher__center { text-align: center; }
.month-switcher__month, .month-switcher__count { display: block; }
.month-switcher__month { font-size: 30rpx; font-weight: var(--font-weight-semibold); }
.month-switcher__count { margin-top: 4rpx; font-size: 22rpx; color: var(--color-text-tertiary); }
.overview { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18rpx; margin-top: 30rpx; }
.overview > view { padding: 26rpx; background: var(--color-bg-surface); border-radius: var(--radius-medium); }
.overview__label, .overview__value { display: block; }
.overview__label { font-size: 22rpx; color: var(--color-text-tertiary); }
.overview__value { margin-top: 8rpx; font-size: 32rpx; font-weight: var(--font-weight-semibold); }
.overview__value--income { color: var(--color-income); }
.filter-tabs { display: flex; gap: 12rpx; margin: 34rpx 0 18rpx; }
.filter-tabs__item { margin: 0; padding: 12rpx 28rpx; font-size: 24rpx; color: var(--color-text-secondary); line-height: 1.4; background: var(--color-bg-subtle); border-radius: var(--radius-pill); }
.filter-tabs__item--active { color: #fff; background: var(--color-text-primary); }
.transaction-list { padding: 8rpx 26rpx; background: var(--color-bg-surface); border-radius: var(--radius-large); }
.transaction-list :deep(.transaction + .transaction) { border-top: 1rpx solid var(--color-border); }
.empty-list { display: flex; flex-direction: column; align-items: center; padding: 70rpx 20rpx; background: var(--color-bg-surface); border-radius: var(--radius-large); }
.empty-list__mark { display: flex; align-items: center; justify-content: center; width: 82rpx; height: 82rpx; color: var(--color-text-tertiary); background: var(--color-bg-subtle); border-radius: 24rpx; }
.empty-list__title { margin-top: 20rpx; color: var(--color-text-secondary); }
.empty-list__action { margin-top: 22rpx; padding: 12rpx 26rpx; font-size: 24rpx; line-height: 1.4; color: var(--color-brand); background: var(--color-brand-soft); border-radius: var(--radius-pill); }
</style>
