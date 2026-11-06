/*
 * Copyright 2026 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { defineConfig } from '@playwright/test';

/**
 * Runs the Playwright tests in `e2e-tests` against the guided tours dev app.
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: 'e2e-tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },

  // the dev app of plugins/guided-tours, unless PLAYWRIGHT_URL points elsewhere
  webServer: process.env.PLAYWRIGHT_URL
    ? []
    : [
        {
          command: 'yarn start',
          port: 3000,
          reuseExistingServer: true,
          timeout: 180_000,
        },
      ],

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never', outputFolder: 'e2e-test-report' }]],
  outputDir: 'node_modules/.cache/e2e-test-results',

  use: {
    baseURL: process.env.PLAYWRIGHT_URL ?? 'http://localhost:3000',
    channel: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
});
