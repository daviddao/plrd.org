import { cleanEnv, str } from 'envalid'

export const env = cleanEnv(process.env, {
  COOKIE_SECRET: str({ default: 'development-secret-at-least-32-chars!!' }),
  PUBLIC_URL: str({ default: '' }),
  ATPROTO_JWK_PRIVATE: str({ default: '' }),
  ATPROTO_HANDLE: str({ default: '' }),
  ATPROTO_PASSWORD: str({ default: '' }),
})

// Port is read separately as it may not be available in all Next.js contexts
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
