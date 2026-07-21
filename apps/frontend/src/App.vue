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
