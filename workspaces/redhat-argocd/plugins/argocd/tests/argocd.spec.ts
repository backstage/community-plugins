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
import { expect, Page, test } from '@playwright/test';
import { runAccessibilityTests } from './utils/accessibility';

import {
  mockApplication,
  preProdApplication,
  prodApplication,
} from '../dev/__data__';
import { Common } from './utils/argocdHelper';
import { verifyAppCard, verifyAppSidebar } from './utils/utils';

test.describe('ArgoCD plugin', () => {
  let argocdPage: Page;
  let common: Common;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    argocdPage = await context.newPage();
    common = new Common(argocdPage);

    await common.loginAsGuest();
    await expect(
      argocdPage.getByRole('heading', { name: 'Deployment lifecycle' }),
    ).toBeVisible({ timeout: 20000 });
    await runAccessibilityTests(argocdPage);
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  const apps = [mockApplication, preProdApplication, prodApplication];

  test.describe('Deployment lifecycle', () => {
    for (const [index, app] of apps.entries()) {
      /* eslint-disable-next-line  no-loop-func */
      test(`Verify ${app.metadata.name} card`, async () => {
        const card = argocdPage.getByTestId(`${app.metadata.name}-card`);
        await expect(card).toBeVisible();
        await verifyAppCard(app, card, index);
      });

      /* eslint-disable-next-line  no-loop-func */
      test(`Verify ${app.metadata.name} side bar`, async () => {
        await argocdPage.getByTestId(`${app.metadata.name}-card`).click();
        const sideBar = argocdPage.locator(`.MuiDrawer-paper`);
        await expect(sideBar).toBeVisible();
        await verifyAppSidebar(app, sideBar, index);
        await sideBar.getByRole('button', { name: 'Close the drawer' }).click();
        await expect(sideBar).toBeVisible({ visible: false });
      });
    }
  });

  test.describe('Summary', () => {
    const columns = [
      'ArgoCD App',
      'Namespace',
      'Instance',
      'Server',
      'Revision',
      'Last Deployed',
      'Sync Status',
      'Health Status',
    ];

    test.beforeAll(async () => {
      await argocdPage.getByRole('link', { name: 'Summary' }).click();
      await expect(
        argocdPage.getByRole('heading', { name: 'Deployment Summary' }),
      ).toBeVisible();
    });

    test('Verify column names', async () => {
      for (const col of columns) {
        await expect(
          argocdPage.getByRole('columnheader', { name: col }),
        ).toBeVisible();
      }
      await runAccessibilityTests(argocdPage);
    });

    for (const app of apps) {
      const appName = app.metadata.name;

      /* eslint-disable-next-line  no-loop-func */
      test(`Verify ${appName} row`, async () => {
        const revision = app.status?.history
          ?.slice(-1)[0]
          ?.revision?.substring(0, 7);

        const row = argocdPage.getByRole('row').filter({ hasText: appName });

        await expect(
          row.getByRole('cell', { name: appName }).first(),
        ).toBeVisible();
        await expect(
          row.getByRole('cell', { name: app.spec.destination.server }).first(),
        ).toBeVisible();
        await expect(
          row.getByRole('cell', { name: revision }).first(),
        ).toBeVisible();
        await expect(
          row.getByRole('cell', { name: app.status.health.status }).first(),
        ).toBeVisible();
        await expect(
          row.getByRole('cell', { name: app.status.sync.status }).first(),
        ).toBeVisible();
      });
    }
  });
});
