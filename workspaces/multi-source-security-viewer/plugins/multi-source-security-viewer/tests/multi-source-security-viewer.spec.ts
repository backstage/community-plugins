/*
 * Copyright 2025 The Backstage Authors
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
import { test, expect, Page, TestInfo } from '@playwright/test';
import { runAccessibilityTests } from './accessibility';

test.describe('Multi-Source Security Viewer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and login as guest
    await page.goto('/');
    await page.getByRole('button', { name: 'Enter' }).click();
  });

  test('Should display basic UI elements and CI/CD tabs', async ({
    page,
  }, testInfo) => {
    // Navigate to Multi Source Security Viewer
    await expect(page.getByLabel('Multi Source Security Viewer')).toContainText(
      'Multi Source Security Viewer',
    );

    await runAccessibilityTests(
      page,
      testInfo,
      'accessibility-scan-results.json',
      {
        skipViolationsAssert: true,
      },
    );
    await page
      .getByRole('link', { name: 'Multi Source Security Viewer' })
      .click();
    await expect(page.locator('h1')).toContainText('demo-sevice');
    await expect(page.getByTestId('header-tab-0')).toContainText('CI/CD');
    await expect(page.locator('h4')).toContainText('Security Information');

    // Verify CI/CD tool tabs are visible
    const cicdTools = [
      'Jenkins',
      'Github Actions',
      'Gitlab CI',
      'Azure Pipelines',
    ];
    for (const tool of cicdTools) {
      await expect(page.getByRole('tab', { name: tool })).toBeVisible();
    }

    await expect(page.getByTestId('FilterAltIcon')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Name' })).toBeVisible();
    await expect(page.getByTestId('SearchIcon')).toBeVisible();
  });

  test('Should search and display pipeline runs table', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search by name' }).fill('2');
    await expect(page.getByText('pipeline-run-2')).toBeVisible();

    // Verify all table column headers
    const headers = [
      'Pipeline Run ID',
      'Type',
      'Critical',
      'Important',
      'Moderate',
      'Low',
      'SBOM',
      'Actions',
    ];
    for (const header of headers) {
      await expect(
        page.getByRole('columnheader', { name: header }),
      ).toBeVisible();
    }

    await expect(page.locator('tbody')).toContainText('pipeline-run');
    await expect(page.getByText('Build').first()).toHaveText('Build');
    await expect(page.locator('tbody')).toContainText('0');

    // Verify severity level labels
    const severityLevels = ['Critical', 'Important', 'Moderate', 'Low'];
    for (const level of severityLevels) {
      await expect(page.getByLabel(level).first()).toBeVisible();
    }
  });

  test('Should display pipeline logs and task buttons', async ({
    page,
  }, testInfo) => {
    await page.getByRole('textbox', { name: 'Search by name' }).fill('2');
    await expect(
      page
        .getByRole('row', { name: 'pipeline-run-2-jenkins Build' })
        .getByTestId('button-logs'),
    ).toBeVisible();
    await page.getByLabel('Link to SBOM').getByRole('button').first().click();
    await expect(page.getByRole('heading')).toContainText(
      'pipeline-run-2-jenkins',
    );
    await runAccessibilityTests(
      page,
      testInfo,
      'accessibility-scan-results.json',
      {
        skipViolationsAssert: true,
      },
    );

    await expect(page.getByTestId('step-log')).toContainText('[Pipeline]');
    await expect(
      page.getByRole('button', { name: 'show-sbom-rhdh' }),
    ).toBeVisible();

    // Verify pipeline task buttons
    const taskButtons = [
      'init',
      'buildah-rhtap',
      'cosign-sign-attest',
      'acs-deploy-check',
      'acs-image-check',
      'acs-image-scan',
      'update-deployment',
      'show-sbom-rhdh',
      'summary',
    ];
    for (const task of taskButtons) {
      await expect(page.getByRole('button', { name: task })).toBeVisible();
      await page.getByRole('button', { name: task }).click();
      await expect(page.getByTestId('step-log')).toContainText(`[Pipeline]`);
    }
    await runAccessibilityTests(
      page,
      testInfo,
      'accessibility-scan-results.json',
      {
        skipViolationsAssert: true,
      },
    );
  });

  test('Should download pipeline logs with correct content', async ({
    page,
  }) => {
    await page.getByRole('textbox', { name: 'Search by name' }).fill('2');
    await page.getByLabel('Link to SBOM').getByRole('button').first().click();

    // Verify download button and file content
    await expect(page.getByTestId('download-logfile')).toContainText(
      'Download',
    );
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-logfile').click();
    const download = await downloadPromise;
    const fileContent = await download
      .path()
      .then(path => require('fs').promises.readFile(path!, 'utf-8'));
    expect(fileContent).toContain('[Pipeline]');

    await expect(page.getByTestId('download-logstep')).toContainText(
      'Download all tasks logs',
    );
    const downloadPromise2 = page.waitForEvent('download');
    await page.getByTestId('download-logstep').click();
    const downloadLogStep = await downloadPromise2;
    const fileContentLogStep = await downloadLogStep
      .path()
      .then(path => require('fs').promises.readFile(path!, 'utf-8'));
    expect(fileContentLogStep).toContain('[Pipeline]');
  });

  test('Should navigate between CI/CD tool tabs', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search by name' }).fill('2');
    await page.getByLabel('Link to SBOM').getByRole('button').first().click();
    await page
      .getByRole('heading', { name: 'pipeline-run-2-jenkins' })
      .getByRole('button')
      .click();

    // Verify other CI/CD tool tabs and their pipeline runs
    const cicdTabTests = [
      { tab: 'Github Actions', cell: 'pipeline-run-1-github' },
      { tab: 'Gitlab CI', cell: 'pipeline-run-1-gitlab' },
      { tab: 'Azure Pipelines', cell: 'pipeline-run-1-azure' },
    ];
    for (const { tab, cell } of cicdTabTests) {
      await page.getByRole('tab', { name: tab }).click();
      await expect(page.getByRole('cell', { name: cell })).toBeVisible();
    }
  });

  test('Should display ACS Image Scan tab with vulnerabilities', async ({
    page,
  }, testInfo) => {
    // Navigate to Azure Pipelines tab and open output
    await page.getByRole('tab', { name: 'Azure Pipelines' }).click();
    await page
      .getByRole('row', { name: 'pipeline-run-1-azure Build' })
      .getByTestId('button-output')
      .click();
    await expect(page.getByRole('heading')).toContainText(
      'pipeline-run-1-azure',
    );
    await expect(page.getByTestId('card-title')).toContainText(
      'Advanced Cluster Security',
    );
    await runAccessibilityTests(
      page,
      testInfo,
      'accessibility-scan-results.json',
      {
        skipViolationsAssert: true,
      },
    );
    await expect(page.getByTestId('issues-found-label')).toContainText(
      'Issues found',
    );

    const tabs = ['Image Scan', 'Image Check', 'Deployment Check'];
    for (const tab of tabs) {
      await expect(page.getByRole('tab', { name: tab })).toBeVisible();
    }

    const cardHeaders = [
      'CVEs by severity',
      'CVEs by status',
      'Total scan results',
    ];
    for (const header of cardHeaders) {
      await expect(
        page.getByLabel('Image Scan').getByText(header),
      ).toBeVisible();
    }

    const severityLevels = ['Critical', 'Important', 'Moderate', 'Low'];
    for (const level of severityLevels) {
      await expect(
        page
          .getByLabel('Image Scan')
          .getByRole('img', { name: level, exact: true }),
      ).toBeVisible();
      await expect(
        page
          .locator('div')
          .getByLabel('Image Scan')
          .getByText(level + ' ' + level, { exact: true }),
      ).toBeVisible();
    }

    // Verify at least one CVE status is present
    const statuses = /Fixable | Unavailable | Breaking/;
    await expect(
      page.getByLabel('Image Scan').getByText(statuses, { exact: true }),
    ).toBeVisible();

    // Verify image scan table headers
    const scanTableHeaders = [
      'CVE ID',
      'Severity',
      'Component',
      'Component version',
      'Fixed in version',
    ];
    for (const header of scanTableHeaders) {
      await expect(
        page
          .getByTestId('image-scan-table')
          .getByRole('columnheader', { name: header, exact: true }),
      ).toBeVisible();
    }

    // Test sorting and filtering
    await page
      .getByTestId('image-scan-table')
      .getByRole('button', { name: 'Severity' })
      .click();
    await expect(
      page.getByTestId('image-scan-row-0').getByRole('row'),
    ).toContainText('Low');
    await page
      .getByTestId('image-scan-table')
      .getByRole('button', { name: 'Component' })
      .click();

    await page.getByTestId('cve-filter-menu').click();
    await page.getByRole('checkbox', { name: 'RHSA-2023:6593' }).check();

    await page.getByTestId('component-filter-menu').click();
    await page.getByRole('checkbox', { name: 'binutils', exact: true }).check();

    await expect(
      page.getByTestId('image-scan-row-0').getByRole('link'),
    ).toContainText('RHSA-2023:6593');
    await expect(
      page.getByTestId('image-scan-row-0').getByRole('row'),
    ).toContainText('MODERATE Moderate');
    await expect(
      page.getByTestId('image-scan-row-0').getByRole('row'),
    ).toContainText('binutils');

    await page
      .getByTestId('image-scan-toolbar')
      .getByTestId('status-filter-menu')
      .click();
    await page.getByRole('checkbox', { name: 'Unavailable' }).check();
    await expect(page.getByTestId('table-empty-state')).toBeVisible();
  });

  test('Should display and filter ACS Image Check tab', async ({ page }) => {
    // Navigate to Azure Pipelines tab and open output
    await page.getByRole('tab', { name: 'Azure Pipelines' }).click();
    await page
      .getByRole('row', { name: 'pipeline-run-1-azure Build' })
      .getByTestId('button-output')
      .click();
    await page.getByRole('tab', { name: 'Image Check' }).click();

    // Verify image check table headers
    const imageCheckHeaders = [
      'Name',
      'Severity',
      'Breaks build',
      'Description',
      'Violation',
      'Remediation',
    ];
    for (const header of imageCheckHeaders) {
      await expect(
        page.getByRole('columnheader', { name: header, exact: true }),
      ).toBeVisible();
    }

    await page
      .getByTestId('image-check-toolbar')
      .getByTestId('status-filter-menu')
      .click();
    await page.getByRole('checkbox', { name: 'Unavailable' }).uncheck();
    await page
      .getByTestId('image-check-toolbar')
      .getByTestId('status-filter-menu')
      .click();
    await page.getByRole('textbox', { name: 'name filter' }).fill('Red');
    await page.waitForTimeout(1000);
    await expect(
      page.getByTestId('image-check-table').locator('tbody'),
    ).toContainText('Red Hat Package Manager in Image');

    await page.getByRole('button', { name: 'Clear all filters' }).click();
    await page.getByTestId('image-check-toolbar').click();
    await page
      .getByTestId('image-check-toolbar')
      .getByTestId('severity-filter-menu')
      .click();
    await page.getByRole('checkbox', { name: 'Low' }).check();
    await expect(
      page.getByTestId('image-check-table').locator('tbody'),
    ).toContainText('Low');
  });

  test('Should display and filter ACS Deployment Check tab', async ({
    page,
  }) => {
    // Navigate to Azure Pipelines tab and open output
    await page.getByRole('tab', { name: 'Azure Pipelines' }).click();
    await page
      .getByRole('row', { name: 'pipeline-run-1-azure Build' })
      .getByTestId('button-output')
      .click();
    await page.getByRole('tab', { name: 'Deployment Check' }).click();

    // Verify deployment check table headers
    const deploymentCheckHeaders = [
      'Name',
      'Severity',
      'Breaks build',
      'Description',
      'Violation',
      'Remediation',
    ];
    for (const header of deploymentCheckHeaders) {
      await expect(
        page.getByRole('columnheader', { name: header, exact: true }),
      ).toBeVisible();
    }

    await page
      .getByTestId('deployment-check-toolbar')
      .getByTestId('severity-filter-menu')
      .click();
    await page.getByRole('checkbox', { name: 'Low' }).uncheck();
    await expect(page.getByTestId('deployment-check-table')).toContainText(
      '90-Day Image Age',
    );

    await page.getByRole('textbox', { name: 'name filter' }).fill('docker');
    await page.waitForTimeout(1000);
    await expect(
      page.getByTestId('deployment-check-table').locator('tbody'),
    ).toContainText('Docker');
  });
});
