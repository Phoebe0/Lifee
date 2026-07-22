<script setup lang="ts">
import dayjs from 'dayjs'
import type { LocalTransaction } from '../models/transaction'
import { formatMoney } from '../models/transaction'
defineProps<{ item: LocalTransaction }>()
</script>

<template>
  <view class="transaction">
    <view class="transaction__identity">
      <view class="transaction__glyph" :class="`transaction__glyph--${item.type}`">{{ item.categoryGlyph }}</view>
      <view class="transaction__content"><text class="transaction__title">{{ item.remark || item.categoryName }}</text><text class="transaction__meta">{{ dayjs(item.occurredAt).format('MM月DD日 HH:mm') }} · {{ item.categoryName }}</text></view>
    </view>
    <view class="transaction__money">
      <text class="transaction__amount" :class="`transaction__amount--${item.type}`">{{ item.type === 'income' ? '+' : '-' }} ¥ {{ formatMoney(item.amountCent) }}</text>
      <text class="transaction__account">默认账户</text>
    </view>
  </view>
</template>

<style scoped>
.transaction { display: flex; align-items: center; justify-content: space-between; min-height: 172rpx; padding: 34rpx; background: var(--color-bg-surface); border: 2rpx solid var(--color-border); border-radius: var(--radius-medium); backdrop-filter: blur(12rpx); }
.transaction__identity { display: flex; align-items: center; min-width: 0; }
.transaction__glyph { display: flex; flex: 0 0 96rpx; align-items: center; justify-content: center; width: 96rpx; height: 96rpx; margin-right: 32rpx; font-size: 28rpx; font-weight: 600; border-radius: 50%; }
.transaction__glyph--expense { color: #ff9800; background: var(--color-expense-soft); }
.transaction__glyph--income { color: var(--color-income); background: var(--color-income-soft); }
.transaction__content { min-width: 0; }
.transaction__title, .transaction__meta { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.transaction__title { font-size: 32rpx; line-height: 48rpx; color: var(--color-text-primary); }
.transaction__meta { font-size: 24rpx; font-weight: 600; line-height: 32rpx; color: var(--color-text-secondary); }
.transaction__money { display: flex; flex-direction: column; align-items: flex-end; margin-left: 20rpx; }
.transaction__amount { font-size: 34rpx; font-weight: 600; line-height: 48rpx; white-space: nowrap; }
.transaction__amount--expense { color: var(--color-expense); }
.transaction__amount--income { color: var(--color-income); }
.transaction__account { margin-top: 10rpx; padding: 0 16rpx; font-size: 20rpx; line-height: 30rpx; color: var(--color-text-secondary); background: #dfe9fc; border-radius: var(--radius-pill); }
</style>
