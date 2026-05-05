import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(new URL('./src', import.meta.url).pathname),
      '@api': path.resolve(new URL('./src/api', import.meta.url).pathname),
      '@components': path.resolve(new URL('./src/components', import.meta.url).pathname),
      '@pages': path.resolve(new URL('./src/pages', import.meta.url).pathname),
      '@context': path.resolve(new URL('./src/context', import.meta.url).pathname),
      '@layouts': path.resolve(new URL('./src/layouts', import.meta.url).pathname),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})