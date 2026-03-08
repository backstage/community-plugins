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
import { useMemo } from 'react';
import type { MCPServerStatus } from '../types';

/**
 * A discovered MCP tool with its server context.
 */
export interface DiscoveredTool {
  name: string;
  description?: string;
  serverLabel: string;
  serverId: string;
}

/**
 * An MCP server that is configured (from effective config) regardless of
 * whether it is currently connected.  Used so the capabilities selector
 * can list servers even when they are temporarily offline.
 */
export interface ConfiguredMcpServer {
  id: string;
  name: string;
  connected: boolean;
  tools: DiscoveredTool[];
}

/**
 * All capabilities derived from the agent's configuration and live status.
 * Merges effective config (what's configured) with live status (what's connected).
 */
export interface AgentCapabilities {
  model: string;
  enableWebSearch: boolean;
  enableCodeInterpreter: boolean;
  mcpTools: DiscoveredTool[];
  mcpServers: ConfiguredMcpServer[];
  ragEnabled: boolean;
  vectorStoreNames: string[];
  safetyEnabled: boolean;
  safetyShields: string[];
  evaluationEnabled: boolean;
}

interface CfgMcpServer {
  id: string;
  name?: string;
  url?: string;
}

/**
 * Derives a unified AgentCapabilities from the effective config and live status.
 *
 * Sources:
 * - effectiveConfig.mcpServers → configured servers (always shown)
 * - mcpServers (from status) → live tools for connected servers
 * - effectiveConfig.vectorStoreName / vectorStoreIds → RAG
 * - effectiveConfig.enableWebSearch / enableCodeInterpreter → built-in tools
 */
export function useAgentCapabilities(
  effectiveConfig: Record<string, unknown> | null | undefined,
  mcpServers: MCPServerStatus[] | undefined,
): AgentCapabilities {
  return useMemo(() => {
    const cfg = effectiveConfig ?? {};

    // Build a lookup of live server status (connected + tools)
    const liveById = new Map<string, MCPServerStatus>();
    if (mcpServers) {
      for (const s of mcpServers) liveById.set(s.id, s);
    }

    // Merge configured servers with live status
    const configuredServers =
      (cfg.mcpServers as CfgMcpServer[] | undefined) ?? [];
    const seenIds = new Set<string>();
    const allServers: ConfiguredMcpServer[] = [];
    const allTools: DiscoveredTool[] = [];

    for (const cfgServer of configuredServers) {
      seenIds.add(cfgServer.id);
      const live = liveById.get(cfgServer.id);
      const label = cfgServer.name || cfgServer.id;
      const connected = live?.connected ?? false;
      const tools: DiscoveredTool[] = [];

      if (live?.connected && live.tools) {
        for (const t of live.tools) {
          tools.push({
            name: t.name,
            description: t.description,
            serverLabel: label,
            serverId: cfgServer.id,
          });
        }
      }

      allServers.push({ id: cfgServer.id, name: label, connected, tools });
      allTools.push(...tools);
    }

    // Include any live servers not in config (e.g. added dynamically)
    if (mcpServers) {
      for (const live of mcpServers) {
        if (seenIds.has(live.id)) continue;
        const label = live.name || live.id;
        const tools: DiscoveredTool[] = [];
        if (live.connected && live.tools) {
          for (const t of live.tools) {
            tools.push({
              name: t.name,
              description: t.description,
              serverLabel: label,
              serverId: live.id,
            });
          }
        }
        allServers.push({
          id: live.id,
          name: label,
          connected: live.connected,
          tools,
        });
        allTools.push(...tools);
      }
    }

    const inputShields = (cfg.inputShields as string[] | undefined) ?? [];
    const outputShields = (cfg.outputShields as string[] | undefined) ?? [];

    // RAG: check both vectorStoreIds and vectorStoreName
    const storeIds = Array.isArray(cfg.vectorStoreIds)
      ? (cfg.vectorStoreIds as string[])
      : [];
    const storeName = (cfg.vectorStoreName as string) || '';
    const hasRag = storeIds.length > 0 || storeName.length > 0;
    let storeNames: string[];
    if (storeIds.length > 0) {
      storeNames = storeIds;
    } else if (storeName) {
      storeNames = [storeName];
    } else {
      storeNames = [];
    }

    return {
      model: (cfg.model as string) || '',
      enableWebSearch: Boolean(cfg.enableWebSearch),
      enableCodeInterpreter: Boolean(cfg.enableCodeInterpreter),
      mcpTools: allTools,
      mcpServers: allServers,
      ragEnabled: hasRag,
      vectorStoreNames: storeNames,
      safetyEnabled: Boolean(cfg.safetyEnabled),
      safetyShields: [...inputShields, ...outputShields],
      evaluationEnabled: Boolean(cfg.evaluationEnabled),
    };
  }, [effectiveConfig, mcpServers]);
}
