/*
 * Copyright 2020 The Backstage Authors
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

// Helper function to navigate to Kiali tab
async function navigateToKialiTab(page: any) {
  await page.goto('/');

  const enterButton = page.getByRole('button', { name: 'Enter' });
  await expect(enterButton).toBeVisible();
  await enterButton.click();

  await expect(
    page.getByRole('heading', { name: 'Kiali Community Catalog' }),
  ).toBeVisible();

  // Click on the bookinfo-kubernetes component link
  const bookinfoLink = page.getByRole('link', { name: 'bookinfo-kubernetes' });
  await expect(bookinfoLink).toBeVisible();
  await bookinfoLink.click();

  // Wait for the component page to load
  await expect(page).toHaveURL(
    /\/catalog\/default\/component\/bookinfo-kubernetes/,
  );

  // Click on the Kiali tab
  const kialiTab = page.getByTestId('header-tab-1');
  await expect(kialiTab).toBeVisible();
  await kialiTab.click();

  // Wait for the Kiali page to load
  await expect(page).toHaveURL(
    /\/catalog\/default\/component\/bookinfo-kubernetes\/kiali/,
  );
}

test('App should render the welcome page', async ({ page }) => {
  await page.goto('/');

  const enterButton = page.getByRole('button', { name: 'Enter' });
  await expect(enterButton).toBeVisible();
  await enterButton.click();

  await expect(
    page.getByRole('heading', { name: 'Kiali Community Catalog' }),
  ).toBeVisible();
});

test('App should have valid Kiali content', async ({ page }) => {
  await navigateToKialiTab(page);

  // Verify the Kiali graph card exists
  const kialiGraphCard = page.locator('[data-test="kiali-graph-card"]');
  await expect(kialiGraphCard).toBeVisible();

  // Verify the graph contains data (nodes and edges)
  const graphContainer = kialiGraphCard.locator('[data-test-id="topology"]');
  await expect(graphContainer).toBeVisible();

  // Verify there are nodes in the graph
  const graphNodes = graphContainer.locator('[data-kind="node"]');
  await expect(graphNodes.first()).toBeVisible({ timeout: 10000 });

  // Verify there are edges in the graph
  const graphEdges = graphContainer.locator('[data-kind="edge"]');
  await expect(graphEdges.first()).toBeVisible({ timeout: 10000 });
});

test('App should have valid Kiali tab content', async ({ page }) => {
  await navigateToKialiTab(page);

  // Validate Overview card exists
  const overviewCard = page.getByText('Overview', { exact: true });
  await expect(overviewCard).toBeAttached();

  // Validate graph card exists
  const graphCard = page.locator('[data-test="kiali-graph-card"]');
  await expect(graphCard).toBeAttached();

  // Validate Resources card exists
  const resourcesCard = page.getByText('Resources', { exact: true });
  await expect(resourcesCard).toBeAttached();

  // Validate Istio configuration card exists
  const istioConfigCard = page.getByText('Istio Config', { exact: true });
  await expect(istioConfigCard).toBeAttached();
});

test('Overview card content', async ({ page }) => {
  await navigateToKialiTab(page);

  // Validate overview card has metrics (sparklines)
  // The chart may take time to load after API calls complete
  const inboundSparkline = page.locator(
    '[data-test="sparkline-inbound-duration-10m"]',
  );
  await expect(inboundSparkline).toBeVisible();

  const overviewcard = page.locator('[data-test="overview-card-bookinfo"]');

  // Verify the sparkline contains a chart (SVG element)
  const sparklineChart = overviewcard.locator('svg').first();
  await expect(sparklineChart).toBeVisible();

  // Verify the chart has data points (path elements)
  // Use a more specific selector that waits for paths with data (those with 'd' attribute)
  const chartPaths = sparklineChart.locator('path[role="presentation"]');
  await expect(chartPaths.first()).toBeVisible();

  // Additional verification: ensure there are path elements (data points) in the chart
  const pathCount = await chartPaths.count();
  expect(pathCount).toBeGreaterThan(0);
});

test('Traffic card content', async ({ page }) => {
  await navigateToKialiTab(page);

  // Validate graph card exists
  const kialiGraphCard = page.locator('[data-test="kiali-graph-card"]');
  await expect(kialiGraphCard).toBeVisible();

  // Verify the graph contains data (nodes and edges)
  const graphContainer = kialiGraphCard.locator('[data-test-id="topology"]');
  await expect(graphContainer).toBeVisible();

  // Verify there are nodes in the graph
  const graphNodes = graphContainer.locator('[data-kind="node"]');
  await expect(graphNodes.first()).toBeVisible({ timeout: 10000 });

  // Verify there are edges in the graph
  const graphEdges = graphContainer.locator('[data-kind="edge"]');
  await expect(graphEdges.first()).toBeVisible({ timeout: 10000 });
});

test('Resources card content', async ({ page }) => {
  await navigateToKialiTab(page);

  // Find the Resources card header to verify it exists
  const resourcesCardHeader = page.getByText('Resources', { exact: true });
  await expect(resourcesCardHeader).toBeAttached();

  // Verify there are 3 tabs: Workloads, Services, Applications
  const workloadsTab = page.getByRole('tab', { name: 'Workloads' });
  const servicesTab = page.getByRole('tab', { name: 'Services' });
  const applicationsTab = page.getByRole('tab', { name: 'Applications' });

  await expect(workloadsTab).toBeVisible();
  await expect(servicesTab).toBeVisible();
  await expect(applicationsTab).toBeVisible();

  // Test Workloads tab
  await workloadsTab.click();
  await expect(workloadsTab).toHaveAttribute('aria-selected', 'true');

  // Verify table headers: Health, Name, Namespace, Cluster, Type, Labels
  const workloadsTable = page.locator('[data-test="kiali-workloads-table"]');
  await expect(workloadsTable).toBeAttached({ timeout: 10000 });
  // Search headers specifically in thead to avoid matches in table rows
  const workloadsTableHead = workloadsTable.locator('thead');
  await expect(workloadsTableHead.getByText('HEALTH')).toHaveCount(1, {
    timeout: 10000,
  });
  await expect(
    workloadsTableHead.getByText('NAME', { exact: true }),
  ).toHaveCount(1, { timeout: 10000 });
  await expect(
    workloadsTableHead.getByText('NAMESPACE', { exact: true }),
  ).toHaveCount(1, { timeout: 10000 });
  await expect(workloadsTableHead.getByText('TYPE')).toHaveCount(1, {
    timeout: 10000,
  });
  await expect(workloadsTableHead.getByText('LABELS')).toHaveCount(1, {
    timeout: 10000,
  });

  // Validate it has at least one row with: healthy, details-v1, bookinfo
  const detailsV1Row = workloadsTable.getByText('details-v1');
  await expect(detailsV1Row).toBeAttached({ timeout: 10000 });
  await expect(workloadsTable.getByText('bookinfo')).toHaveCount(7);

  // Test Services tab
  await servicesTab.click();
  await expect(servicesTab).toHaveAttribute('aria-selected', 'true');

  // Verify table headers: Health, Name, Namespace, Cluster, Labels
  const servicesTable = page.locator('[data-test="kiali-services-table"]');
  await expect(servicesTable).toBeAttached({ timeout: 10000 });
  // Search headers specifically in thead to avoid matches in table rows
  const servicesTableHead = servicesTable.locator('thead');
  await expect(servicesTableHead.getByText('HEALTH')).toHaveCount(1, {
    timeout: 10000,
  });
  await expect(
    servicesTableHead.getByText('NAME', { exact: true }),
  ).toHaveCount(1, { timeout: 10000 });
  await expect(
    servicesTableHead.getByText('NAMESPACE', { exact: true }),
  ).toHaveCount(1, { timeout: 10000 });
  await expect(servicesTableHead.getByText('LABELS')).toHaveCount(1, {
    timeout: 10000,
  });
  await expect(servicesTableHead.getByText('CONFIG')).toHaveCount(1, {
    timeout: 10000,
  });

  // Validate it has at least one row with: healthy, details, bookinfo
  const detailsServiceRow = servicesTable.getByText('details');
  await expect(detailsServiceRow).toBeAttached({ timeout: 10000 });
  await expect(servicesTable.getByText('bookinfo')).toHaveCount(4);

  // Test Applications tab
  await applicationsTab.click();
  await expect(applicationsTab).toHaveAttribute('aria-selected', 'true');

  // Verify table headers: Health, Name, Namespace, Cluster, Labels
  const applicationsTable = page.locator(
    '[data-test="kiali-applications-table"]',
  );
  await expect(applicationsTable).toBeAttached({ timeout: 10000 });
  // Search headers specifically in thead to avoid matches in table rows
  const applicationsTableHead = applicationsTable.locator('thead');
  await expect(applicationsTableHead.getByText('HEALTH')).toHaveCount(1, {
    timeout: 10000,
  });
  await expect(
    applicationsTableHead.getByText('NAME', { exact: true }),
  ).toHaveCount(1, { timeout: 10000 });
  await expect(
    applicationsTableHead.getByText('NAMESPACE', { exact: true }),
  ).toHaveCount(1, { timeout: 10000 });
  await expect(applicationsTableHead.getByText('LABELS')).toHaveCount(1, {
    timeout: 10000,
  });

  // Validate it has at least one row with: healthy, details, bookinfo
  const detailsAppRow = applicationsTable.getByText('details');
  await expect(detailsAppRow).toBeAttached({ timeout: 10000 });
  await expect(applicationsTable.getByText('bookinfo')).toHaveCount(5, {
    timeout: 10000,
  });
});

test('Istio configuration card content', async ({ page }) => {
  await navigateToKialiTab(page);

  // Find the Istio Configuration card header to verify it exists
  const istioConfigCardHeader = page.getByText('Istio Config', { exact: true });
  await expect(istioConfigCardHeader).toBeAttached();

  // Verify table headers: Name, Namespace, Type, Config (Istio Config uses VirtualList, headers are uppercase)
  const istioTable = page.locator('[data-test="kiali-istio-table"]');
  await expect(istioTable).toBeAttached({ timeout: 10000 });
  // VirtualList renders headers in uppercase
  const istioTableHead = istioTable.locator('thead');
  await expect(istioTableHead.getByText('NAME', { exact: true })).toHaveCount(
    1,
    { timeout: 10000 },
  );
  await expect(
    istioTableHead.getByText('NAMESPACE', { exact: true }),
  ).toHaveCount(1, { timeout: 10000 });
  await expect(istioTableHead.getByText('TYPE', { exact: true })).toHaveCount(
    1,
    { timeout: 10000 },
  );
  await expect(istioTableHead.getByText('CONFIG', { exact: true })).toHaveCount(
    1,
    { timeout: 10000 },
  );

  // Validate it has at least one row with: bookinfo-gateway, bookinfo, Gateway
  const gatewayRow = istioTable.getByText('bookinfo-gateway');
  await expect(gatewayRow).toBeAttached({ timeout: 10000 });
  await expect(istioTable.getByText('bookinfo')).toHaveCount(4, {
    timeout: 10000,
  });
  await expect(istioTable.getByText('Gateway', { exact: true })).toHaveCount(
    1,
    { timeout: 10000 },
  );
});

// Verify the drawer content
test('Verify Resources Drawer content', async ({ page }) => {
  await navigateToKialiTab(page);

  // Navigate to Workloads tab
  const workloadsTab = page.getByRole('tab', { name: 'Workloads' });
  await expect(workloadsTab).toBeVisible();
  await workloadsTab.click();
  await expect(workloadsTab).toHaveAttribute('aria-selected', 'true');

  // Wait for the workloads table to load
  const workloadsTable = page.locator('[data-test="kiali-workloads-table"]');
  await expect(workloadsTable).toBeAttached({ timeout: 10000 });

  // Click on details-v1 row to open the drawer
  const detailsV1Row = workloadsTable.getByText('details-v1');
  await expect(detailsV1Row).toBeAttached({ timeout: 10000 });
  await detailsV1Row.click();

  // Verify drawer appears
  const drawer = page.locator('[data-test="drawer"]');
  await expect(drawer).toBeAttached({ timeout: 10000 });

  // Verify drawer content: title with workload name
  const workloadTitle = drawer.locator('[data-test="workload-title"]');
  await expect(workloadTitle).toBeAttached();
  await expect(workloadTitle).toContainText('details-v1');

  // Verify health badge exists
  const healthBadge = drawer.locator('[data-test="health"]');
  await expect(healthBadge).toBeAttached();

  // Verify labels: app and version
  const appLabelContainer = drawer.locator('[data-test="app-label-container"]');
  await expect(appLabelContainer).toBeAttached();
  await expect(appLabelContainer).toContainText('app=details');

  const versionLabelContainer = drawer.locator(
    '[data-test="version-label-container"]',
  );
  await expect(versionLabelContainer).toBeAttached();
  await expect(versionLabelContainer).toContainText('version=v1');

  // Verify Apps list
  const appListItem = drawer.locator('[data-test="App_bookinfo_details"]');
  await expect(appListItem).toBeAttached();
  await expect(appListItem).toContainText('details');

  // Verify Services list
  const serviceListItem = drawer.locator('[data-test="Service_details"]');
  await expect(serviceListItem).toBeAttached();
  await expect(serviceListItem).toContainText('details');

  // Verify close button exists
  const closeButton = drawer.locator('#close_drawer');
  await expect(closeButton).toBeAttached();

  // Close the drawer before switching tabs
  // Use Escape key as it's more reliable for Material-UI Drawers
  await page.keyboard.press('Escape');

  // Wait for drawer to disappear
  await expect(drawer).not.toBeAttached({ timeout: 5000 });

  // Do the same for the Services tab
  // ================================
  const servicesTab = page.getByRole('tab', { name: 'Services' });
  await expect(servicesTab).toBeVisible();
  await servicesTab.click();
  await expect(servicesTab).toHaveAttribute('aria-selected', 'true');

  // Wait for the services table to load
  const servicesTable = page.locator('[data-test="kiali-services-table"]');
  await expect(servicesTable).toBeAttached({ timeout: 10000 });

  // Click on details service row to open the drawer
  const detailsServiceRow = servicesTable.getByText('details');
  await expect(detailsServiceRow).toBeAttached({ timeout: 10000 });
  await detailsServiceRow.click();

  // Verify drawer appears
  const drawerS = page.locator('[data-test="drawer"]');
  await expect(drawerS).toBeAttached({ timeout: 10000 });

  // Verify drawer content: title with service name
  // The service title is in a card with id="ServiceDescriptionCard"
  const serviceCard = drawerS.locator('#ServiceDescriptionCard');
  await expect(serviceCard).toBeAttached();
  // Verify the title contains "details" (the service name)
  const serviceTitle = serviceCard.locator('h6');
  await expect(serviceTitle).toBeAttached();
  await expect(serviceTitle).toContainText('details');

  // Verify health badge exists
  const healthBadgeS = drawerS.locator('[data-test="health"]');
  await expect(healthBadgeS).toBeAttached();

  // Verify labels: app and service
  const appLabelContainerS = drawerS
    .locator('[data-test="app-label-container"]')
    .first();
  await expect(appLabelContainerS).toBeAttached();
  await expect(appLabelContainerS).toContainText('app=details');

  const serviceLabelContainer = drawerS.locator(
    '[data-test="service-label-container"]',
  );
  await expect(serviceLabelContainer).toBeAttached();
  await expect(serviceLabelContainer).toContainText('service=details');

  // Close the drawer before switching tabs
  // Use Escape key as it's more reliable for Material-UI Drawers
  await page.keyboard.press('Escape');
  await expect(drawerS).not.toBeAttached({ timeout: 5000 });

  // Do the same for the Applications tab
  // ================================
  const applicationsTab = page.getByRole('tab', { name: 'Applications' });
  await expect(applicationsTab).toBeVisible();
  await applicationsTab.click();
  await expect(applicationsTab).toHaveAttribute('aria-selected', 'true');

  // Wait for the applications table to load
  const applicationsTable = page.locator(
    '[data-test="kiali-applications-table"]',
  );
  await expect(applicationsTable).toBeAttached({ timeout: 10000 });

  // Click on details application row to open the drawer
  const detailsApplicationRow = applicationsTable.getByText('details');
  await expect(detailsApplicationRow).toBeAttached({ timeout: 10000 });
  await detailsApplicationRow.click();

  // Verify drawer appears
  const drawerA = page.locator('[data-test="drawer"]');
  await expect(drawerA).toBeAttached({ timeout: 10000 });

  // Verify drawer content: title with application name
  // The application title is in an h6 element within the drawer
  const applicationTitle = drawerA.locator('h6');
  await expect(applicationTitle).toBeAttached();
  await expect(applicationTitle).toContainText('details');

  // Verify health badge exists
  const healthBadgeA = drawerA.locator('[data-test="health"]');
  await expect(healthBadgeA).toBeAttached();
});

// Verify the Istio Config drawer content
test('Verify Istio Config Drawer content', async ({ page }) => {
  await navigateToKialiTab(page);

  // Find the Istio Configuration card header to verify it exists
  const istioConfigCardHeader = page.getByText('Istio Config', { exact: true });
  await expect(istioConfigCardHeader).toBeAttached();

  // Wait for the Istio Config table to load
  const istioTable = page.locator('[data-test="kiali-istio-table"]');
  await expect(istioTable).toBeAttached({ timeout: 10000 });

  // Click on bookinfo-gateway row to open the drawer
  const gatewayRow = istioTable.getByText('bookinfo-gateway');
  await expect(gatewayRow).toBeAttached({ timeout: 10000 });
  await gatewayRow.click();

  // Verify drawer appears
  const drawerI = page.locator('[data-test="drawer"]');
  await expect(drawerI).toBeAttached({ timeout: 10000 });

  // Verify drawer content: title with Istio Config name
  // The Istio Config title is in a card with data-test="istio-config-description-card"
  const istioConfigCard = drawerI.locator(
    '[data-test="istio-config-description-card"]',
  );
  await expect(istioConfigCard).toBeAttached();
  // Verify the title contains "bookinfo-gateway" (the Istio Config name)
  const istioConfigTitle = istioConfigCard.locator('h6').first();
  await expect(istioConfigTitle).toBeAttached();
  await expect(istioConfigTitle).toContainText('bookinfo-gateway');

  // Verify validation icon exists
  const validationIcon = drawerI.locator(
    '[data-test="validation-icon-correct"]',
  );
  await expect(validationIcon).toBeAttached();

  // Verify close button exists
  const closeButtonI = drawerI.locator('#close_drawer');
  await expect(closeButtonI).toBeAttached();

  // Close the drawer
  // Use Escape key as it's more reliable for Material-UI Drawers
  await page.keyboard.press('Escape');
  await expect(drawerI).not.toBeAttached({ timeout: 5000 });
});
