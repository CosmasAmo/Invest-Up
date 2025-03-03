import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // Only listen on localhost, not on network interfaces
    port: 5173, // Default Vite port
    strictPort: true, // Don't try other ports if 5173 is taken
    hmr: {
      // Disable opening in browser automatically
      overlay: true
    }
  }
})
