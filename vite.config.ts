// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://nju-aia.com',
        changeOrigin: true,
      },
      '/livecodes-api': {
        target: 'http://192.168.1.87:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/livecodes-api/, ''),
      },
    },
  },
})
