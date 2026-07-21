import { defineConfig } from 'vitest/config'

export default defineConfig({
  server: {
    hmr: false
  },
  test: {
    api: false,
    environment: 'node',
    passWithNoTests: true
  }
})
