import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://192.168.1.78:5000',
        changeOrigin: true,
      },
      '/dashboard': {
        target: 'http://192.168.1.78:5000',
        changeOrigin: true,
      },
      '/sensor': {
        target: 'http://192.168.1.78:5000',
        changeOrigin: true,
      },
      // '/api': {
      //   target: 'http://192.168.1.78:8080',
      //   changeOrigin: true,
      // }
    }
  }
})