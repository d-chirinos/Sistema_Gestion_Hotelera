import { defineConfig } from '@playwright/test'
import { env } from 'node:process'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:5173/Sistema_Gestion_Hotelera/',
    headless: true,
    launchOptions: env.CHROMIUM_PATH ? { executablePath: env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173/Sistema_Gestion_Hotelera/',
    reuseExistingServer: false,
    env: { VITE_SUPABASE_URL: 'https://demo.invalid', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_demo' },
  },
})
