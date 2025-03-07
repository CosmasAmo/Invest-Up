import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', // Only listen on localhost
    port: 5173, // Default Vite port
    strictPort: true, // Don't try other ports if 5173 is taken
    hmr: {
      // Disable opening in browser automatically
      overlay: true
    }
  },
  define: {
    // Define environment variables that will be available at build time
    'process.env.VITE_BACKEND_URL': JSON.stringify('http://localhost:5000')
  }
})
