<template>
  <view class="asset-page">
    <view class="asset-total">
      <text class="asset-total__label">净资产</text>
      <text class="asset-total__value">¥ 0.00</text>
      <text class="asset-total__caption">资产功能将在后续版本开放</text>
    </view>
    <view class="asset-section">
      <text class="asset-section__title">账户</text>
      <view class="asset-placeholder">
        <view class="asset-placeholder__glyph">＋</view>
        <view><text class="asset-placeholder__title">添加你的第一个账户</text><text class="asset-placeholder__caption">现金、银行卡与数字钱包将统一管理</text></view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.asset-page { min-height: 100vh; padding: 28rpx 32rpx 48rpx; }
.asset-total { padding: 40rpx 36rpx; color: #fff; background: var(--color-text-primary); border-radius: var(--radius-large); }
.asset-total__label, .asset-total__value, .asset-total__caption { display: block; }
.asset-total__label { font-size: 24rpx; color: rgba(255,255,255,.65); }
.asset-total__value { margin-top: 12rpx; font-size: 52rpx; font-weight: var(--font-weight-semibold); }
.asset-total__caption { margin-top: 24rpx; font-size: 22rpx; color: rgba(255,255,255,.48); }
.asset-section { margin-top: 40rpx; }
.asset-section__title { font-size: 30rpx; font-weight: var(--font-weight-semibold); }
.asset-placeholder { display: flex; align-items: center; margin-top: 18rpx; padding: 30rpx; background: var(--color-bg-surface); border-radius: var(--radius-large); }
.asset-placeholder__glyph { display: flex; align-items: center; justify-content: center; width: 74rpx; height: 74rpx; margin-right: 22rpx; color: var(--color-brand); font-size: 38rpx; background: var(--color-brand-soft); border-radius: 22rpx; }
.asset-placeholder__title, .asset-placeholder__caption { display: block; }
.asset-placeholder__title { font-size: 27rpx; font-weight: var(--font-weight-medium); }
.asset-placeholder__caption { margin-top: 7rpx; font-size: 22rpx; color: var(--color-text-tertiary); }
</style>
