import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const apiTarget = process.env.VITE_ADMIN_API_BASE_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    // dist ya se limpia en prebuild (scripts/clean-dist.mjs); evita rmdir ENOTEMPTY en Windows
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
