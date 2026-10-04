import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:9000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-unsafe-webgl', '--use-gl=swiftshader']
        }
      }
    }
  ],
  webServer: {
    command: 'python3 -m http.server 9000 -d dist/spa',
    port: 9000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
