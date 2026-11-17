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

import { createApiFactory, createPlugin } from '@backstage/core-plugin-api';
import {
  CatalogApi,
  catalogApiRef,
  entityRouteRef,
} from '@backstage/plugin-catalog-react';
import { signalsPlugin } from '@backstage/plugin-signals';
import { Container, Flex, Header, Text } from '@backstage/ui';

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
  .addPage({
    element: <AnnouncementsPage title="Announcements" />,
    title: 'Announcements',
    path: '/announcements',
  })
  .addPage({
    element: (
      <>
        <Header title="Announcement components" />

        <Container>
          <Flex direction="column" gap="8">
            <Flex direction="column">
              <Text as="h2" variant="title-small">
                Banner
              </Text>
              <NewAnnouncementBanner max={2} />
            </Flex>
            <Flex direction="column">
              <Text as="h2" variant="title-small">
                Homepage component
              </Text>
              <AnnouncementsCard max={2} />
            </Flex>
          </Flex>
        </Container>
      </>
    ),
    title: 'Components',
    path: '/announcements/card',
  })
  .render();
