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

import {
  ApiBlueprint,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { isAkeylessAvailable } from './conditions';
import { akeylessApiRef, AkeylessClient } from './api';

/**
 * @alpha
 */
export const akeylessApi = ApiBlueprint.make({
  name: 'akeylessApi',
  params: defineParams =>
    defineParams({
      api: akeylessApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({
        discoveryApi,
        fetchApi,
      }: {
        discoveryApi: DiscoveryApi;
        fetchApi: FetchApi;
      }) =>
        new AkeylessClient({
          discoveryApi,
          fetchApi,
        }),
    }),
});

/**
 * Overview card — visible on the entity Overview tab when annotated.
 * @alpha
 */
export const akeylessEntityCard = EntityCardBlueprint.make({
  name: 'akeylessEntityCard',
  params: {
    filter: isAkeylessAvailable,
    type: 'content',
    loader: async () => {
      const { EntityAkeylessCard } = await import(
        './components/EntityAkeylessCard'
      );
      return <EntityAkeylessCard />;
    },
  },
});

/**
 * Dedicated entity tab under Development.
 * @alpha
 */
export const akeylessEntityContent = EntityContentBlueprint.make({
  name: 'akeylessEntityContent',
  params: {
    path: '/akeyless',
    title: 'Akeyless',
    group: 'development',
    filter: isAkeylessAvailable,
    loader: async () => {
      const { EntityAkeylessCard } = await import(
        './components/EntityAkeylessCard'
      );
      return <EntityAkeylessCard />;
    },
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'akeyless',
  extensions: [akeylessApi, akeylessEntityCard, akeylessEntityContent],
});
