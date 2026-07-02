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
import { Entity } from '@backstage/catalog-model';
import { mcpCapabilitiesApiRef, McpCapabilitiesClient } from './api';

const isMcpServer = (entity: Entity) =>
  entity.kind === 'API' &&
  (entity.spec as { type?: string } | undefined)?.type === 'mcp-server';

const mcpApi = ApiBlueprint.make({
  name: 'mcp-capabilities',
  params: defineParams =>
    defineParams({
      api: mcpCapabilitiesApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new McpCapabilitiesClient({ discoveryApi, fetchApi }),
    }),
});

const mcpServerOverviewCard = EntityCardBlueprint.make({
  name: 'mcp-server-overview',
  params: {
    filter: isMcpServer,
    loader: async () =>
      import('./components/MCPServerOverviewCard').then(m => (
        <m.MCPServerOverviewCard />
      )),
  },
});

const mcpToolsContent = EntityContentBlueprint.make({
  name: 'mcp-tools',
  params: {
    path: '/mcp-capabilities',
    title: 'Capabilities',
    filter: isMcpServer,
    loader: async () =>
      import('./components/MCPToolsContent').then(m => <m.MCPToolsContent />),
  },
});

/**
 * Frontend plugin that enriches native `mcp-server` API entity pages with an
 * overview card and a live Tools tab.
 *
 * @public
 */
export const mcpCapabilitiesPlugin = createFrontendPlugin({
  pluginId: 'mcp-capabilities',
  extensions: [mcpApi, mcpServerOverviewCard, mcpToolsContent],
});
