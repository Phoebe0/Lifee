<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '../../features/finance/models/transaction'
import { useAuthStore } from '../../stores/auth.store'
import { useFinanceStore } from '../../stores/finance.store'

const authStore = useAuthStore()
const financeStore = useFinanceStore()
const nickname = computed(() => authStore.user?.nickname || 'Lifee 用户')
const menuItems = [
  { glyph: '类', title: '分类管理', caption: '管理收入与支出分类' },
  { glyph: '导', title: '数据导出', caption: '导出能力预留' },
  { glyph: '意', title: '意见反馈', caption: '帮助我们做得更好' },
  { glyph: '关', title: '关于 Lifee日序', caption: '版本 0.1.0' }
]
</script>

<template>
  <view class="profile-page">
    <view class="profile-nav"><text class="profile-nav__brand">Lifee日序</text><text class="profile-nav__title">我的</text></view>
    <view class="user-card">
      <view class="user-card__avatar">L</view>
      <view class="user-card__content"><text class="user-card__name">{{ nickname }}</text><text class="user-card__caption">认真生活，也轻松记录</text></view>
      <text class="user-card__arrow">›</text>
    </view>
    <view class="stats">
      <view><text class="stats__value">{{ financeStore.allTimeSummary.count }}</text><text class="stats__label">累计笔数</text></view>
      <view><text class="stats__value stats__value--income">{{ formatMoney(financeStore.allTimeSummary.incomeCent) }}</text><text class="stats__label">累计收入</text></view>
      <view><text class="stats__value">{{ formatMoney(financeStore.allTimeSummary.expenseCent) }}</text><text class="stats__label">累计支出</text></view>
    </view>
    <view class="menu-list">
      <view v-for="item in menuItems" :key="item.title" class="menu-item">
        <view class="menu-item__glyph">{{ item.glyph }}</view>
        <view class="menu-item__content"><text class="menu-item__title">{{ item.title }}</text><text class="menu-item__caption">{{ item.caption }}</text></view>
        <text class="menu-item__arrow">›</text>
      </view>
    </view>
    <text class="profile-footer">Lifee日序 · 让生活有迹可循</text>
  </view>
</template>

<style scoped>
.profile-page { min-height: 100vh; padding: calc(env(safe-area-inset-top) + 28rpx) 32rpx 48rpx; }
.profile-nav__brand, .profile-nav__title { display: block; }
.profile-nav__brand { font-size: 22rpx; color: var(--color-brand); font-weight: var(--font-weight-semibold); }
.profile-nav__title { margin-top: 6rpx; font-size: 38rpx; font-weight: var(--font-weight-semibold); }
.user-card { display: flex; align-items: center; margin-top: 30rpx; padding: 30rpx; background: var(--color-bg-surface); border-radius: var(--radius-large); }
.user-card__avatar { display: flex; align-items: center; justify-content: center; width: 92rpx; height: 92rpx; margin-right: 24rpx; color: #fff; font-size: 34rpx; font-weight: var(--font-weight-semibold); background: var(--color-brand); border-radius: 50%; }
.user-card__content { flex: 1; }
.user-card__name, .user-card__caption { display: block; }
.user-card__name { font-size: 30rpx; font-weight: var(--font-weight-semibold); }
.user-card__caption { margin-top: 7rpx; font-size: 22rpx; color: var(--color-text-tertiary); }
.user-card__arrow, .menu-item__arrow { font-size: 40rpx; color: var(--color-text-tertiary); }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 22rpx; padding: 28rpx 8rpx; text-align: center; background: var(--color-bg-surface); border-radius: var(--radius-large); }
.stats > view + view { border-left: 1rpx solid var(--color-border); }
.stats__value, .stats__label { display: block; }
.stats__value { font-size: 26rpx; font-weight: var(--font-weight-semibold); }
.stats__value--income { color: var(--color-income); }
.stats__label { margin-top: 7rpx; font-size: 20rpx; color: var(--color-text-tertiary); }
.menu-list { margin-top: 30rpx; padding: 4rpx 26rpx; background: var(--color-bg-surface); border-radius: var(--radius-large); }
.menu-item { display: flex; align-items: center; min-height: 112rpx; }
.menu-item + .menu-item { border-top: 1rpx solid var(--color-border); }
.menu-item__glyph { display: flex; align-items: center; justify-content: center; width: 64rpx; height: 64rpx; margin-right: 20rpx; color: var(--color-brand); font-size: 23rpx; font-weight: var(--font-weight-semibold); background: var(--color-brand-soft); border-radius: 18rpx; }
.menu-item__content { flex: 1; }
.menu-item__title, .menu-item__caption { display: block; }
.menu-item__title { font-size: 26rpx; font-weight: var(--font-weight-medium); }
.menu-item__caption { margin-top: 5rpx; font-size: 21rpx; color: var(--color-text-tertiary); }
.profile-footer { display: block; margin-top: 40rpx; text-align: center; font-size: 21rpx; color: var(--color-text-tertiary); }
</style>
