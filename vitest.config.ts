import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

const mock = (file: string) => resolve(__dirname, 'lib/__mocks__', file)

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: [
      { find: 'server-only', replacement: mock('server-only.ts') },
      { find: /^@\/lib\/db$/, replacement: mock('db.ts') },
      { find: resolve(__dirname, 'lib/db.ts'), replacement: mock('db.ts') },
      { find: /^@\/lib\/session$/, replacement: mock('session.ts') },
      {
        find: resolve(__dirname, 'lib/session.ts'),
        replacement: mock('session.ts'),
      },
      { find: /^@\/lib\/auth-client$/, replacement: mock('auth-client.ts') },
      {
        find: resolve(__dirname, 'lib/auth-client.ts'),
        replacement: mock('auth-client.ts'),
      },
      { find: 'next/cache', replacement: mock('next-cache.ts') },
      { find: 'next/navigation', replacement: mock('next-navigation.ts') },
      { find: 'next/image', replacement: mock('next-image.tsx') },
      { find: 'next/headers', replacement: mock('next-headers.ts') },
      { find: 'sonner', replacement: mock('sonner.ts') },
      { find: 'next-themes', replacement: mock('next-themes.ts') },
      { find: '@vercel/blob', replacement: mock('vercel-blob.ts') },
      { find: '@vercel/functions', replacement: mock('vercel-functions.ts') },
      {
        find: 'better-auth/adapters/drizzle',
        replacement: mock('better-auth-drizzle.ts'),
      },
      { find: 'better-auth', replacement: mock('better-auth.ts') },
      { find: 'resend', replacement: mock('resend.ts') },
      { find: '@hello-pangea/dnd', replacement: mock('dnd.tsx') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
