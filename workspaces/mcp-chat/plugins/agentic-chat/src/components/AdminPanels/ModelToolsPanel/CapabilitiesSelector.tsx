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
import { useState, useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import ShieldIcon from '@mui/icons-material/Shield';
import type { AgentCapabilities } from '../../../hooks';
import type { PromptCapabilities } from '../../../types';
import { McpToolsSection } from './McpToolsSection';

interface Props {
  capabilities: AgentCapabilities;
  onChange: (selected: PromptCapabilities) => void;
  disabled?: boolean;
}

export function CapabilitiesSelector({
  capabilities,
  onChange,
  disabled,
}: Props) {
  const [webSearch, setWebSearch] = useState(capabilities.enableWebSearch);
  const [codeInterpreter, setCodeInterpreter] = useState(
    capabilities.enableCodeInterpreter,
  );
  const [selectedTools, setSelectedTools] = useState<Set<string>>(
    () => new Set(capabilities.mcpTools.map(t => `${t.serverId}::${t.name}`)),
  );
  const [ragEnabled, setRagEnabled] = useState(capabilities.ragEnabled);
  const [safetyEnabled, setSafetyEnabled] = useState(
    capabilities.safetyEnabled,
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const prevCapsRef = useRef(capabilities);
  useEffect(() => {
    const prev = prevCapsRef.current;
    const isInitialMount = prev === capabilities;
    if (!isInitialMount) {
      prevCapsRef.current = capabilities;
      setWebSearch(capabilities.enableWebSearch);
      setCodeInterpreter(capabilities.enableCodeInterpreter);
      setSelectedTools(
        new Set(capabilities.mcpTools.map(t => `${t.serverId}::${t.name}`)),
      );
      setRagEnabled(capabilities.ragEnabled);
      setSafetyEnabled(capabilities.safetyEnabled);
    }

    const allToolKeys = new Set(
      capabilities.mcpTools.map(t => `${t.serverId}::${t.name}`),
    );
    onChangeRef.current({
      enableWebSearch: capabilities.enableWebSearch,
      enableCodeInterpreter: capabilities.enableCodeInterpreter,
      tools: capabilities.mcpTools
        .filter(t => allToolKeys.has(`${t.serverId}::${t.name}`))
        .map(t => ({
          name: t.name,
          description: t.description,
          serverLabel: t.serverLabel,
        })),
      ragEnabled: capabilities.ragEnabled,
      vectorStoreNames: capabilities.ragEnabled
        ? capabilities.vectorStoreNames
        : [],
      safetyEnabled: capabilities.safetyEnabled,
      safetyShields: capabilities.safetyEnabled
        ? capabilities.safetyShields
        : [],
    });
  }, [capabilities]);

  const emitChange = useCallback(
    (
      overrides: Partial<{
        ws: boolean;
        ci: boolean;
        tools: Set<string>;
        rag: boolean;
        safety: boolean;
      }>,
    ) => {
      const ws = overrides.ws ?? webSearch;
      const ci = overrides.ci ?? codeInterpreter;
      const tools = overrides.tools ?? selectedTools;
      const rag = overrides.rag ?? ragEnabled;
      const safety = overrides.safety ?? safetyEnabled;

      const selectedMcpTools = capabilities.mcpTools.filter(t =>
        tools.has(`${t.serverId}::${t.name}`),
      );

      const result: PromptCapabilities = {
        enableWebSearch: ws,
        enableCodeInterpreter: ci,
        tools: selectedMcpTools.map(t => ({
          name: t.name,
          description: t.description,
          serverLabel: t.serverLabel,
        })),
        ragEnabled: rag,
        vectorStoreNames: rag ? capabilities.vectorStoreNames : [],
        safetyEnabled: safety,
        safetyShields: safety ? capabilities.safetyShields : [],
      };
      onChange(result);
    },
    [
      webSearch,
      codeInterpreter,
      selectedTools,
      ragEnabled,
      safetyEnabled,
      capabilities,
      onChange,
    ],
  );

  const toggleTool = (key: string) => {
    setSelectedTools(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      emitChange({ tools: next });
      return next;
    });
  };

  const hasAnyCapability =
    capabilities.enableWebSearch ||
    capabilities.enableCodeInterpreter ||
    capabilities.mcpTools.length > 0 ||
    capabilities.mcpServers.length > 0 ||
    capabilities.ragEnabled ||
    capabilities.safetyEnabled;

  if (!hasAnyCapability) {
    return (
      <Box sx={{ py: 1 }}>
        <Typography variant="caption" color="text.secondary">
          No tools or capabilities detected. Configure tools, MCP servers, or
          knowledge base in the other tabs to enrich instruction generation.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Include in generated instructions
      </Typography>

      {/* Built-in tools */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {capabilities.enableWebSearch && (
          <Chip
            icon={<TravelExploreIcon />}
            label="Web Search"
            size="small"
            variant={webSearch ? 'filled' : 'outlined'}
            color={webSearch ? 'primary' : 'default'}
            onClick={() => {
              const next = !webSearch;
              setWebSearch(next);
              emitChange({ ws: next });
            }}
            disabled={disabled}
          />
        )}
        {capabilities.enableCodeInterpreter && (
          <Chip
            icon={<CodeIcon />}
            label="Code Interpreter"
            size="small"
            variant={codeInterpreter ? 'filled' : 'outlined'}
            color={codeInterpreter ? 'primary' : 'default'}
            onClick={() => {
              const next = !codeInterpreter;
              setCodeInterpreter(next);
              emitChange({ ci: next });
            }}
            disabled={disabled}
          />
        )}
        {capabilities.ragEnabled && (
          <Chip
            icon={<StorageIcon />}
            label={`Vector RAG (${capabilities.vectorStoreNames.length} store${
              capabilities.vectorStoreNames.length !== 1 ? 's' : ''
            })`}
            size="small"
            variant={ragEnabled ? 'filled' : 'outlined'}
            color={ragEnabled ? 'primary' : 'default'}
            onClick={() => {
              const next = !ragEnabled;
              setRagEnabled(next);
              emitChange({ rag: next });
            }}
            disabled={disabled}
          />
        )}
        {capabilities.safetyEnabled && (
          <Chip
            icon={<ShieldIcon />}
            label="Safety Shields"
            size="small"
            variant={safetyEnabled ? 'filled' : 'outlined'}
            color={safetyEnabled ? 'secondary' : 'default'}
            onClick={() => {
              const next = !safetyEnabled;
              setSafetyEnabled(next);
              emitChange({ safety: next });
            }}
            disabled={disabled}
          />
        )}
      </Box>

      {/* MCP servers & tools section */}
      {capabilities.mcpServers.length > 0 && (
        <McpToolsSection
          capabilities={capabilities}
          selectedTools={selectedTools}
          onToolToggle={toggleTool}
          disabled={disabled}
        />
      )}
    </Box>
  );
}
