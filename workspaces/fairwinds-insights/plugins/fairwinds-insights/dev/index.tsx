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

/**
 * New frontend system dev mode: standalone pages with EntityProvider so all
 * cards render for both a component without Fairwinds config and one with
 * annotations (same semantics as the legacy createDevApp setup).
 */
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';

import ReactDOM from 'react-dom/client';
import { createApp } from '@backstage/frontend-defaults';
import {
  PageBlueprint,
  createFrontendModule,
  createFrontendPlugin,
} from '@backstage/frontend-plugin-api';
import {
  Content,
  Header,
  Page,
  Sidebar,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import BlockIcon from '@mui/icons-material/Block';
import TuneIcon from '@mui/icons-material/Tune';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import Grid from '@mui/material/Grid';

import fairwindsInsightsPlugin from '../src/alpha';
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

function EntityDevPage({ entity }: { entity: Entity }) {
  return (
    <Page themeId="home">
      <Header title={String(entity.metadata.name)} />
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
  );
}

const fairwindsInsightsDevPlugin = createFrontendPlugin({
  pluginId: 'fairwinds-insights-dev',
  extensions: [
    PageBlueprint.make({
      name: 'no-config',
      params: {
        path: '/no-config',
        title: 'no-config',
        loader: () => Promise.resolve(<EntityDevPage entity={entities[0]} />),
      },
    }),
    PageBlueprint.make({
      name: 'with-config',
      params: {
        path: '/with-config',
        title: 'with-config',
        loader: () => Promise.resolve(<EntityDevPage entity={entities[1]} />),
      },
    }),
  ],
});

/** Sidebar links so both dev entities are reachable without typing URLs. */
const fairwindsInsightsDevNavModule = createFrontendModule({
  pluginId: 'app',
  extensions: [
    NavContentBlueprint.make({
      params: {
        component: () => (
          <Sidebar>
            <SidebarGroup label="Fairwinds Insights (dev)">
              <SidebarScrollWrapper>
                <SidebarItem
                  icon={BlockIcon}
                  to="/no-config"
                  text="no-config"
                />
                <SidebarItem
                  icon={TuneIcon}
                  to="/with-config"
                  text="with-config"
                />
              </SidebarScrollWrapper>
            </SidebarGroup>
            <SidebarSpace />
          </Sidebar>
        ),
      },
    }),
  ],
});

const defaultPage = '/no-config';

const app = createApp({
  features: [
    fairwindsInsightsPlugin,
    fairwindsInsightsDevPlugin,
    fairwindsInsightsDevNavModule,
  ],
});

const root = app.createRoot();

if (typeof window !== 'undefined' && window.location.pathname === '/') {
  window.location.pathname = defaultPage;
}

ReactDOM.createRoot(document.getElementById('root')!).render(root);
