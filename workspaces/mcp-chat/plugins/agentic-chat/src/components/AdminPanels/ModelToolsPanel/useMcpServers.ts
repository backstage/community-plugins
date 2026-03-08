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
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { agenticChatApiRef } from '../../../api';
import { asStringArray, normalizeErrorMessage } from '../../../utils';
import { useAdminConfig, useStatus } from '../../../hooks';
import type { MCPServerStatus, McpTestConnectionResult } from '../../../types';
import type { McpServer } from './mcpServerTypes';

const EMPTY_SERVER: McpServer = {
  id: '',
  name: '',
  type: 'streamable-http',
  url: '',
};

function normalizeServerType(type: unknown): 'streamable-http' | 'sse' {
  return type === 'sse' ? 'sse' : 'streamable-http';
}

function normalizeApproval(raw: unknown): 'always' | 'never' | undefined {
  return raw === 'always' || raw === 'never' ? raw : undefined;
}

function normalizeServer(s: Record<string, unknown>): McpServer {
  const approval = normalizeApproval(s.requireApproval);
  return {
    id: String(s.id ?? ''),
    name: String(s.name ?? ''),
    type: normalizeServerType(s.type),
    url: String(s.url ?? ''),
    ...(s.headers &&
    typeof s.headers === 'object' &&
    Object.keys(s.headers as object).length > 0
      ? { headers: s.headers as Record<string, string> }
      : {}),
    ...(asStringArray(s.allowedTools).length > 0
      ? { allowedTools: asStringArray(s.allowedTools) }
      : {}),
    ...(approval ? { requireApproval: approval } : {}),
  };
}

export interface UseMcpServersProps {
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
}

export function useMcpServers({
  effectiveConfig,
  onConfigSaved,
}: UseMcpServersProps) {
  const api = useApi(agenticChatApiRef);
  const config = useAdminConfig('mcpServers');
  const disabledConfig = useAdminConfig('disabledMcpServerIds');
  const { status, loading: statusLoading } = useStatus();

  const effectiveServers = useMemo(
    () =>
      (
        (effectiveConfig?.mcpServers as
          | Record<string, unknown>[]
          | undefined) ?? []
      ).map(normalizeServer),
    [effectiveConfig?.mcpServers],
  );

  const statusMap = useMemo(() => {
    const map = new Map<string, MCPServerStatus>();
    for (const s of status?.mcpServers ?? []) {
      map.set(s.id, s);
    }
    return map;
  }, [status?.mcpServers]);

  const yamlServerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of status?.mcpServers ?? []) {
      if (s.source === 'yaml') ids.add(s.id);
    }
    return ids;
  }, [status?.mcpServers]);

  const yamlServers = useMemo(
    () => effectiveServers.filter(s => yamlServerIds.has(s.id)),
    [effectiveServers, yamlServerIds],
  );

  const [adminServers, setAdminServers] = useState<McpServer[]>([]);
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<McpServer>({ ...EMPTY_SERVER });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [testResult, setTestResult] = useState<McpTestConnectionResult | null>(
    null,
  );
  const [testing, setTesting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const overriddenYamlIds = useMemo(
    () =>
      new Set(adminServers.filter(s => yamlServerIds.has(s.id)).map(s => s.id)),
    [adminServers, yamlServerIds],
  );

  const pureAdminServers = useMemo(
    () => adminServers.filter(s => !yamlServerIds.has(s.id)),
    [adminServers, yamlServerIds],
  );

  useEffect(() => {
    if (
      initialized ||
      config.loading ||
      disabledConfig.loading ||
      statusLoading
    ) {
      return;
    }
    if (config.entry && Array.isArray(config.entry.configValue)) {
      setAdminServers(
        (config.entry.configValue as Record<string, unknown>[]).map(
          normalizeServer,
        ),
      );
    } else {
      const adminOnly = effectiveServers.filter(s => !yamlServerIds.has(s.id));
      setAdminServers(adminOnly);
    }
    if (
      disabledConfig.entry &&
      Array.isArray(disabledConfig.entry.configValue)
    ) {
      setDisabledIds(new Set(asStringArray(disabledConfig.entry.configValue)));
    }
    setInitialized(true);
  }, [
    initialized,
    config.loading,
    config.entry,
    disabledConfig.loading,
    disabledConfig.entry,
    statusLoading,
    effectiveServers,
    yamlServerIds,
  ]);

  const handleSave = useCallback(async () => {
    try {
      await config.save(adminServers);
      if (disabledIds.size > 0) {
        await disabledConfig.save(Array.from(disabledIds));
      } else {
        await disabledConfig.reset();
      }
      setToast('MCP servers saved');
      onConfigSaved?.();
    } catch (err) {
      setToast(`Save failed: ${normalizeErrorMessage(err, 'Unknown error')}`);
    }
  }, [adminServers, config, disabledIds, disabledConfig, onConfigSaved]);

  const handleReset = useCallback(async () => {
    try {
      await config.reset();
      await disabledConfig.reset();
      setAdminServers([]);
      setDisabledIds(new Set());
      setInitialized(false);
      setToast('All overrides cleared — using YAML config only');
    } catch (err) {
      setToast(`Reset failed: ${normalizeErrorMessage(err, 'Unknown error')}`);
    }
  }, [config, disabledConfig]);

  const handleTestConnection = useCallback(async () => {
    if (!draft.url.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await api.testMcpConnection(
        draft.url.trim(),
        draft.type,
        draft.headers,
      );
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        error: normalizeErrorMessage(err, 'Test failed'),
      });
    } finally {
      setTesting(false);
    }
  }, [api, draft.url, draft.type, draft.headers]);

  const validateUrl = useCallback((raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'URL must start with http:// or https://';
      }
      return null;
    } catch {
      return 'Invalid URL format';
    }
  }, []);

  const openAddDialog = useCallback(() => {
    setDraft({ ...EMPTY_SERVER });
    setEditingId(null);
    setTestResult(null);
    setUrlError(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((server: McpServer) => {
    setDraft({ ...server, type: normalizeServerType(server.type) });
    setEditingId(server.id);
    setTestResult(null);
    setUrlError(null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingId(null);
    setTestResult(null);
  }, []);

  const handleDialogSubmit = useCallback(() => {
    const trimmedId = draft.id.trim();
    if (!trimmedId || !draft.url.trim()) return;

    const newServer: McpServer = {
      id: trimmedId,
      name: draft.name.trim() || trimmedId,
      type: draft.type,
      url: draft.url.trim(),
      ...(draft.headers && Object.keys(draft.headers).length > 0
        ? { headers: draft.headers }
        : {}),
      ...(draft.allowedTools && draft.allowedTools.length > 0
        ? { allowedTools: draft.allowedTools }
        : {}),
      ...(draft.requireApproval === 'always'
        ? { requireApproval: 'always' as const }
        : {}),
    };

    if (editingId) {
      setAdminServers(prev => {
        const exists = prev.some(s => s.id === editingId);
        if (exists) {
          return prev.map(s => (s.id === editingId ? newServer : s));
        }
        return [...prev, newServer];
      });
    } else {
      const allIds = new Set([
        ...adminServers.map(s => s.id),
        ...Array.from(yamlServerIds),
      ]);
      if (allIds.has(trimmedId)) {
        setToast(`Server ID "${trimmedId}" already exists`);
        return;
      }
      setAdminServers(prev => [...prev, newServer]);
    }

    setDraft({ ...EMPTY_SERVER });
    setEditingId(null);
    setDialogOpen(false);
  }, [draft, editingId, adminServers, yamlServerIds]);

  const handleRemoveAdmin = useCallback((id: string) => {
    setAdminServers(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleToggleDisable = useCallback((id: string) => {
    setDisabledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleUrlChange = useCallback(
    (val: string) => {
      setTestResult(null);
      setUrlError(validateUrl(val));
    },
    [validateUrl],
  );

  const isEditing = editingId !== null;
  const draftValid = isEditing
    ? draft.url.trim() !== '' && !urlError
    : draft.id.trim() !== '' && draft.url.trim() !== '' && !urlError;

  const totalTools = (status?.mcpServers ?? []).reduce(
    (sum, s) => sum + (s.toolCount ?? 0),
    0,
  );
  const connectedCount = (status?.mcpServers ?? []).filter(
    s => s.connected,
  ).length;
  const totalCount = (status?.mcpServers ?? []).length;
  const hasChanges = config.source === 'database' || disabledIds.size > 0;
  const showYamlOverrideInfo =
    isEditing && editingId !== null && yamlServerIds.has(editingId);

  return {
    servers: {
      yamlServers,
      pureAdminServers,
      adminServers,
      statusMap,
      overriddenYamlIds,
      disabledIds,
    },
    config: {
      loading: config.loading || disabledConfig.loading,
      saving: config.saving,
      error: config.error,
      source: config.source,
    },
    section: {
      hasChanges,
      totalTools,
      connectedCount,
      totalCount,
    },
    actions: {
      handleSave,
      handleReset,
      handleTestConnection,
      validateUrl,
      openAddDialog,
      openEditDialog,
      handleDialogSubmit,
      handleRemoveAdmin,
      handleToggleDisable,
      closeDialog,
      handleUrlChange,
      setDraft,
      setToast,
      clearTestResult: useCallback(() => setTestResult(null), []),
    },
    ui: {
      draft,
      dialogOpen,
      editingId,
      toast,
      testResult,
      testing,
      urlError,
      isEditing,
      draftValid,
      showYamlOverrideInfo,
    },
  };
}
