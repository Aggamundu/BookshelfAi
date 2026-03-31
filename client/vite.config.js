import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Resolves from this package's node_modules (works with npm workspaces + Vercel when Root Directory = client)
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'heic2any'],
  },
})
