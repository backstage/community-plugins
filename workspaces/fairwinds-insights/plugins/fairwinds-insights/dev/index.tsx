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
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Content, Header, Page } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import Grid from '@mui/material/Grid';

import { fairwindsInsightsPlugin } from '../src';
import {
  VulnerabilitiesCard,
  ActionItemsCard,
  ActionItemsTopCard,
  MTDCostOverviewCard,
  ResourcesHistoryCPUCard,
  ResourcesHistoryMemoryCard,
  ResourcesHistoryPodCountCard,
} from '../src/components';

const entities: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: { name: 'no-config' },
    spec: {
      type: 'service',
      owner: 'guests',
      system: 'examples',
      lifecycle: 'production',
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'with-config',
      annotations: {
        'insights.fairwinds.com/app-groups': 'all-resources',
      },
    },
    spec: {
      type: 'service',
      owner: 'guests',
      system: 'examples',
      lifecycle: 'production',
    },
  },
];

const builder = createDevApp().registerPlugin(fairwindsInsightsPlugin);

entities.forEach(entity => {
  builder.addPage({
    element: (
      <Page themeId="home">
        <Header title={entity.metadata.name} />
        <Content>
          <EntityProvider entity={entity}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <VulnerabilitiesCard />
              </Grid>
              <Grid item xs={12} md={6}>
                <MTDCostOverviewCard />
              </Grid>
              <Grid item xs={12} md={12}>
                <ActionItemsCard />
              </Grid>
              <Grid item xs={12} md={12}>
                <ActionItemsTopCard />
              </Grid>
              <Grid item xs={12} md={12}>
                <ResourcesHistoryPodCountCard />
              </Grid>
              <Grid item xs={12} md={12}>
                <ResourcesHistoryCPUCard />
              </Grid>
              <Grid item xs={12} md={12}>
                <ResourcesHistoryMemoryCard />
              </Grid>
            </Grid>
          </EntityProvider>
        </Content>
      </Page>
    ),
    title: entity.metadata.name,
    path: `/${entity.metadata.name}`,
  });
});

builder.render();
