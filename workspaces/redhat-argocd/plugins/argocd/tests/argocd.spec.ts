import { expect, Page, test } from '@playwright/test';

import {
  mockApplication,
  preProdApplication,
  prodApplication,
} from '../dev/__data__';
import { Common } from './argocdHelper';
import { verifyAppCard, verifyAppSidebar } from './utils';

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
      await expect(argocdPage.getByRole('heading')).toHaveText(
        'Deployment summary',
      );
    });

    test('Verify column names', async () => {
      for (const col of columns) {
        await expect(
          argocdPage.getByRole('columnheader', { name: col }),
        ).toBeVisible();
      }
    });

    for (const app of apps) {
      const appName = app.metadata.name;

      /* eslint-disable-next-line  no-loop-func */
      test(`Verify ${appName} row`, async () => {
        const row = argocdPage.locator('.MuiTableRow-root', {
          hasText: appName,
        });
        const revision = app.status.history
          ?.slice(-1)[0]
          .revision.substring(0, 7);

        await expect(
          row.locator('td', { hasText: app.metadata.instance.name }),
        ).toBeVisible();
        await expect(
          row.locator('td', { hasText: app.spec.destination.server }),
        ).toBeVisible();
        await expect(row.locator('td', { hasText: revision })).toBeVisible();
        await expect(
          row.locator('td', { hasText: app.status.health.status }),
        ).toBeVisible();
        await expect(
          row.locator('td', { hasText: app.status.sync.status }),
        ).toBeVisible();
      });
    }
  });
});
