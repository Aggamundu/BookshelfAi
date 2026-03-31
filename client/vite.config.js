import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** npm workspaces hoist deps to repo root — point Vite at them so prebundle + resolve work */
const rootNodeModules = path.resolve(__dirname, '../node_modules')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.join(rootNodeModules, 'react'),
      'react-dom': path.join(rootNodeModules, 'react-dom'),
      'react-router-dom': path.join(rootNodeModules, 'react-router-dom'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
