import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api calls to FastAPI — no CORS issues in dev
      '/chat':        { target: 'http://localhost:8000', changeOrigin: true },
      '/arena':       { target: 'http://localhost:8000', changeOrigin: true },
      '/feedback':    { target: 'http://localhost:8000', changeOrigin: true },
      '/experiments': { target: 'http://localhost:8000', changeOrigin: true },
      '/health':      { target: 'http://localhost:8000', changeOrigin: true },
    }
  }
})