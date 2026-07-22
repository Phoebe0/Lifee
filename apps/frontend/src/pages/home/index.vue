<script setup lang="ts">
import { computed } from 'vue'
import MonthlySummaryPanel from '../../features/analytics/components/MonthlySummaryPanel.vue'
import TransactionItem from '../../features/finance/components/TransactionItem.vue'
import { useFinanceStore } from '../../stores/finance.store'

const financeStore = useFinanceStore()
const recentTransactions = computed(() => financeStore.currentMonthTransactions.slice(0, 3))

function openCreate() {
  uni.navigateTo({ url: '/pages/finance/create/index' })
}

function openList() {
  uni.switchTab({ url: '/pages/finance/list/index' })
}
</script>

<template>
  <view class="home-page">
    <view class="home-header">
      <view class="home-header__identity">
        <view class="home-header__avatar"><image src="/static/figma/avatar.jpg" mode="aspectFill" /></view>
        <text class="home-header__brand">Lifee</text>
      </view>
      <image class="home-header__bell" src="/static/figma/bell.svg" mode="aspectFit" />
    </view>

    <view class="home-main">
      <MonthlySummaryPanel
        :income-cent="financeStore.summary.incomeCent"
        :expense-cent="financeStore.summary.expenseCent"
        :balance-cent="financeStore.summary.balanceCent"
      />

      <view class="action-area">
        <button class="record-action" @tap="openCreate">
          <image class="record-action__texture" src="/static/figma/paw-print.jpg" mode="aspectFill" />
          <view class="record-action__content">
            <text class="record-action__plus">＋</text>
            <text class="record-action__label">+ 记一笔</text>
          </view>
        </button>
      </view>

      <view class="records-section">
        <view class="section-heading">
          <text class="section-heading__title">最近记录</text>
          <button class="section-heading__more" @tap="openList">查看全部</button>
        </view>
        <view v-if="recentTransactions.length" class="transaction-list">
          <TransactionItem v-for="item in recentTransactions" :key="item.id" :item="item" />
        </view>
        <view v-else class="empty-state" @tap="openCreate">
          <view class="empty-state__mark">日</view>
          <view><text class="empty-state__title">今天还没有记录</text><text class="empty-state__caption">点击上方按钮记下第一笔</text></view>
        </view>
      </view>

      <view class="insights-banner">
        <image class="insights-banner__image" src="/static/figma/insights-banner.jpg" mode="aspectFill" />
        <view class="insights-banner__overlay">
          <text class="insights-banner__title">支出分析报告</text>
          <text class="insights-banner__caption">看看你这周把钱花在哪了？</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.home-page { min-height: 100vh; padding-bottom: 48rpx; background: var(--color-bg-page); }
.home-header { display: flex; align-items: flex-end; height: calc(env(safe-area-inset-top) + 144rpx); padding: 0 40rpx 32rpx; background: rgba(248,249,255,.8); backdrop-filter: blur(16rpx); }
.home-header__identity { display: flex; align-items: center; }
.home-header__avatar { overflow: hidden; width: 80rpx; height: 80rpx; padding: 4rpx; border: 4rpx solid rgba(79,87,149,.2); border-radius: 50%; }
.home-header__avatar image { width: 100%; height: 100%; border-radius: 50%; }
.home-header__brand { margin-left: 24rpx; color: var(--color-brand); font-size: 38rpx; font-weight: 700; line-height: 64rpx; }
.home-header__bell { position: absolute; right: 220rpx; bottom: 52rpx; width: 32rpx; height: 40rpx; }
.home-main { display: flex; flex-direction: column; gap: 48rpx; padding: 48rpx 40rpx 0; }
.action-area { display: flex; align-items: center; justify-content: center; padding: 32rpx 0; }
.record-action { position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; width: 256rpx; height: 256rpx; margin: 0; padding: 0; color: #fff; background: linear-gradient(135deg, #4f5795 0%, #006879 100%); border-radius: 50%; box-shadow: var(--shadow-action); }
.record-action__texture { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .4; }
.record-action__content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; }
.record-action__plus, .record-action__label { display: block; }
.record-action__plus { height: 80rpx; font-size: 64rpx; font-weight: 300; line-height: 80rpx; }
.record-action__label { margin-top: 8rpx; font-size: 32rpx; line-height: 48rpx; letter-spacing: 1.6rpx; }
.records-section { display: flex; flex-direction: column; gap: 32rpx; }
.section-heading { display: flex; align-items: center; justify-content: space-between; }
.section-heading__title { color: var(--color-text-primary); font-size: 40rpx; line-height: 56rpx; }
.section-heading__more { margin: 0; padding: 12rpx 0 12rpx 24rpx; color: var(--color-brand); font-size: 24rpx; line-height: 32rpx; background: transparent; }
.transaction-list { display: flex; flex-direction: column; gap: 24rpx; }
.empty-state { display: flex; align-items: center; min-height: 172rpx; padding: 34rpx; background: var(--color-bg-surface); border: 2rpx solid var(--color-border); border-radius: var(--radius-medium); }
.empty-state__mark { display: flex; align-items: center; justify-content: center; width: 96rpx; height: 96rpx; margin-right: 32rpx; color: var(--color-brand); font-weight: 600; background: var(--color-brand-soft); border-radius: 50%; }
.empty-state__title, .empty-state__caption { display: block; }
.empty-state__title { font-size: 32rpx; line-height: 48rpx; }
.empty-state__caption { font-size: 24rpx; line-height: 32rpx; color: var(--color-text-secondary); }
.insights-banner { position: relative; overflow: hidden; height: 256rpx; border-radius: var(--radius-large); }
.insights-banner__image { width: 100%; height: 100%; }
.insights-banner__overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 48rpx; color: #fffbff; background: linear-gradient(90deg, rgba(79,87,149,.72), rgba(79,87,149,0)); }
.insights-banner__title, .insights-banner__caption { display: block; font-size: 32rpx; line-height: 48rpx; }
.insights-banner__caption { color: rgba(255,251,255,.8); }
</style>
