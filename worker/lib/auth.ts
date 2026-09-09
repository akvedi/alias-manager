import { betterAuth } from 'better-auth'

export interface Env {
  DB: D1Database
  BETTER_AUTH_SECRET: string
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
