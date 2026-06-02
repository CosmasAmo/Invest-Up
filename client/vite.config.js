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
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // Don't inline anything
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  },
  // We don't need to define environment variables here as Vite automatically
  // exposes all variables with VITE_ prefix to the client
})
