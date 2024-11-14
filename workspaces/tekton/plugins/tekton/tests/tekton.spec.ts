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
import { expect, Locator, Page, test } from '@playwright/test';

import { Common } from './tektonHelper';

test.describe('Tekton plugin', () => {
  let page: Page;
  let common: Common;
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    common = new Common(page);

    await common.loginAsGuest();
    await expect(
      page.getByRole('heading', { name: 'Pipeline Runs' }),
    ).toBeVisible({ timeout: 20000 });
  });

  test.afterAll(async ({ browser }) => {
    await browser.close();
  });

  test('Control elements are shown', async () => {
    const clusterSelect = page.locator('.bs-tkn-cluster-selector');
    await expect(
      clusterSelect.getByText('Cluster', { exact: true }),
    ).toBeVisible();
    await expect(clusterSelect.getByText('mock-cluster')).toBeVisible();

    const statusSelect = page.locator('.bs-tkn-status-selector');
    await expect(statusSelect.getByText('Status')).toBeVisible();
    await expect(statusSelect.getByText('All')).toBeVisible();

    const columns = [
      'NAME',
      'VULNERABILITIES',
      'STATUS',
      'TASK STATUS',
      'STARTED',
      'DURATION',
      'ACTIONS',
    ];
    const thead = page.locator('thead');
    for (const col of columns) {
      await expect(
        thead.getByRole('columnheader', { name: col, exact: true }),
      ).toBeVisible();
    }
  });

  test('Pipelines are shown', async () => {
    const plrLabel = page.locator('.bs-tkn-pipeline-visualization__label');
    expect(await plrLabel.all()).toHaveLength(5);
    for (const plr of await plrLabel.all()) {
      expect(plr).toBeVisible();
    }
  });

  test('Pipeline without scan or sbom only shows logs', async () => {
    const row = page.getByRole('row', { name: 'pipeline-test-wbvtlk' });
    await expect(row.getByRole('cell').nth(2)).toHaveText('-');

    const actions = row.getByRole('cell').last();
    await expect(actions.getByRole('button').first()).toBeEnabled();
    await expect(row.getByTestId('view-sbom-icon')).toBeDisabled();
    await expect(row.getByTestId('view-output-icon')).toBeDisabled();
  });

  test.describe('Pipeline with scanner', () => {
    const output = {
      vulnerabilities: {
        critical: 13,
        high: 29,
        medium: 32,
        low: 3,
        unknown: 0,
      },
      unpatched_vulnerabilities: {
        critical: 0,
        high: 1,
        medium: 0,
        low: 1,
      },
    };
    const policyColumns = [
      'Name',
      'Severity',
      'Breaks build',
      'Description',
      'Violation',
      'Remediation',
    ];
    let row: Locator;

    test.beforeAll(() => {
      row = page.getByRole('row', { name: 'pipelinerun-with-scanner-task' });
    });

    test.afterAll(async () => {
      await page.getByLabel('close').click();
    });

    test('Vulnerabilities are shown in the run', async () => {
      await checkVulnerabilities(row, output.vulnerabilities);
    });

    test('Output action is available', async () => {
      const btn = row.getByTestId('view-output-icon');
      await expect(btn).toBeEnabled();
      await btn.click();
      await expect(page.getByTestId('pipelinerun-output-dialog')).toBeVisible();
    });

    test('Enterprise contract output is shown', async () => {
      const card = page.getByTestId('enterprise-contract');
      const title = page.locator('[id="{enterprise contract-title}"]');
      // check the title and the badge
      await expect(title.getByTestId('card-title')).toBeVisible();
      await expect(title.getByTestId('card-title')).toHaveText(
        'Enterprise Contract',
      );
      await expect(title.getByTestId('card-badge')).toHaveText('Failed');

      // check the description
      await expect(card).toContainText('Enterprise Contract is a set of tools');

      // check the summary
      const summary = card.locator('.pf-v5-c-card');
      await expect(summary.getByText('Summary')).toBeVisible();
      await expect(summary.getByText('Failed')).toBeVisible();
      await expect(summary.getByText('Success')).toBeVisible();
      await expect(summary.getByText('Warning')).toBeVisible();

      // check the rules
      const rules = page.getByTestId('ec-policy-table');
      const statuses = rules.getByTestId('rule-status');
      await expect(statuses).toHaveCount(4);
      await expect(statuses.filter({ hasText: 'Failed' })).toHaveCount(2);
      await expect(statuses.filter({ hasText: 'Warning' })).toHaveCount(1);
      await expect(statuses.filter({ hasText: 'Success' })).toHaveCount(1);
    });

    test('ACS Image Scan is shown', async () => {
      const card = page.locator(`[id='advanced cluster security']`);
      await card
        .locator(`[id='advanced cluster security-toggle-button']`)
        .click();
      await card.scrollIntoViewIfNeeded();

      // check the title and the badge
      await expect(card.getByTestId('card-title')).toBeVisible();
      await expect(card.getByTestId('card-title')).toHaveText(
        'Advanced Cluster Security',
      );
      await expect(card.getByTestId('card-badge')).toHaveText('Issues found');

      const sections = [
        'CVEs by severity',
        'CVEs by status',
        'Total scan results',
      ];
      const columns = [
        'CVE ID',
        'Severity',
        'Component',
        'Component version',
        'Fixed in version',
      ];

      await checkCards(card, sections, 'image-scan-table', columns);
    });

    test('ACS Image Check is shown', async () => {
      const card = page.locator(`[id='advanced cluster security']`);
      await card.getByRole('tab', { name: 'Image Check' }).click();
      const cards = ['CVEs by severity', 'Failing policy checks'];

      await checkCards(card, cards, 'image-check-table', policyColumns);
    });

    test('ACS Deployment Check is shown', async () => {
      const card = page.locator(`[id='advanced cluster security']`);
      await card.getByRole('tab', { name: 'Deployment Check' }).click();
      const cards = ['Violations by severity', 'Failing policy checks'];

      await checkCards(card, cards, 'deployment-check-table', policyColumns);
    });

    test('Check other output', async () => {
      const card = page.locator('[id="others"]');
      await card.locator(`[id='others-toggle-button']`).click();
      await card.scrollIntoViewIfNeeded();

      await expect(card.getByRole('gridcell').first()).toContainText(
        'SCAN_OUTPUT',
      );

      const text = (await card
        .getByRole('gridcell')
        .last()
        .textContent()) as string;
      expect(JSON.parse(text)).toEqual(output);
    });
  });

  test('Pipeline with sbom has the show sbom action', async () => {
    const row = page.getByRole('row', { name: 'pipelinerun-with-sbom-task' });
    await expect(row.getByRole('cell').nth(2)).toHaveText('-');

    const showSbom = row.getByTestId('view-sbom-icon');
    await expect(showSbom).toBeEnabled();
    await expect(row.getByTestId('view-output-icon')).toBeDisabled();
    await showSbom.click();

    const dialog = page.getByTitle('PipelineRun Logs');
    await expect(dialog.getByText('sbom-task')).toBeVisible();

    await page.getByLabel('close').click();
  });

  test.describe('Pipeline with external sbom', () => {
    let row: Locator;
    const output = {
      vulnerabilities: {
        critical: 1,
        high: 9,
        medium: 20,
        low: 1,
        unknown: 0,
      },
      unpatched_vulnerabilities: {
        critical: 0,
        high: 1,
        medium: 0,
        low: 1,
      },
    };

    test.beforeAll(() => {
      row = page.getByRole('row', {
        name: 'pipelinerun-with-external-sbom-task',
      });
    });

    test('Vulnerability scan is shown', async () => {
      await checkVulnerabilities(row, output.vulnerabilities);
    });

    test('Show sbom action points to quay.io', async () => {
      const showSbom = row.getByTestId('view-sbom-icon');
      await expect(showSbom).toBeEnabled();
      expect(await showSbom.locator('a').getAttribute('href')).toContain(
        'https://quay.io',
      );
    });

    test('View output action is enabled', async () => {
      const viewOutput = row.getByTestId('view-output-icon');
      await expect(viewOutput).toBeEnabled();

      await viewOutput.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      await expect(dialog.locator('tbody')).toContainText('MY_SCAN_OUTPUT');
      const text = (await dialog.locator('td').last().textContent()) as string;
      expect(JSON.parse(text)).toEqual(output);
      await page.getByLabel('close').click();
    });
  });

  test('Signed pipeline shows the signed indicator', async () => {
    const row = page.getByRole('row', { name: 'ruby-ex-git-xf45fo' });
    await expect(row.locator('.signed-indicator')).toBeVisible();
  });
});

async function checkCards(
  base: Locator,
  sectionTitles: string[],
  tableName: string,
  columns: string[],
) {
  // check the violations summary
  const sections = base.locator('.pf-v5-c-card:visible');
  for (const item of sectionTitles) {
    await expect(sections.filter({ hasText: item })).toBeVisible();
  }

  // check the violations table
  const table = base.getByTestId(tableName);
  await expect(table).toBeVisible();

  for (const col of columns) {
    await expect(
      table.locator('thead').getByText(col, { exact: true }),
    ).toBeVisible();
  }
  expect(await table.getByRole('row').count()).toBeGreaterThan(1);
}

async function checkVulnerabilities(
  row: Locator,
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  },
) {
  const vuln = row.locator('.severity');
  let i = 0;

  for (const prop in vulnerabilities) {
    if (vulnerabilities[prop] > 0) {
      await expect(vuln.nth(i)).toContainText(
        new RegExp(`${prop}\s*${vulnerabilities[prop]}`),
        { ignoreCase: true },
      );
      i++;
    }
  }
}
