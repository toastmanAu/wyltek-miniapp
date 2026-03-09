import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Content-hash all assets — forces cache bust on every deploy
    rollupOptions: {
      output: {
        entryFileNames:   'assets/[name]-[hash].js',
        chunkFileNames:   'assets/[name]-[hash].js',
        assetFileNames:   'assets/[name]-[hash][extname]',
      }
    }
  },
  server: {
    port: 3000,
    host: true,
  }
})
