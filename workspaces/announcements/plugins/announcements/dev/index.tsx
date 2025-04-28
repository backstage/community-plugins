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
import { createDevApp } from '@backstage/dev-utils';
import {
  announcementsPlugin,
  AnnouncementsPage,
  AnnouncementsCard,
  NewAnnouncementBanner,
} from '../src/plugin';

import { Content, Header, Page } from '@backstage/core-components';
import { createApiFactory, createPlugin } from '@backstage/core-plugin-api';
import {
  CatalogApi,
  catalogApiRef,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { AnnouncementsTimeline, AdminPortal } from '../src/components';
import { signalsPlugin } from '@backstage/plugin-signals';
import { HomepageCompositionRoot, homePlugin } from '@backstage/plugin-home';
import { Grid, Typography } from '@material-ui/core';

const mockCatalogApi = {
  getEntityByRef: async (entityRef: string) => {
    if (entityRef === 'user:default/guest') {
      return {
        kind: 'User',
        metadata: {
          name: 'guest',
          namespace: 'default',
          description: 'Anonymous to the max',
        },
        spec: {},
      };
    }
    return undefined;
  },
};

const fakeCatalogPlugin = createPlugin({
  id: 'catalog',
  routes: {
    catalogEntity: entityRouteRef,
  },
  apis: [
    createApiFactory({
      api: catalogApiRef,
      deps: {},
      factory: () => {
        return mockCatalogApi as CatalogApi;
      },
    }),
  ],
});

createDevApp()
  .registerPlugin(fakeCatalogPlugin)
  .registerPlugin(announcementsPlugin)
  .registerPlugin(signalsPlugin)
  .registerPlugin(homePlugin)
  .addPage({
    element: (
      <AnnouncementsPage
        cardOptions={{ titleLength: 50 }}
        themeId="home"
        title="Announcements"
        hideInactive
      />
    ),
    title: 'Announcements',
    path: '/announcements',
  })
  .addPage({
    element: <AdminPortal />,
    title: 'Admin Portal',
    path: '/admin',
  })
  .addPage({
    element: (
      <Page themeId="home">
        <Header title="Announcement components" />

        <Content>
          <Grid container spacing={8} direction="column">
            <Grid item md={12}>
              <Typography variant="h4">Banner</Typography>
              <NewAnnouncementBanner max={2} />
            </Grid>
            <Grid item md={12}>
              <Typography variant="h4">Homepage component</Typography>
              <AnnouncementsCard max={2} />
            </Grid>
            <Grid item md={12}>
              <Typography variant="h4">Timeline</Typography>
              <AnnouncementsTimeline />
            </Grid>
          </Grid>
        </Content>
      </Page>
    ),
    title: 'Components',
    path: '/announcements/card',
  })
  .addPage({
    element: <HomepageCompositionRoot />,
    title: 'Root Page',
    path: '/',
  })
  .render();
