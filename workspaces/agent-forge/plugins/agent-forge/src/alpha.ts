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

import { createElement } from 'react';
import {
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  compatWrapper,
  convertLegacyRouteRef,
} from '@backstage/core-compat-api';
import { rootRouteRef } from './routes';

const agentForgePage = PageBlueprint.make({
  params: {
    path: '/agent-forge',
    routeRef: convertLegacyRouteRef(rootRouteRef),
    loader: () =>
      import('./components/AgentForgePage').then(m =>
        compatWrapper(createElement(m.default)),
      ),
  },
});

export default createFrontendPlugin({
  pluginId: 'agent-forge',
  extensions: [agentForgePage],
});

export { chatAssistantPlugin as agentForgePlugin } from './plugin';
export { default as AgentForgePage } from './components/AgentForgePage';
export { default as ChatAssistantToken } from './components/ChatAssistantToken';
