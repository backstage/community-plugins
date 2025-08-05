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
import { expect, Locator } from '@playwright/test';

import { mockArgocdConfig, mockRevisions } from '../dev/__data__';
import {
  Application,
  History,
} from '@backstage-community/plugin-redhat-argocd-common';

export const verifyHeader = async (app: Application, card: Locator) => {
  const header = card.locator('.MuiCardHeader-content');
  await expect(header.getByText(`${app.metadata.name}`)).toBeVisible();

  const appUrl = `${mockArgocdConfig.argocd.baseUrl}/applications/${app.metadata.name}`;
  await expect(header.getByRole('link')).toHaveAttribute('href', appUrl);
  await expect(header.getByTestId('app-sync-status-chip')).toHaveText(
    app.status.sync.status,
  );
  await expect(header.getByTestId('app-health-status-chip')).toHaveText(
    app.status.health.status,
  );
};

export const verifyItem = async (
  name: string,
  content: string | string[],
  card: Locator,
  unique = true,
) => {
  const item = card.locator('.MuiGrid-item', { hasText: name });
  const result = unique ? item : item.first();
  await expect(result).toContainText(content);
};

export const verifyDeployments = async (
  app: Application,
  sideBar: Locator,
  index: number,
) => {
  const imageUrl = `https://${app.status.summary.images[0]}`;
  const image = imageUrl.split('/').pop();
  const latestDeploy = app.status.history?.slice(-1)[0];
  const deployHistory = app.status.history?.slice(0, -1) as History[];
  const shortRevision = `${latestDeploy?.revision?.substring(0, 7)}`;

  const latest = sideBar.locator('.MuiGrid-item', {
    hasText: 'Latest deployment',
  });
  await expect(latest).toContainText(
    `Image ${image}${mockRevisions[index].message} ${shortRevision}`,
  );
  await expect(latest.getByRole('link', { name: image })).toHaveAttribute(
    'href',
    imageUrl,
  );
  const revisionUrl = latestDeploy?.source?.repoURL.substring(
    0,
    latestDeploy?.source.repoURL.lastIndexOf('.'),
  );
  await expect(
    latest.getByRole('link', { name: shortRevision }),
  ).toHaveAttribute('href', `${revisionUrl}`);

  const history = sideBar.locator('.MuiGrid-item', {
    hasText: 'Deployment history',
  });
  const items = history.locator('.MuiCard-root', { hasText: 'Deployment' });
  await expect(items).toHaveCount(deployHistory.length);

  for (const item of await items.all()) {
    await expect(item).toContainText(
      `${mockRevisions[index].message} ${shortRevision}`,
    );
  }
};

export const verifyAppCard = async (
  app: Application,
  card: Locator,
  index: number,
) => {
  await verifyHeader(app, card);
  await verifyItem('Instance', 'main', card);
  await verifyItem(
    'Server',
    `${app.spec.destination.server} (in-cluster)`,
    card,
  );
  await verifyItem('Namespace', app.spec.destination.namespace, card);

  const revision = app.status.history
    ?.slice(-1)[0]
    .revision?.substring(0, 7) as string;
  await verifyItem(
    'Commit',
    `${revision}${mockRevisions[index].message}`,
    card,
  );

  const image = app.status.summary.images[0].split('/').pop();
  await verifyItem('Deployment', `Image ${image}`, card);
};

export const verifyAppSidebar = async (
  app: Application,
  sideBar: Locator,
  index: number,
) => {
  await verifyItem(
    `${app.metadata.name}`,
    `${app.status.sync.status}${app.status.health.status}`,
    sideBar,
    false,
  );
  await verifyItem('Instance', 'main', sideBar);
  await verifyItem(
    'Server',
    `${app.spec.destination.server} (in-cluster)`,
    sideBar,
  );
  await verifyItem('Namespace', app.spec.destination.namespace, sideBar);

  const revision = app.status.history
    ?.slice(-1)[0]
    ?.revision?.substring(0, 7) as string;
  await verifyItem(
    'Commit',
    `${revision}${mockRevisions[index].message} by ${mockRevisions[index].author}`,
    sideBar,
    false,
  );

  await verifyDeployments(app, sideBar, index);
};
