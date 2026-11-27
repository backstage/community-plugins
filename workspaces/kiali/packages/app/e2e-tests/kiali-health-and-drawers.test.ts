/*
 * Copyright 2026 The Backstage Authors
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

import { expect, test } from '@playwright/test';
import {
  navigateToKialiOverview,
  openBookinfoKubernetesKialiTab,
} from './test-utils';

test('Overview shows unhealthy Istio control plane status', async ({
  page,
}) => {
  await navigateToKialiOverview(page);

  const istioSystemCard = page.locator(
    '[data-test="overview-card-istio-system"]',
  );
  await expect(istioSystemCard).toBeAttached({ timeout: 10_000 });
  await istioSystemCard.scrollIntoViewIfNeeded();

  const statusIcon = istioSystemCard.locator(
    '[data-test="istio-status-danger"]',
  );
  await expect(statusIcon).toBeAttached({ timeout: 10_000 });
  await statusIcon.hover();
  await expect(page.getByText('istiod-3').first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText('Not healthy').first()).toBeVisible({
    timeout: 10_000,
  });
});

test('Workloads list shows failure health for ratings-v1', async ({ page }) => {
  await navigateToKialiOverview(page);

  await page.goto('/kiali/workloads');
  const workloadsTable = page.locator('[data-test="kiali-workloads-table"]');
  await expect(workloadsTable).toBeAttached({ timeout: 10_000 });

  const ratingsRow = workloadsTable.locator(
    '[data-test="VirtualItem_ClusterKubernetes_Nsbookinfo_Deployment_ratings-v1"]',
  );
  await expect(ratingsRow).toBeAttached({ timeout: 15_000 });
  await ratingsRow.scrollIntoViewIfNeeded();

  const ratingsLink = ratingsRow.locator(
    '[data-test="workload-namespace-ratings-v1"]',
  );
  await expect(ratingsLink).toBeVisible({ timeout: 10_000 });
  await ratingsLink.click();

  const drawer = page.locator('[data-test="drawer"]');
  await expect(drawer).toBeAttached({ timeout: 10_000 });
  await expect(drawer.locator('[data-test="workload-title"]')).toContainText(
    'ratings-v1',
  );
  const drawerHealth = drawer.locator('[data-test="health"]');
  await expect(drawerHealth).toBeAttached({ timeout: 15_000 });
  await drawerHealth.hover();
  await expect(page.getByText('Failure', { exact: true }).first()).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText('0 available pods')).toBeVisible({
    timeout: 10_000,
  });
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeAttached({ timeout: 5000 });
});

test('Standalone list routes open service and application drawers', async ({
  page,
}) => {
  await navigateToKialiOverview(page);

  await page.goto('/kiali/services');
  const servicesTable = page.locator('[data-test="kiali-services-table"]');
  await expect(servicesTable).toBeAttached({ timeout: 10_000 });
  await servicesTable
    .locator(
      '[data-test="VirtualItem_ClusterKubernetes_Nsbookinfo_details"] [data-test="service-namespace-details"]',
    )
    .click();
  let drawer = page.locator('[data-test="drawer"]');
  await expect(drawer.locator('#ServiceDescriptionCard')).toBeAttached({
    timeout: 10_000,
  });
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeAttached({ timeout: 5000 });

  await page.goto('/kiali/applications');
  const applicationsTable = page.locator(
    '[data-test="kiali-applications-table"]',
  );
  await expect(applicationsTable).toBeAttached({ timeout: 10_000 });
  await applicationsTable
    .locator(
      '[data-test="VirtualItem_ClusterKubernetes_Nsbookinfo_details"] [data-test="app-namespace-details"]',
    )
    .click();
  drawer = page.locator('[data-test="drawer"]');
  await expect(drawer.locator('h6').first()).toContainText('details', {
    timeout: 10_000,
  });
  await page.keyboard.press('Escape');
});

test('Standalone VirtualService drawer from istio list route', async ({
  page,
}) => {
  await navigateToKialiOverview(page);

  await page.goto('/kiali/istio');
  const istioTable = page.locator('[data-test="kiali-istio-table"]');
  await expect(istioTable).toBeAttached({ timeout: 10_000 });

  const virtualServiceLink = istioTable.locator(
    '[data-test="object-namespace-bookinfo"]',
  );
  await expect(virtualServiceLink).toBeAttached({ timeout: 10_000 });
  await virtualServiceLink.click();

  const drawer = page.locator('[data-test="drawer"]');
  await expect(drawer).toBeAttached({ timeout: 10_000 });
  const istioConfigCard = drawer.locator(
    '[data-test="istio-config-description-card"]',
  );
  await expect(istioConfigCard).toBeAttached({ timeout: 10_000 });
  await expect(istioConfigCard.locator('h6').first()).toContainText('bookinfo');
  await page.keyboard.press('Escape');
});

test('Selecting only bookinfo namespace reduces application rows', async ({
  page,
}) => {
  await navigateToKialiOverview(page);

  const applicationsTable = page.locator(
    '[data-test="kiali-applications-table"]',
  );
  await page.goto('/kiali/applications');
  await expect(applicationsTable).toBeAttached({ timeout: 10_000 });
  await expect(
    applicationsTable.locator('[data-test^="app-namespace-"]'),
  ).toHaveCount(10, { timeout: 10_000 });

  const namespaceSelector = page.locator('[data-test="namespace-selector"]');
  await namespaceSelector.locator('[role="button"]').click();
  await page.getByRole('option', { name: 'Deselect All' }).click();
  await page.keyboard.press('Escape');

  await namespaceSelector.locator('[role="button"]').click();
  const bookinfoOption = page.getByRole('option', { name: 'bookinfo' });
  await bookinfoOption.click();
  await page.keyboard.press('Escape');
  await expect(namespaceSelector.locator('[role="button"]')).toContainText(
    'bookinfo',
  );

  await expect(
    applicationsTable.locator('[data-test^="app-namespace-"]'),
  ).toHaveCount(5, { timeout: 15_000 });
});

test('Entity catalog tab loads Kiali workloads for Kubernetes provider', async ({
  page,
}) => {
  await openBookinfoKubernetesKialiTab(page);

  const workloadsTable = page.locator('[data-test="kiali-workloads-table"]');
  await expect(workloadsTable).toBeAttached({ timeout: 10_000 });
  await expect(
    workloadsTable.locator('[data-test="workload-namespace-details-v1"]'),
  ).toBeAttached({ timeout: 10_000 });
});
