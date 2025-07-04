/*
 * Copyright 2023 The Backstage Authors
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
  createApiFactory,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';

import { LinguistClient, linguistApiRef } from '../api';
import { compatWrapper } from '@backstage/core-compat-api';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isLinguistAvailable } from '../plugin';

/** @alpha */
export const entityLinguistCard = EntityCardBlueprint.make({
  name: 'languages',
  params: {
    filter: isLinguistAvailable,
    loader: async () =>
      import('../components/LinguistCard').then(m =>
        compatWrapper(<m.LinguistCard />),
      ),
  },
});

/** @alpha */
export const linguistApi = ApiBlueprint.make({
  params: {
    factory: createApiFactory({
      api: linguistApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new LinguistClient({ discoveryApi, fetchApi }),
    }),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'linguist',
  extensions: [linguistApi, entityLinguistCard],
});
