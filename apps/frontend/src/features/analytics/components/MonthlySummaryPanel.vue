<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '../../finance/models/transaction'

const props = defineProps<{ incomeCent: number; expenseCent: number; balanceCent: number }>()
const budgetCent = 1200000
const budgetPercent = computed(() => Math.min(100, Math.round(props.expenseCent / budgetCent * 100)))
const budgetRemain = computed(() => Math.max(0, budgetCent - props.expenseCent))
</script>

<template>
  <view class="summary-card">
    <view class="summary-card__balance">
      <text class="summary-card__label">本月结余</text>
      <view class="summary-card__amount-row">
        <text class="summary-card__amount">¥ {{ formatMoney(balanceCent) }}</text>
        <text class="summary-card__trend">⌁</text>
      </view>
    </view>
    <view class="summary-card__metrics">
      <view class="summary-card__metric"><text class="summary-card__metric-label">本月收入</text><text class="summary-card__metric-value summary-card__metric-value--income">¥ {{ formatMoney(incomeCent) }}</text></view>
      <view class="summary-card__metric"><text class="summary-card__metric-label">本月支出</text><text class="summary-card__metric-value summary-card__metric-value--expense">¥ {{ formatMoney(expenseCent) }}</text></view>
      <view class="summary-card__metric"><text class="summary-card__metric-label">净值</text><text class="summary-card__metric-value">¥ {{ formatMoney(balanceCent) }}</text></view>
    </view>
    <view class="budget">
      <view class="budget__labels"><text>预算使用情况 ({{ budgetPercent }}%)</text><text class="budget__remain">还剩 ¥{{ formatMoney(budgetRemain) }}</text></view>
      <view class="budget__track"><view class="budget__progress" :style="{ width: `${budgetPercent}%` }" /></view>
    </view>
    <view class="summary-card__glow" />
  </view>
</template>

<style scoped>
.summary-card { position: relative; overflow: hidden; width: 100%; padding: 86rpx 38rpx 38rpx; color: var(--color-text-primary); background: var(--color-bg-surface); border: 2rpx solid var(--color-border); border-radius: var(--radius-large); box-shadow: var(--shadow-card); backdrop-filter: blur(12rpx); }
.summary-card__balance, .summary-card__metrics, .budget { position: relative; z-index: 1; }
.summary-card__label { font-size: 24rpx; line-height: 32rpx; color: var(--color-text-secondary); letter-spacing: 1.2rpx; }
.summary-card__amount-row { display: flex; align-items: baseline; gap: 16rpx; margin-top: 8rpx; }
.summary-card__amount { color: var(--color-brand); font-size: 64rpx; font-weight: 700; line-height: 80rpx; }
.summary-card__trend { color: var(--color-brand); font-size: 28rpx; }
.summary-card__metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32rpx; margin-top: 48rpx; }
.summary-card__metric-label, .summary-card__metric-value { display: block; }
.summary-card__metric-label { font-size: 24rpx; line-height: 32rpx; color: var(--color-text-secondary); }
.summary-card__metric-value { margin-top: 8rpx; color: var(--color-brand); font-size: 34rpx; font-weight: 600; line-height: 48rpx; white-space: nowrap; }
.summary-card__metric-value--income { color: var(--color-income); }
.summary-card__metric-value--expense { color: var(--color-expense); }
.budget { margin-top: 48rpx; }
.budget__labels { display: flex; justify-content: space-between; font-size: 24rpx; font-weight: 600; line-height: 32rpx; color: var(--color-text-secondary); }
.budget__remain { color: var(--color-brand); }
.budget__track { overflow: hidden; height: 24rpx; margin-top: 16rpx; background: var(--color-brand-soft); border-radius: var(--radius-pill); }
.budget__progress { min-width: 0; height: 100%; background: linear-gradient(90deg, #6cd5ed 0%, #4f5795 100%); border-radius: var(--radius-pill); box-shadow: 0 0 24rpx rgba(108, 213, 237, .4); }
.summary-card__glow { position: absolute; top: -64rpx; right: -64rpx; width: 256rpx; height: 256rpx; background: rgba(79,87,149,.05); border-radius: 50%; filter: blur(64rpx); }
</style>
