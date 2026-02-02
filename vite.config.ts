import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths for better compatibility
  base: './',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Split chunks for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // OpenAI SDK in separate chunk (loaded only when needed)
          'openai': ['openai'],
        },
      },
    },
    // Increase chunk size warning threshold slightly
    chunkSizeWarningLimit: 600,
    // Enable minification with esbuild (faster, built-in)
    minify: 'esbuild',
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['openai'],
  },
})
