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
import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import type { ProviderCapabilities } from '@backstage-community/plugin-agentic-chat-common';
import { useEffectiveConfig, useProviders } from '../../../hooks';
import { ProviderSelector } from '../ProviderSelector';
import { ProviderPlaceholder } from '../ProviderPlaceholder';
import { ModelConnectionSection } from './ModelConnectionSection';
import { SystemPromptSection } from './SystemPromptSection';
import { ToolsSection } from './ToolsSection';
import { McpServersSection } from './McpServersSection';
import { SafetyEvalPanel } from '../SafetyEvalPanel/SafetyEvalPanel';
import { EvaluationSection } from '../SafetyEvalPanel/EvaluationSection';
import { KnowledgeBasePanel } from '../KnowledgeBasePanel';

type SubTab =
  | 'connection'
  | 'prompt'
  | 'tools'
  | 'mcp'
  | 'safety'
  | 'evaluation'
  | 'knowledge';

interface TabDef {
  readonly label: string;
  readonly value: SubTab;
  readonly capability?: keyof ProviderCapabilities;
}

const ALL_TABS: readonly TabDef[] = [
  { label: 'Model', value: 'connection' },
  { label: 'Tools', value: 'tools' },
  { label: 'MCP Servers', value: 'mcp', capability: 'mcpTools' },
  { label: 'RAG', value: 'knowledge', capability: 'rag' },
  { label: 'Safety', value: 'safety', capability: 'safety' },
  { label: 'Evals', value: 'evaluation', capability: 'evaluation' },
  { label: 'Agent Instructions', value: 'prompt' },
] as const;

const CONTENT_SX = { px: 3, py: 2, maxWidth: 960, mx: 'auto' } as const;

const HEADER_OUTER_SX = { px: 3, pt: 3, maxWidth: 960, mx: 'auto' } as const;

const HEADER_ROW_SX = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 2,
  mb: 1.5,
} as const;

const TABS_SX = {
  minHeight: 40,
  '& .MuiTab-root': {
    minHeight: 40,
    textTransform: 'none',
    fontSize: '0.8125rem',
    minWidth: 'auto',
    px: 2,
    mr: 0.5,
  },
} as const;

export const AgentConfigPanel = () => {
  const [activeTab, setActiveTab] = useState<SubTab>('connection');
  const {
    config: effectiveConfig,
    loading: ecLoading,
    refresh: refreshConfig,
  } = useEffectiveConfig();
  const {
    providers,
    activeProviderId,
    activeProvider,
    switchProvider,
    loading: provLoading,
  } = useProviders();

  const providerName = activeProvider?.displayName ?? 'Agent Platform';

  const visibleTabs = useMemo(
    () =>
      ALL_TABS.filter(
        t => !t.capability || activeProvider?.capabilities[t.capability],
      ),
    [activeProvider],
  );

  const handleTabChange = useCallback(
    (_: unknown, v: string) => {
      setActiveTab(v as SubTab);
      refreshConfig();
    },
    [refreshConfig],
  );

  if (ecLoading || provLoading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (activeProvider && !activeProvider.implemented) {
    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={HEADER_OUTER_SX}>
          <Box sx={HEADER_ROW_SX}>
            <Typography variant="h5">Agent Config</Typography>
            <ProviderSelector
              providers={providers}
              activeProviderId={activeProviderId}
              onSwitch={switchProvider}
            />
          </Box>
        </Box>
        <ProviderPlaceholder provider={activeProvider} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={HEADER_OUTER_SX}>
        <Box sx={HEADER_ROW_SX}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Agent Config
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Configure your AI agent's model, behavior, safety, and RAG
              pipelines.
            </Typography>
          </Box>
          <ProviderSelector
            providers={providers}
            activeProviderId={activeProviderId}
            onSwitch={switchProvider}
          />
        </Box>
      </Box>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 1,
          maxWidth: 960,
          mx: 'auto',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={TABS_SX}
        >
          {visibleTabs.map(t => (
            <Tab key={t.value} label={t.label} value={t.value} />
          ))}
        </Tabs>
      </Box>

      {activeTab === 'connection' && (
        <Box sx={CONTENT_SX}>
          <ModelConnectionSection
            effectiveConfig={effectiveConfig}
            onConfigSaved={refreshConfig}
            providerName={providerName}
          />
        </Box>
      )}
      {activeTab === 'tools' && (
        <Box sx={CONTENT_SX}>
          <ToolsSection
            effectiveConfig={effectiveConfig}
            onConfigSaved={refreshConfig}
          />
        </Box>
      )}
      {activeTab === 'mcp' && (
        <Box sx={CONTENT_SX}>
          <McpServersSection
            effectiveConfig={effectiveConfig}
            onConfigSaved={refreshConfig}
          />
        </Box>
      )}
      {activeTab === 'knowledge' && <KnowledgeBasePanel />}
      {activeTab === 'safety' && (
        <SafetyEvalPanel
          effectiveConfig={effectiveConfig}
          onConfigSaved={refreshConfig}
          providerName={providerName}
        />
      )}
      {activeTab === 'evaluation' && (
        <Box sx={CONTENT_SX}>
          <EvaluationSection
            effectiveConfig={effectiveConfig}
            onConfigSaved={refreshConfig}
            providerName={providerName}
          />
        </Box>
      )}
      {activeTab === 'prompt' && (
        <Box sx={CONTENT_SX}>
          <SystemPromptSection
            effectiveConfig={effectiveConfig}
            onConfigSaved={refreshConfig}
          />
        </Box>
      )}
    </Box>
  );
};
