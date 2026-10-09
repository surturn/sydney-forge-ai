import { defineConfig } from 'vitest/config'

// Network-dependent dependency audit only. Run with `npm run test:deps`.
export default defineConfig({
  test: {
    include: ['src/__tests__/security/dependencies.test.ts'],
  },
})
