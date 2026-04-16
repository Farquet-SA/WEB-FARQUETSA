import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
