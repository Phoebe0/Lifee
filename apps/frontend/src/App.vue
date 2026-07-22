<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { initTheme } from './core/theme/theme'

onLaunch(() => {
  initTheme()
})
</script>

<template>
  <view class="app-shell">
    <slot />
  </view>
</template>

<style>
@import './design/tokens.css';

page {
  min-height: 100%;
  background: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  font-size: var(--font-size-body);
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

button::after {
  border: 0;
}
</style>
