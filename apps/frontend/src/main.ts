import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { initTheme } from './core/theme/theme'

export function createApp() {
  const app = createSSRApp(App)
  app.use(createPinia())
  initTheme()
  return {
    app
  }
}
