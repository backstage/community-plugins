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
async function navigateToKialiPage(page: any) {
  await page.goto('/kiali/overview');

  const enterButton = page.getByRole('button', { name: 'Enter' });
  await expect(enterButton).toBeVisible();
  await enterButton.click();

  await expect(page.getByText('Provider:', { exact: false })).toBeVisible();
}

test('Header should be correct', async ({ page }) => {
  await navigateToKialiPage(page);

  // Verify provider
  const providerSelector = page.locator('[data-test="provider-selector"]');
  await expect(providerSelector).toBeVisible({ timeout: 10000 });

  // Verify the selected value is Kubernetes by checking the visible text in the select button
  const providerSelectButton = providerSelector.locator('[role="button"]');
  await expect(providerSelectButton).toBeVisible();
  await expect(providerSelectButton).toContainText('Kubernetes');

  // Verify namespaces selected
  const namespaceSelector = page.locator('[data-test="namespace-selector"]');
  await expect(namespaceSelector).toBeVisible();
  await expect(namespaceSelector).toContainText(
    'bookinfo, default, istio-system',
  );

  // Verify cluster and icons
  const homeCluster = page.locator('[data-test="home-cluster"]');
  await expect(homeCluster).toBeVisible();
  await expect(homeCluster).toContainText('Kubernetes');

  const helpButton = page.locator('[data-test="help-button"]');
  await expect(helpButton).toBeVisible();

  const messageCenter = page.locator('[data-test="message-center"]');
  await expect(messageCenter).toBeVisible();

  const userElement = page.locator('[data-test="user"]');
  await expect(userElement).toBeVisible();
  await expect(userElement).toContainText('User : anonymous');
});

test('Namespace selector Select All / Deselect All', async ({ page }) => {
  await navigateToKialiPage(page);

  // Get the namespace selector
  const namespaceSelector = page.locator('[data-test="namespace-selector"]');
  await expect(namespaceSelector).toBeVisible();

  await expect(namespaceSelector).toContainText('bookinfo');
  await expect(namespaceSelector).toContainText('default');
  await expect(namespaceSelector).toContainText('istio-system');

  // Click on the namespace selector to open the menu
  const namespaceSelectButton = namespaceSelector.locator('[role="button"]');
  await expect(namespaceSelectButton).toBeVisible();
  await namespaceSelectButton.click();

  // Wait for the menu to appear and find the Select All / Deselect All option
  const selectAllOption = page.locator('[data-value="__SELECT_ALL__"]');
  await expect(selectAllOption).toBeVisible({ timeout: 5000 });

  // Verify it shows "Deselect All" when all are selected
  await expect(selectAllOption).toContainText('Deselect All');

  // Click to deselect all
  await selectAllOption.click();

  // Press Escape to ensure menu closes (Material-UI menus sometimes need this)
  await page.keyboard.press('Escape');

  // Wait for the menu to close and selection to update
  await page.waitForTimeout(1000);

  // Verify that no namespaces are selected (the selector should be empty or show a placeholder)
  // The selector might show empty text or a placeholder
  const namespaceSelectButtonAfterDeselect =
    namespaceSelector.locator('[role="button"]');
  await expect(namespaceSelectButtonAfterDeselect).toBeVisible();
  const buttonText = await namespaceSelectButtonAfterDeselect.textContent();
  // When nothing is selected, the button might be empty or show a placeholder
  expect(buttonText?.trim()).not.toContain('bookinfo');

  // Click on the selector again to open the menu
  await namespaceSelectButtonAfterDeselect.click();

  // Wait for the menu to appear again
  const selectAllOptionAfterDeselect = page.locator(
    '[data-value="__SELECT_ALL__"]',
  );
  await expect(selectAllOptionAfterDeselect).toBeVisible({ timeout: 5000 });

  // Verify it now shows "Select All" when nothing is selected
  await expect(selectAllOptionAfterDeselect).toContainText('Select All');

  // Click to select all
  await selectAllOptionAfterDeselect.click();

  // Wait a moment for the selection to update
  await page.waitForTimeout(500);

  // Verify that all namespaces are selected again
  const namespaceSelectButtonAfterReselect =
    namespaceSelector.locator('[role="button"]');
  await expect(namespaceSelectButtonAfterReselect).toContainText('bookinfo');
  await expect(namespaceSelectButtonAfterReselect).toContainText('default');
  await expect(namespaceSelectButtonAfterReselect).toContainText(
    'istio-system',
  );
});

test('Overview Page', async ({ page }) => {
  await navigateToKialiPage(page);

  // Validate overview card exists
  const overviewCard = page.locator('[data-test="overview-card-bookinfo"]');
  await expect(overviewCard).toBeAttached({ timeout: 10000 });

  // Verify the card title contains "bookinfo"
  await expect(overviewCard).toContainText('bookinfo');

  // Validate overview card has metrics (sparklines)
  // The chart may take time to load after API calls complete
  const inboundSparkline = page.locator(
    '[data-test="sparkline-inbound-duration-10m"]',
  );
  await expect(inboundSparkline).toBeAttached({ timeout: 10000 });

  // Verify the sparkline contains a chart (SVG element)
  const sparklineChart = overviewCard.locator('svg').first();
  await expect(sparklineChart).toBeAttached({ timeout: 10000 });

  // Wait for the chart to load data - look for any path element with data (has 'd' attribute)
  // This is more flexible than requiring role="presentation"
  await page.waitForFunction(
    svgSelector => {
      const svg = document.querySelector(svgSelector);
      if (!svg) return false;
      const paths = svg.querySelectorAll('path[d]');
      return paths.length > 0;
    },
    `[data-test="overview-card-bookinfo"] svg`,
    { timeout: 15000 },
  );

  // Verify the chart has data points (path elements with data)
  const chartPaths = sparklineChart.locator('path[d]');
  // Wait a bit for paths to be available
  await page.waitForTimeout(500);
  const pathCount = await chartPaths.count();
  expect(pathCount).toBeGreaterThan(0);
});

test('Traffic Graph Tab', async ({ page }) => {
  await navigateToKialiPage(page);

  // Click on the Traffic Graph tab
  const trafficGraphTab = page.getByTestId('header-tab-1');
  await expect(trafficGraphTab).toBeVisible();
  await expect(trafficGraphTab).toContainText('Traffic Graph');
  await trafficGraphTab.click();

  // Wait for the tab to be selected
  await expect(trafficGraphTab).toHaveAttribute('aria-selected', 'true');

  // Validate graph card exists
  const kialiGraphCard = page.locator('[data-test="kiali-graph-card"]');
  await expect(kialiGraphCard).toBeAttached({ timeout: 10000 });

  // Verify the graph contains data (nodes and edges)
  const graphContainer = kialiGraphCard.locator('[data-test-id="topology"]');
  await expect(graphContainer).toBeAttached({ timeout: 10000 });

  // Verify there are nodes in the graph
  const graphNodes = graphContainer.locator('[data-kind="node"]');
  await expect(graphNodes.first()).toBeAttached({ timeout: 10000 });

  // Verify there are edges in the graph
  const graphEdges = graphContainer.locator('[data-kind="edge"]');
  await expect(graphEdges.first()).toBeAttached({ timeout: 10000 });
});

test('Workloads Tab', async ({ page }) => {
  await navigateToKialiPage(page);

  // Click on the Workloads tab
  const workloadsTab = page.getByTestId('header-tab-2');
  await expect(workloadsTab).toBeVisible();
  await expect(workloadsTab).toContainText('Workloads');
  await workloadsTab.click();

  // Wait for the tab to be selected
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
  await expect(workloadsTableHead.getByText('DETAILS')).toHaveCount(1, {
    timeout: 10000,
  });

  // Validate it has at least one row with: healthy, details-v1, bookinfo
  const detailsV1Row = workloadsTable.getByText('details-v1');
  await expect(detailsV1Row).toBeAttached({ timeout: 10000 });
  await expect(workloadsTable.getByText('bookinfo')).toHaveCount(7);

  // Click on details-v1 row to open the drawer
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

  // Close the drawer
  // Use Escape key as it's more reliable for Material-UI Drawers
  await page.keyboard.press('Escape');

  // Wait for drawer to disappear
  await expect(drawer).not.toBeAttached({ timeout: 5000 });
});
test('Services Tab', async ({ page }) => {
  await navigateToKialiPage(page);

  // Click on the Services tab
  const servicesTab = page.getByTestId('header-tab-3');
  await expect(servicesTab).toBeVisible();
  await expect(servicesTab).toContainText('Services');
  await servicesTab.click();

  // Wait for the tab to be selected
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
  await expect(servicesTableHead.getByText('DETAILS')).toHaveCount(1, {
    timeout: 10000,
  });

  // Validate it has at least one row with: healthy, details, bookinfo
  await expect(servicesTable.getByText('bookinfo')).toHaveCount(6);

  // Click on details service row to open the drawer
  // Use data-test attribute to avoid matching multiple elements
  const detailsServiceRow = page.locator(
    '[data-test="service-namespace-details"]',
  );
  await expect(detailsServiceRow).toBeAttached({ timeout: 10000 });
  await detailsServiceRow.click();

  // Verify drawer appears
  const drawer = page.locator('[data-test="drawer"]');
  await expect(drawer).toBeAttached({ timeout: 10000 });

  // Verify drawer content: title with service name
  // The service title is in a card with id="ServiceDescriptionCard"
  const serviceCard = drawer.locator('#ServiceDescriptionCard');
  await expect(serviceCard).toBeAttached();
  // Verify the title contains "details" (the service name)
  const serviceTitle = serviceCard.locator('h6');
  await expect(serviceTitle).toBeAttached();
  await expect(serviceTitle).toContainText('details');

  // Verify health badge exists
  const healthBadge = drawer.locator('[data-test="health"]');
  await expect(healthBadge).toBeAttached();

  // Verify labels: app and service
  const appLabelContainer = drawer
    .locator('[data-test="app-label-container"]')
    .first();
  await expect(appLabelContainer).toBeAttached();
  await expect(appLabelContainer).toContainText('app=details');

  const serviceLabelContainer = drawer.locator(
    '[data-test="service-label-container"]',
  );
  await expect(serviceLabelContainer).toBeAttached();
  await expect(serviceLabelContainer).toContainText('service=details');

  // Verify close button exists
  const closeButton = drawer.locator('#close_drawer');
  await expect(closeButton).toBeAttached();

  // Close the drawer
  // Use Escape key as it's more reliable for Material-UI Drawers
  await page.keyboard.press('Escape');

  // Wait for drawer to disappear
  await expect(drawer).not.toBeAttached({ timeout: 5000 });
});

test('Applications Tab', async ({ page }) => {
  await navigateToKialiPage(page);

  // Click on the Applications tab
  const applicationsTab = page.getByTestId('header-tab-4');
  await expect(applicationsTab).toBeVisible();
  await expect(applicationsTab).toContainText('Applications');
  await applicationsTab.click();

  // Wait for the tab to be selected
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
  await expect(applicationsTableHead.getByText('DETAILS')).toHaveCount(1, {
    timeout: 10000,
  });

  // Validate it has at least one row with: healthy, details, bookinfo
  await expect(applicationsTable.getByText('bookinfo')).toHaveCount(10, {
    timeout: 10000,
  });

  // Click on details application row to open the drawer
  // Use data-test attribute to avoid matching multiple elements
  const detailsAppRow = page.locator('[data-test="app-namespace-details"]');
  await expect(detailsAppRow).toBeAttached({ timeout: 10000 });
  await detailsAppRow.click();

  // Verify drawer appears
  const drawer = page.locator('[data-test="drawer"]');
  await expect(drawer).toBeAttached({ timeout: 10000 });

  // Verify drawer content: title with application name
  // The application title is in an h6 element within the drawer
  const applicationTitle = drawer.locator('h6');
  await expect(applicationTitle).toBeAttached();
  await expect(applicationTitle).toContainText('details');

  // Verify health badge exists
  const healthBadge = drawer.locator('[data-test="health"]');
  await expect(healthBadge).toBeAttached();

  // Verify close button exists
  const closeButton = drawer.locator('#close_drawer');
  await expect(closeButton).toBeAttached();

  // Close the drawer
  // Use Escape key as it's more reliable for Material-UI Drawers
  await page.keyboard.press('Escape');

  // Wait for drawer to disappear
  await expect(drawer).not.toBeAttached({ timeout: 5000 });
});

test('Istio Config Tab', async ({ page }) => {
  await navigateToKialiPage(page);

  // Click on the Istio Config tab
  const istioConfigTab = page.getByTestId('header-tab-5');
  await expect(istioConfigTab).toBeVisible();
  await expect(istioConfigTab).toContainText('Istio Config');
  await istioConfigTab.click();

  // Wait for the tab to be selected
  await expect(istioConfigTab).toHaveAttribute('aria-selected', 'true');

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
  await expect(
    istioTableHead.getByText('CONFIGURATION', { exact: true }),
  ).toHaveCount(1, { timeout: 10000 });

  // Validate it has at least one row with: bookinfo-gateway, bookinfo, Gateway
  await expect(istioTable.getByText('bookinfo')).toHaveCount(4, {
    timeout: 10000,
  });
  await expect(istioTable.getByText('Gateway', { exact: true })).toHaveCount(
    1,
    { timeout: 10000 },
  );

  // Click on bookinfo-gateway row to open the drawer
  // Search in tbody to avoid any potential header matches
  const istioTableBody = istioTable.locator('tbody');
  const gatewayRow = istioTableBody.getByText('bookinfo-gateway');
  await expect(gatewayRow).toBeAttached({ timeout: 10000 });
  await gatewayRow.click();

  // Verify drawer appears
  const drawer = page.locator('[data-test="drawer"]');
  await expect(drawer).toBeAttached({ timeout: 10000 });

  // Verify drawer content: title with Istio Config name
  // The Istio Config title is in a card with data-test="istio-config-description-card"
  const istioConfigCard = drawer.locator(
    '[data-test="istio-config-description-card"]',
  );
  await expect(istioConfigCard).toBeAttached();
  // Verify the title contains "bookinfo-gateway" (the Istio Config name)
  const istioConfigTitle = istioConfigCard.locator('h6').first();
  await expect(istioConfigTitle).toBeAttached();
  await expect(istioConfigTitle).toContainText('bookinfo-gateway');

  // Verify validation icon exists
  const validationIcon = drawer.locator(
    '[data-test="validation-icon-correct"]',
  );
  await expect(validationIcon).toBeAttached();

  // Verify close button exists
  const closeButton = drawer.locator('#close_drawer');
  await expect(closeButton).toBeAttached();

  // Close the drawer
  // Use Escape key as it's more reliable for Material-UI Drawers
  await page.keyboard.press('Escape');

  // Wait for drawer to disappear
  await expect(drawer).not.toBeAttached({ timeout: 5000 });
});
