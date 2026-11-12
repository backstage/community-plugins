/*
 * Copyright 2023 The Backstage Authors
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

// APP_MODE: 'nfs' (dev/index.tsx) or 'legacy' (dev/legacy.tsx)
const appMode = process.env.APP_MODE || 'nfs';
const frontendStartCommand =
  appMode === 'legacy' ? 'yarn start:legacy' : 'yarn start';

/**
 * Full-stack Playwright config: frontend + backend as separate webServers
 * so Playwright waits for both before tests run (same pattern as RBAC).
 * @see https://playwright.dev/docs/test-webserver
 *
 * Locale projects share one fixture-backed backend. Prefer `en` locally:
 * yarn playwright test --project=en
 *
 * Free :3000 / :7007 before `yarn test:nfs --ui` — reuseExistingServer is
 * false (RBAC-equivalent); a stuck webServer makes the UI show "No tests".
 */
export default defineConfig({
  testDir: './plugins/tekton/tests/',
  testMatch: '**/tekton.spec.ts',
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  webServer: process.env.PLAYWRIGHT_URL
    ? []
    : [
        {
          name: 'Frontend',
          command: frontendStartCommand,
          cwd: 'plugins/tekton',
          url: 'http://localhost:3000',
          reuseExistingServer: false,
          timeout: 180_000,
        },
        {
          name: 'Backend',
          command: 'yarn start',
          cwd: 'plugins/tekton-dev-backend',
          wait: { stdout: /Plugin initialization complete/ },
          reuseExistingServer: false,
          timeout: 180_000,
        },
      ],
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { open: 'never', outputFolder: `e2e-test-report-${appMode}` }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  outputDir: 'node_modules/.cache/e2e-test-results',
  projects: [
    {
      name: 'en',
      use: {
        channel: 'chrome',
        locale: 'en',
      },
    },
    {
      name: 'fr',
      use: {
        channel: 'chrome',
        locale: 'fr',
      },
    },
    {
      name: 'it',
      use: {
        channel: 'chrome',
        locale: 'it',
      },
    },
    {
      name: 'ja',
      use: {
        channel: 'chrome',
        locale: 'ja',
      },
    },
    {
      name: 'de',
      use: {
        channel: 'chrome',
        locale: 'de',
      },
    },
    {
      name: 'es',
      use: {
        channel: 'chrome',
        locale: 'es',
      },
    },
  ],
});
