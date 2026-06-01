import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      'server-only': resolve(__dirname, 'lib/__mocks__/server-only.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
