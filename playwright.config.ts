import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 5000 },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    video: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: process.env.BASE_URL || 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: true,
    env: {
      STRIPE_CONFIG_JSON: JSON.stringify({ webhook_secret: 'whsec_test', secret_key: 'sk_test', publishable_key: 'pk_test', mode: 'test' })
    }
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
})
