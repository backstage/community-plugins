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
// Readiness is 200 only when plugins initialized (catalog returns 401 without a session).
const backendReadyUrl = 'http://127.0.0.1:7007/.backstage/health/v1/readiness';

const kialiMockEnv = {
  ...process.env,
  KIALI_E2E_NAMESPACES: 'bookinfo,default,istio-system',
  KIALI_E2E_PATCH_HEALTH: '1',
};

/**
 * Full-stack e2e: mock Kiali API, Backstage backend (Kiali proxy + catalog), then frontend.
 * Playwright must wait for port 7007 — not only webpack on 3000 — or /api/kiali/* fails and the
 * plugin never renders the header (see workspaces/npm/playwright.config.ts).
 *
 * @see https://playwright.dev/docs/test-webserver
 */
export default defineConfig({
  timeout: 120_000,
  workers: process.env.CI ? 1 : undefined,

  expect: {
    timeout: 10_000,
  },

  webServer: process.env.PLAYWRIGHT_URL
    ? []
    : [
        {
          name: 'Kiali mock',
          command: 'node scripts/kiali-e2e-mock-server.mjs',
          wait: { stdout: /Kiali e2e mock listening/ },
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
          env: kialiMockEnv,
        },
        {
          name: 'Backend',
          command: 'yarn workspace backend start',
          url: backendReadyUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 240_000,
        },
        {
          name: 'Frontend',
          command: 'yarn workspace app start',
          url: appUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 240_000,
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
