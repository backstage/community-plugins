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

import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import {
  ApiBlueprint,
  createFrontendPlugin,
  createRouteRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  copilotApiRef,
  copilotApiV2Ref,
  CopilotClient,
  CopilotClientV2,
} from '../api';

import { compatWrapper } from '@backstage/core-compat-api';

import { RiCopilotLine as CopilotIcon } from '@remixicon/react';

export const copilotRouteRef = createRouteRef();

/** @alpha */
export const copilotLegacyApi = ApiBlueprint.make({
  name: 'copilot-legacy',
  params: defineParams =>
    defineParams({
      api: copilotApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CopilotClient({ discoveryApi, fetchApi }),
    }),
});

/** @alpha */
export const copilotApi = ApiBlueprint.make({
  name: 'copilot',
  params: defineParams =>
    defineParams({
      api: copilotApiV2Ref,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new CopilotClientV2({ discoveryApi, fetchApi }),
    }),
});

/** @alpha */
export const copilotPage = PageBlueprint.make({
  name: 'copilot',
  params: {
    path: '/copilot',
    title: 'Copilot Insights',
    icon: <CopilotIcon />,
    routeRef: copilotRouteRef,
    loader: () =>
      import('../components').then(m => compatWrapper(<m.CopilotIndexPage />)),
  },
});

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'copilot',
  extensions: [copilotLegacyApi, copilotApi, copilotPage],
  routes: {
    copilot: copilotRouteRef,
  },
});
