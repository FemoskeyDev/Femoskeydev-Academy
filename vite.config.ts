import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], css: true },
  build: { rollupOptions: { output: { manualChunks(id) {
    if (id.includes('/node_modules/three/')) return 'three-core'
    if (id.includes('/node_modules/@react-three/fiber/')) return 'react-three-fiber'
  } } } },
})
