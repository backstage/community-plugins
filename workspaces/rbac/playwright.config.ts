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

// APP_MODE: 'legacy' (app-legacy) or 'nfs' (app with new frontend system)
const appMode = process.env.APP_MODE || 'legacy';
const startCommand = appMode === 'legacy' ? 'yarn start:legacy' : 'yarn start';

export default defineConfig({
  testDir: './plugins/rbac/tests/',
  webServer: process.env.PLAYWRIGHT_URL
    ? []
    : [
        {
          command: startCommand,
          cwd: 'plugins/rbac',
          port: 3000,
          reuseExistingServer: true,
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
  ],
});
