<script setup lang="ts">
import { useAuthStore } from '../../../stores/auth.store'

const authStore = useAuthStore()

function login() {
  authStore.setSession('local-preview-token', { id: 'local-user', nickname: 'Lifee 用户' })
  uni.switchTab({ url: '/pages/home/index' })
}
</script>

<template>
  <view class="login-page">
    <view class="login-page__brand">L</view>
    <text class="login-page__title">欢迎来到 Lifee日序</text>
    <text class="login-page__caption">轻松记录每一笔，慢慢读懂自己的生活</text>
    <button class="login-page__button" @tap="login">微信快捷登录</button>
    <text class="login-page__agreement">登录即表示同意用户协议与隐私政策</text>
  </view>
</template>

<style scoped>
.login-page { display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 150rpx 52rpx 60rpx; }
.login-page__brand { display: flex; align-items: center; justify-content: center; width: 128rpx; height: 128rpx; color: #fff; font-size: 48rpx; font-weight: var(--font-weight-semibold); background: var(--color-brand); border-radius: 38rpx; box-shadow: var(--shadow-action); }
.login-page__title { margin-top: 44rpx; font-size: 38rpx; font-weight: var(--font-weight-semibold); }
.login-page__caption { margin-top: 16rpx; font-size: 25rpx; color: var(--color-text-secondary); text-align: center; }
.login-page__button { width: 100%; margin-top: 100rpx; padding: 24rpx; color: #fff; font-size: 28rpx; font-weight: var(--font-weight-semibold); line-height: 1.5; background: var(--color-brand); border-radius: var(--radius-pill); }
.login-page__agreement { margin-top: 26rpx; font-size: 21rpx; color: var(--color-text-tertiary); }
</style>
