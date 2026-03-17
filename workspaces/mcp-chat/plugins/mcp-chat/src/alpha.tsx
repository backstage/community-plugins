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
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { mcpChatApiRef } from './api';
import { McpChat } from './api/McpChatApi';
import { BotIconComponent } from './components/BotIcon';
import { rootRouteRef } from './routes';

/**
 * MCP Chat Api
 * @public
 */
const mcpChatApi = ApiBlueprint.make({
  params: defineParams =>
    defineParams({
      api: mcpChatApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new McpChat({ discoveryApi, fetchApi }),
    }),
});

/**
 * MCP Chat Page
 * @public
 */
const mcpChatPage = PageBlueprint.make({
  params: {
    path: '/mcp-chat',
    loader: () => import('./components/ChatPage').then(m => <m.ChatPage />),
    routeRef: rootRouteRef,
  },
});

/**
 * MCP Chat Nav Item
 * @public
 */
const mcpChatNavItem = NavItemBlueprint.make({
  params: {
    title: 'MCP Chat',
    icon: BotIconComponent,
    routeRef: rootRouteRef,
  },
});

/**
 * MCP Chat plugin.
 @public
 */
const mcpChatPlugin = createFrontendPlugin({
  pluginId: 'mcp-chat',
  extensions: [mcpChatApi, mcpChatPage, mcpChatNavItem],
  routes: {
    root: rootRouteRef,
  },
});

export default mcpChatPlugin;
