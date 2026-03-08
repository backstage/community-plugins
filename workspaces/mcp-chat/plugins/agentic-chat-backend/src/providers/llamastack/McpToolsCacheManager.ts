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

import type { LoggerService } from '@backstage/backend-plugin-api';
import type { AgenticChatStatus } from '../../types';
import { McpProxyService, type McpToolsCache } from './McpProxyService';
import type { ConversationService } from './ConversationService';

/**
 * Manages the MCP tools cache populated from status health checks.
 * Extracts discovered tool names, prunes removed servers, detects conflicts,
 * and syncs proxy mode to ConversationService.
 */
export class McpToolsCacheManager {
  private cache: McpToolsCache = new Map();

  constructor(private readonly logger: LoggerService) {}

  getCache(): McpToolsCache {
    return this.cache;
  }

  /**
   * Extract discovered tool names from status response, populate the cache,
   * and log any tool name conflicts.
   */
  updateFromStatus(
    status: AgenticChatStatus,
    proxyModeEnabled: boolean,
    mcpProxy: McpProxyService | null,
    conversations: ConversationService | null,
  ): void {
    if (!status.mcpServers) return;

    const currentServerIds = new Set(status.mcpServers.map(s => s.id));
    for (const cachedId of this.cache.keys()) {
      if (!currentServerIds.has(cachedId)) {
        this.cache.delete(cachedId);
        this.logger.info(
          `MCP proxy: pruned removed server "${cachedId}" from tools cache`,
        );
      }
    }

    for (const serverStatus of status.mcpServers) {
      if (serverStatus.connected && serverStatus.tools?.length) {
        this.cache.set(
          serverStatus.id,
          serverStatus.tools.map(t => t.name),
        );
      } else if (!serverStatus.connected) {
        this.cache.delete(serverStatus.id);
      }
    }

    const conflictResult = McpProxyService.detectConflicts(this.cache);
    if (conflictResult.conflictingTools.length > 0) {
      this.logger.info(
        `MCP proxy: tool name conflicts detected (handled by namespacing): ${conflictResult.conflictingTools.join(
          ', ',
        )}`,
      );
    }

    if (conversations) {
      conversations.setProxyMode(proxyModeEnabled, mcpProxy ?? undefined);
    }
  }
}
