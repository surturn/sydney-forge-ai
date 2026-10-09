/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { contentPlugin } from './vite/content'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), contentPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // the audit test needs the network, run it with `npm run test:deps`
    exclude: ['node_modules', 'dist', 'src/__tests__/security/dependencies.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
})
