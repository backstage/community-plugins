/*
 * Copyright 2024 The Backstage Authors
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
import { generateProjects } from '@backstage/e2e-test-utils/playwright';

// Override when the dev app listens on another port (e.g. PLAYWRIGHT_URL=http://localhost:3001).
const appUrl = process.env.PLAYWRIGHT_URL ?? 'http://localhost:3000';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 120_000,

  expect: {
    timeout: 10_000,
  },

  webServer: process.env.PLAYWRIGHT_URL
    ? []
    : [
        {
          command: 'node scripts/kiali-e2e-mock-server.mjs',
          port: 20001,
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
          env: {
            ...process.env,
            KIALI_E2E_NAMESPACES: 'bookinfo,default,istio-system',
            KIALI_E2E_PATCH_HEALTH: '1',
          },
        },
        {
          command: 'yarn start',
          url: appUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      ],

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  reporter: [['html', { open: 'never', outputFolder: 'e2e-test-report' }]],

  use: {
    actionTimeout: 0,
    baseURL: appUrl,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    channel: 'chrome',
  },

  outputDir: 'node_modules/.cache/e2e-test-results',

  projects: generateProjects({ channel: 'chrome' }),
});
