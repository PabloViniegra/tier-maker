import 'server-only'
import ws from 'ws'
import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './db/schema'
import { configureLocalNeonProxy } from './neon-local-proxy'

// Node.js runtime requires a WebSocket polyfill; no-op in Edge runtime
neonConfig.webSocketConstructor = ws
configureLocalNeonProxy()

const pool = new Pool({ connectionString: process.env.DATABASE_URI! })

export const db = drizzle(pool, { schema })
