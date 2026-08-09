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

// APP_MODE: 'nfs' (dev/index.tsx) or 'legacy' (dev/legacy/index.tsx)
const appMode = process.env.APP_MODE || 'nfs';
const frontendStartCommand =
  appMode === 'legacy' ? 'yarn start:legacy' : 'yarn start';

/**
 * Full-stack Playwright config: frontend + backend as separate webServers
 * so Playwright waits for both URLs before tests run.
 * @see https://playwright.dev/docs/test-webserver
 *
 * Locale projects (en/fr/it/ja/de/es) share one in-memory backend; roles are
 * seeded with a `-${locale}` suffix so projects do not collide. Projects run
 * serially (workers: 1). Prefer `en` locally when iterating:
 * yarn playwright test --project=en
 */
export default defineConfig({
  testDir: './plugins/rbac/tests/',
  testMatch: '**/rbac.spec.ts',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  webServer: process.env.PLAYWRIGHT_URL
    ? []
    : [
        {
          name: 'Frontend',
          command: frontendStartCommand,
          cwd: 'plugins/rbac',
          url: 'http://localhost:3000',
          // Never reuse — another Backstage app on :3000/:7007 (e.g. quickstart)
          // lacks this workspace's superUsers and breaks REST seeding with 403.
          reuseExistingServer: false,
          timeout: 180_000,
        },
        {
          name: 'Backend',
          command: 'yarn start',
          cwd: 'plugins/rbac-backend',
          url: 'http://localhost:7007/api/auth/.well-known/jwks.json',
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
        locale: 'en',
      },
    },
    {
      name: 'fr',
      use: {
        locale: 'fr',
      },
    },
    {
      name: 'it',
      use: {
        locale: 'it',
      },
    },
    {
      name: 'ja',
      use: {
        locale: 'ja',
      },
    },
    {
      name: 'de',
      use: {
        locale: 'de',
      },
    },
    {
      name: 'es',
      use: {
        locale: 'es',
      },
    },
  ],
});
