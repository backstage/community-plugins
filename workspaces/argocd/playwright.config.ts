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

export default defineConfig({
  testDir: './plugins/argocd/tests',
  webServer: process.env.PLAYWRIGHT_URL
    ? []
    : [
        {
          command: 'yarn start',
          cwd: 'plugins/argocd',
          port: 3000,
          reuseExistingServer: true,
        },
      ],
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never', outputFolder: 'e2e-test-report' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  outputDir: 'node_modules/.cache/e2e-test-results',
  projects: [
    {
      name: 'en',
      testDir: './plugins/argocd/tests',
      use: {
        channel: 'chrome',
        locale: 'en',
      },
    },
    {
      name: 'fr',
      testDir: './plugins/argocd/tests',
      use: {
        channel: 'chrome',
        locale: 'fr',
      },
    },
    {
      name: 'it',
      testDir: './plugins/argocd/tests',
      use: {
        channel: 'chrome',
        locale: 'it',
      },
    },
    {
      name: 'ja',
      testDir: './plugins/argocd/tests',
      use: {
        channel: 'chrome',
        locale: 'ja',
      },
    },
  ],
});
