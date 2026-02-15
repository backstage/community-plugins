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
import { expect, TestInfo, type Locator, type Page } from '@playwright/test';
import { TopologyMessages, templateToPattern } from './translations';

export class Common {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForSideBarVisible() {
    await this.page.waitForSelector('nav a', { timeout: 120000 });
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
      const localeString = locale === 'ja' ? '日本語' : locale;
      await this.page.getByRole('button', { name: 'Language' }).click();
      await this.page.getByRole('menuitem', { name: localeString }).click();
    }
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

    await expect(resourcesTab).toMatchAriaSnapshot(`
      - heading "Pods"
      - list:
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

    await expect(resourcesTab).toMatchAriaSnapshot(`
    - heading "Services"
    - list:
      - listitem:
        - text: S hello-world
        - list:
          - listitem: "/Service port: \\\\d+-TCP Pod port: \\\\d+/"
       `);

    await expect(resourcesTab).toMatchAriaSnapshot(`
    - heading "Routes"
    - list:
      - listitem:
        - text: "RT hello-minikube2 ${translations.common.location}:"
        - link /https:\\/\\/nodejs-ex-git-jai-test\\.apps\\.viraj-\\d+-\\d+-\\d+-0\\.devcluster\\.openshift\\.com/:
          - /url: https://nodejs-ex-git-jai-test.apps.viraj-22-05-2023-0.devcluster.openshift.com
      `);

    await expect(resourcesTab).toMatchAriaSnapshot(`
      - heading "Ingresses"
      - list:
        - listitem:
          - text: "I example-ingress-hello-world ${translations.common.location}:"
          - link "http://hello-world-app.info/"
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
