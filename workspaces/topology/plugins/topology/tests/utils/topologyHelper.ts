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
import AxeBuilder from '@axe-core/playwright';
import { expect, TestInfo, type Page } from '@playwright/test';
import { TopologyMessages, templateToPattern } from './translations';

/** Matches APP_MODE in playwright.config.ts / package.json e2e scripts. */
export function isNfsAppMode(): boolean {
  return process.env.APP_MODE === 'alpha';
}

/**
 * Entity page tab `data-testid` for the Topology tab — legacy TabbedLayout uses
 * index 0; NFS entity tabs use the route path (see EntityContentBlueprint path).
 */
export function topologyEntityHeaderTabTestId(): string {
  return isNfsAppMode() ? 'header-tab-/topology' : 'header-tab-0';
}

export class Common {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForSideBarVisible() {
    await this.page.waitForSelector('nav a', { timeout: 120000 });
  }

  async waitForTopologyGraph() {
    const anchorNodes = [
      'test-deployment',
      'fedora-turquoise-rooster-85',
      'win2k22-purple-aphid-31',
    ];

    for (const nodeId of anchorNodes) {
      await this.page.waitForSelector(`[data-test-id="${nodeId}"]`, {
        timeout: 60000,
        state: 'attached',
      });
    }
  }

  async loginAsGuest() {
    await this.page.goto('/');
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await this.page.getByRole('button', { name: 'Enter' }).click();
    await this.waitForSideBarVisible();
  }

  async switchToLocale(locale: string): Promise<void> {
    if (locale !== 'en') {
      const names = new Intl.DisplayNames([locale], { type: 'language' });
      const localeString = names.of(locale) || locale;
      await this.page.getByRole('button', { name: 'Language' }).click();
      await this.page.getByRole('menuitem', { name: localeString }).click();
    }
  }

  /**
   * Opens the Topology workload view. Legacy dev exposes `/topology`; NFS dev
   * mounts Topology on the entity page (catalog → entity → Topology tab).
   */
  async navigateToTopologyView() {
    if (!isNfsAppMode()) {
      await this.page.goto('/topology');
      return;
    }
    await this.page.goto('/catalog');
    await this.page
      .getByRole('link', { name: 'backstage', exact: true })
      .first()
      .click();
    const tabTestId = topologyEntityHeaderTabTestId();
    await expect(this.page.getByTestId(tabTestId)).toBeVisible();
    await this.page.getByTestId(tabTestId).click();
  }

  async a11yCheck(testInfo: TestInfo) {
    const page = this.page;
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    await testInfo.attach('accessibility-scan-results.json', {
      body: JSON.stringify(accessibilityScanResults.violations, null, 2),
      contentType: 'application/json',
    });
  }

  async verifyDeploymentResources(translations: TopologyMessages) {
    await this.page
      .getByRole('tab', { name: translations.sideBar.resources })
      .click();

    const resourcesTab = this.page.getByTestId('resources-tab');
    await expect(resourcesTab.getByTestId('pod-list')).toBeVisible();

    await expect(resourcesTab.getByTestId('pod-list')).toMatchAriaSnapshot(`
      - listitem:
        - text: P test-deployment-645f8d4887-8dmrr ${translations.status.running}
        - button "view logs": ${translations.common.viewLogs}
      - listitem:
        - text: P test-deployment-645f8d4887-d77ff ${translations.status.running}
        - button "view logs": ${translations.common.viewLogs}
      - listitem:
        - text: P test-deployment-645f8d4887-n8644 ${translations.status.running}
        - button "view logs": ${translations.common.viewLogs}
      `);

    await expect(resourcesTab.getByTestId('service-list')).toMatchAriaSnapshot(`
      - listitem:
        - text: S hello-world
        - list:
          - listitem: "/Service port: \\\\d+-TCP Pod port: \\\\d+/"
      `);

    await expect(resourcesTab.getByTestId('routes-list')).toMatchAriaSnapshot(`
      - listitem:
        - text: "RT hello-minikube2 ${translations.common.location}:"
        - link /https:\\/\\/nodejs-ex-git-jai-test\\.apps\\.viraj-\\d+-\\d+-\\d+-0\\.devcluster\\.openshift\\.com/:
          - /url: https://nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com
      `);

    await expect(resourcesTab.getByTestId('ingress-list')).toMatchAriaSnapshot(`
      - listitem:
        - text: "I example-ingress-hello-world ${translations.common.location}:"
        - link "http://hello-world-app.info/":
          - /url: http://hello-world-app.info/
        - code: "/ingressClassName: nginx/"
      `);
  }

  async verifyDeploymentDetails(translations: TopologyMessages) {
    const deploymentDetails = this.page.getByTestId('deployment-details');
    const deploymentlist = this.page.locator('dl');
    await expect(deploymentlist).toMatchAriaSnapshot(`
      - term: ${translations.details.name}
      - definition: test-deployment
      `);
    await expect(deploymentlist).toMatchAriaSnapshot(`
      - term: ${translations.details.namespace}
      - definition: test-app
      `);
    await expect(deploymentlist).toMatchAriaSnapshot(`
      - term: ${translations.details.labels}
      - definition:
        - list:
          - listitem: backstage.io/kubernetes-id = backstage
          - listitem: app.kubernetes.io/instance = test-deployment
        `);
    await expect(deploymentlist).toMatchAriaSnapshot(`
      - term: ${translations.details.annotations}
      - definition:
        - list:
          - listitem: deployment.kubernetes.io/revision = 1
        `);
    await expect(deploymentlist).toMatchAriaSnapshot(`
      - term: ${translations.common.status}
      - definition: ${translations.status.active}
      `);
    await expect(deploymentlist).toMatchAriaSnapshot(`
      - term: ${translations.details.createdAt}
      - definition: "-"
      `);
    await expect(deploymentlist).toMatchAriaSnapshot(`
      - term: ${translations.common.owner}
      - definition: ${translations.details.noOwner}
      `);

    await expect(deploymentDetails).toMatchAriaSnapshot(`
      - term: ${translations.details.updateStrategy}
      - definition: RollingUpdate
      `);
    await expect(deploymentDetails).toMatchAriaSnapshot(`
      - term: ${translations.details.maxUnavailable}
      - definition: /${templateToPattern(
        translations.details.maxUnavailableDescription,
      )}/
      `);
    await expect(deploymentDetails).toMatchAriaSnapshot(`
      - term: ${translations.details.maxSurge}
      - definition: /${templateToPattern(
        translations.details.maxSurgeDescription,
      )}/
      `);
    await expect(deploymentDetails).toMatchAriaSnapshot(`
      - term: ${translations.details.progressDeadlineSeconds}
      - definition: /\\d+ ${translations.time.seconds}/
      `);
    await expect(deploymentDetails).toMatchAriaSnapshot(`
      - term: ${translations.details.minReadySeconds}
      - definition: ${translations.details.notConfigured}
      `);
  }
}
