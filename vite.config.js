import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiBase = env.VITE_API_BASE_URL || 'http://192.168.1.78:5000'
  const apiSecondary = env.VITE_API_SECONDARY_URL || 'http://192.168.1.78:8080'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/auth': { target: apiBase, changeOrigin: true },
        '/dashboard': { target: apiBase, changeOrigin: true },
        '/sensor': { target: apiBase, changeOrigin: true },
        '/api': { target: apiSecondary, changeOrigin: true },
      },
    },
  }
})