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
  IconComponent,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { mcpChatApiRef } from './api';
import { McpChat } from './api/McpChatApi';
import { BotIconComponent } from './components/BotIcon';

/**
 * MCP Chat plugin.
 @public
 */

export const mcpChatPlugin = createPlugin({
  id: 'mcp-chat',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: mcpChatApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, fetchApi }) =>
        new McpChat({ discoveryApi, fetchApi }),
    }),
  ],
});

/**
 * MCP Chat Page
 * @public
 */
export const McpChatPage = mcpChatPlugin.provide(
  createRoutableExtension({
    name: 'McpChatPage',
    component: () => import('./components/ChatPage').then(m => m.ChatPage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * MCP Chat Icon
 * @public
 */
export const MCPChatIcon: IconComponent = BotIconComponent;
