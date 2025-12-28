import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/openai/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React и React DOM
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Ant Design
          'antd': ['antd'],
          // Карты
          'maps': ['leaflet', 'react-leaflet', '@2gis/mapgl'],
          // Графики
          'charts': ['recharts'],
          // Three.js
          'three': ['three'],
          // Утилиты
          'utils': ['dayjs', 'zustand', 'i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // Анимации
          'animations': ['framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Увеличиваем лимит до 1MB
  },
})
