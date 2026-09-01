import '@testing-library/jest-dom/vitest'
import React from 'react'

process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'

// ViewTransition is a React canary feature not yet in the stable runtime.
// Provide a passthrough shim so components using it render correctly in tests.
if (!('ViewTransition' in React)) {
  Object.defineProperty(React, 'ViewTransition', {
    value: ({ children }: { children: React.ReactNode }) => children,
  })
}
