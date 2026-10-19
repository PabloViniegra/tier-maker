import { neonConfig } from '@neondatabase/serverless'

// The Neon driver only speaks WebSocket. Against a plain Postgres (E2E in
// Docker) it must go through a wsproxy, given as "host:port/v1?address=db:5432".
export function configureLocalNeonProxy() {
  const proxy = process.env.NEON_WS_PROXY
  if (!proxy) return

  neonConfig.wsProxy = () => proxy
  neonConfig.useSecureWebSocket = false
  neonConfig.pipelineTLS = false
  neonConfig.pipelineConnect = false
}
