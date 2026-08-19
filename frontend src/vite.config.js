import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Production build goes directly into Spring Boot's static resources
  build: {
    outDir: path.resolve(projectRoot, '../src/main/resources/static'),
    emptyOutDir: true,   // clears old build files before each build
  },
  server: {
    // Dev-only proxies — forward API + OAuth calls to Spring Boot on :8080
    proxy: {
      '/resumeAnalyser': 'http://localhost:8080',
      '/resumeAnalyserCore': 'http://localhost:8080',
      '/oauth2': 'http://localhost:8080',
      '/login/oauth2': 'http://localhost:8080',
    }
  }
})
