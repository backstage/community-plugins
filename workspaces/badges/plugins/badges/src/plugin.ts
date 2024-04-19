/*
 * Copyright 2021 The Backstage Authors
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
import { badgesApiRef, BadgesClient } from './api';
import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  fetchApiRef,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

/** @public */
export const badgesPlugin = createPlugin({
  id: 'badges',
  apis: [
    createApiFactory({
      api: badgesApiRef,
      deps: {
        fetchApi: fetchApiRef,
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ fetchApi, discoveryApi, configApi }) =>
        new BadgesClient({
          fetchApi,
          discoveryApi,
          configApi,
        }),
    }),
  ],
});

/** @public */
export const EntityBadgesDialog = badgesPlugin.provide(
  createComponentExtension({
    name: 'EntityBadgesDialog',
    component: {
      lazy: () =>
        import('./components/EntityBadgesDialog').then(
          m => m.EntityBadgesDialog,
        ),
    },
  }),
);
