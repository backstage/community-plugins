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
import { generateProjects } from '@backstage/e2e-test-utils/playwright';

/**
 * The e2e tests run twice: against the classic dev app (old frontend system)
 * and against the alpha dev app (new frontend system). Both frontends share
 * one backend. The URLs can be overridden to point at already running apps.
 */
const classicUrl = process.env.PLAYWRIGHT_URL ?? 'http://localhost:3000';
const alphaUrl = process.env.PLAYWRIGHT_ALPHA_URL ?? 'http://localhost:3001';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: 60_000,

  expect: {
    timeout: 5_000,
  },

  // Run your local dev servers before starting the tests
  webServer: [
    {
      command: 'yarn workspace @backstage-community/plugin-npm-backend start',
      port: 7007,
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'yarn workspace @backstage-community/plugin-npm start',
      env: { APP_CONFIG_app_baseUrl: classicUrl },
      url: classicUrl,
      reuseExistingServer: true,
      timeout: 180_000,
    },
    {
      command: 'yarn workspace @backstage-community/plugin-npm start:alpha',
      env: { APP_CONFIG_app_baseUrl: alphaUrl },
      url: alphaUrl,
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  reporter: [['html', { open: 'never', outputFolder: 'e2e-test-report' }]],

  use: {
    actionTimeout: 0,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  outputDir: 'node_modules/.cache/e2e-test-results',

  // Find all packages with e2e-test folders and run them against both apps
  projects: generateProjects({ channel: 'chromium' }).flatMap(project => [
    {
      ...project,
      name: `${project.name} (classic)`,
      use: { ...project.use, baseURL: classicUrl },
    },
    {
      ...project,
      name: `${project.name} (alpha)`,
      use: { ...project.use, baseURL: alphaUrl },
    },
  ]),
});
