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
  createPlugin,
  createRoutableExtension,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  configApiRef,
  identityApiRef,
  IconComponent,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { agenticChatApiRef, AgenticChatApiClient } from './api';
import { AgenticChatIconComponent } from './components/AgenticChatIcon';

/**
 * Agentic Chat plugin
 * @public
 */
export const agenticChatPlugin = createPlugin({
  id: 'agentic-chat',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: agenticChatApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, fetchApi, configApi, identityApi }) =>
        new AgenticChatApiClient({
          discoveryApi,
          fetchApi,
          configApi,
          identityApi,
        }),
    }),
  ],
});

/**
 * Agentic Chat Page
 * @public
 */
export const AgenticChatPage = agenticChatPlugin.provide(
  createRoutableExtension({
    name: 'AgenticChatPage',
    component: () =>
      import('./components/AgenticChatPage').then(m => m.AgenticChatPage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Agentic Chat Icon
 * @public
 */
export const AgenticChatIcon: IconComponent = AgenticChatIconComponent;
