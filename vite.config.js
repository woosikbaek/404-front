import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: import.meta.env.VITE_API_BASE_URL,
        changeOrigin: true,
      },
      '/dashboard': {
        target: import.meta.env.VITE_API_BASE_URL,
        changeOrigin: true,
      },
      '/sensor': {
        target: import.meta.env.VITE_API_BASE_URL,
        changeOrigin: true,
      },
      '/api': {
        target: import.meta.env.VITE_API_SECONDARY_URL,
        changeOrigin: true,
      }
    }
  }
})