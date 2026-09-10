import { betterAuth } from 'better-auth'

export interface Env {
  DB: D1Database
  BETTER_AUTH_SECRET: string
  MXROUTE_SERVER: string
  MXROUTE_USERNAME: string
  MXROUTE_API_KEY: string
  }

export function createAuth(env: Env) {
  return betterAuth({
    database: env.DB,

    trustedOrigins: [
      'http://localhost:5173',
    ],

    emailAndPassword: {
      enabled: true,
    },
  })
}
