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

import { Common } from './utils/topologyHelper';
import { getTranslations, TopologyMessages } from './utils/translations';

const TOPOLOGY_NODES = {
  deployments: [
    'test-deployment',
    'daemonset-testing',
    'hello-world-45',
    'pi',
    'hello-world',
    'example-ss',
  ],
  virtualMachines: ['fedora-turquoise-rooster-85', 'win2k22-purple-aphid-31'],
  example: 'example',
} as const;

const TOOLBAR_BUTTONS = [
  'Zoom In',
  'Zoom Out',
  'Fit to Screen',
  'Reset View',
] as const;

test.describe('Topology plugin', () => {
  let page: Page;
  let common: Common;
  let translations: TopologyMessages;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);
    await common.loginAsGuest();

    const currentLocale = await page.evaluate(
      () => globalThis.navigator.language,
    );
    translations = getTranslations(currentLocale);
    await common.switchToLocale(currentLocale);
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test.describe('Missing permissions page', () => {
    test('shows missing permissions error', async ({ browser }, testInfo) => {
      await page.goto('/missing-permissions');

      const topologyTextCount = await page
        .getByText('Topology', { exact: true })
        .count();
      expect(topologyTextCount).toEqual(2);

      await expect(page.locator('h3')).toContainText(
        translations.permissions.missingPermission,
      );
      await expect(page.getByRole('article')).toContainText(
        'kubernetes.clusters.read, kubernetes.resources.read',
      );
      await expect(
        page.getByRole('button', { name: translations.permissions.goBack }),
      ).toBeVisible();
      await common.a11yCheck(testInfo);
    });
  });

  test.describe('Topology view', () => {
    test.beforeEach(async () => {
      await page.goto('/topology');
    });

    test('displays header and cluster controls', async ({
      browser,
    }, testInfo) => {
      await expect(page.getByRole('heading')).toContainText('backstage');
      await expect(page.getByTestId('header-tab-0')).toBeVisible();
      await expect(page.locator('#pf-topology-view-0')).toMatchAriaSnapshot(`
        - button "${translations.toolbar.selectCluster}"
        - button "${translations.toolbar.displayOptions}"
        `);
      await common.a11yCheck(testInfo);
    });

    test('shows available clusters in selector', async () => {
      await page
        .getByRole('button', { name: translations.toolbar.selectCluster })
        .click();
      await expect(
        page.getByRole('option', { name: 'mock-cluster' }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
    });

    test('displays zoom and view controls', async () => {
      for (const buttonName of TOOLBAR_BUTTONS) {
        await expect(
          page.getByRole('button', { name: buttonName }),
        ).toBeVisible();
      }
      await page.getByRole('button', { name: 'Fit to Screen' }).click();
    });

    test('toggles pod count display option', async () => {
      await page
        .getByRole('button', { name: translations.toolbar.displayOptions })
        .click();
      await expect(page.locator('label')).toMatchAriaSnapshot(`
        - checkbox "${translations.filters.showPodCount}"
        - text: ${translations.filters.showPodCount}
        `);
      await page
        .getByRole('button', { name: translations.toolbar.displayOptions })
        .click();
    });

    test('renders deployment nodes', async () => {
      for (const deployment of TOPOLOGY_NODES.deployments) {
        await expect(
          page.locator(`[data-test-id="${deployment}"]`),
        ).toBeVisible();
      }
      const exampleNodeCount = await page
        .locator(`[data-test-id="${TOPOLOGY_NODES.example}"]`)
        .count();
      expect(exampleNodeCount).toEqual(2);
    });

    test('renders virtual machine nodes', async () => {
      for (const vm of TOPOLOGY_NODES.virtualMachines) {
        await expect(page.locator(`[data-test-id="${vm}"]`)).toBeVisible();
      }
    });

    test('opens sidebar with deployment details and resources', async ({
      browser,
    }, testInfo) => {
      await expect(
        page.getByRole('separator', { name: 'Resize' }),
      ).not.toBeVisible();
      await expect(page.getByRole('dialog')).not.toBeVisible();

      await page.locator('[data-test-id="test-deployment"]').click();

      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByRole('dialog')).toMatchAriaSnapshot(`
        - tablist:
          - tab "${translations.sideBar.details}"
          - tab "${translations.sideBar.resources}"
        `);
      await expect(page.getByRole('dialog')).toContainText('test-deployment');
      await expect(
        page.getByRole('separator', { name: 'Resize' }),
      ).toBeVisible();

      await common.verifyDeploymentDetails(translations);
      await common.verifyDeploymentResources(translations);
      await common.a11yCheck(testInfo);
    });

    test('shows consistent pod count in node and sidebar', async () => {
      await page
        .getByRole('button', { name: translations.toolbar.displayOptions })
        .click();
      await page
        .getByRole('checkbox', { name: translations.filters.showPodCount })
        .check();
      await page.keyboard.press('Escape');

      const testDeploymentNode = page.locator(
        '[data-test-id="test-deployment"]',
      );
      const podCount = await testDeploymentNode
        .locator('text')
        .last()
        .textContent();
      expect(podCount).toBeTruthy();

      await testDeploymentNode.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByTestId('details-tab')).toContainText(
        'test-deployment',
      );
      await expect(page.getByTestId('details-tab')).toContainText(podCount!);
    });
  });
});
