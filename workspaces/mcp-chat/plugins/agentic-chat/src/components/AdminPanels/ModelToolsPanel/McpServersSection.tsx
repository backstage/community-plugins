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
import { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import { AdminSection } from '../shared/AdminSection';
import type { McpServer } from './mcpServerTypes';
import { McpServerCard } from './McpServerCard';
import { McpServerFormDialog } from './McpServerFormDialog';
import { useMcpServers } from './useMcpServers';
import { useAdminConfig } from '../../../hooks';

interface Props {
  effectiveConfig?: Record<string, unknown> | null;
  onConfigSaved?: () => void;
}

export const McpServersSection = ({
  effectiveConfig,
  onConfigSaved,
}: Props) => {
  const { servers, config, section, actions, ui } = useMcpServers({
    effectiveConfig,
    onConfigSaved,
  });

  const proxyConfig = useAdminConfig('mcpProxyUrl');
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxyInitialized, setProxyInitialized] = useState(false);
  const [proxyUrlError, setProxyUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (!proxyInitialized && !proxyConfig.loading) {
      const dbValue = proxyConfig.entry?.configValue as string | undefined;
      setProxyUrl(dbValue ?? '');
      setProxyInitialized(true);
    }
  }, [proxyInitialized, proxyConfig.loading, proxyConfig.entry]);

  const validateProxyUrl = useCallback((url: string): string | null => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'Must use http:// or https://';
      }
    } catch {
      return 'Must be a valid URL';
    }
    if (url.endsWith('/')) {
      return 'Must not end with a trailing slash';
    }
    return null;
  }, []);

  const handleProxyUrlChange = useCallback(
    (value: string) => {
      setProxyUrl(value);
      setProxyUrlError(validateProxyUrl(value));
    },
    [validateProxyUrl],
  );

  const handleProxySave = useCallback(async () => {
    if (proxyUrlError) return;
    try {
      if (proxyUrl) {
        await proxyConfig.save(proxyUrl);
      } else {
        await proxyConfig.reset();
      }
      onConfigSaved?.();
    } catch {
      // Error state is handled by useAdminConfig's mutationError
    }
  }, [proxyUrl, proxyUrlError, proxyConfig, onConfigSaved]);

  const handleProxyReset = useCallback(async () => {
    try {
      await proxyConfig.reset();
      setProxyUrl('');
      setProxyInitialized(false);
    } catch {
      // Error state is handled by useAdminConfig's mutationError
    }
  }, [proxyConfig]);

  if (config.loading || proxyConfig.loading) return null;

  const {
    yamlServers,
    pureAdminServers,
    adminServers,
    statusMap,
    overriddenYamlIds,
    disabledIds,
  } = servers;

  const { hasChanges, totalTools, connectedCount, totalCount } = section;

  const {
    handleSave,
    handleReset,
    handleTestConnection,
    openAddDialog,
    openEditDialog,
    handleDialogSubmit,
    handleRemoveAdmin,
    handleToggleDisable,
    closeDialog,
    handleUrlChange,
    setDraft,
    setToast,
    clearTestResult,
  } = actions;

  const {
    draft,
    dialogOpen,
    toast,
    testResult,
    testing,
    urlError,
    isEditing,
    draftValid,
    showYamlOverrideInfo,
  } = ui;

  return (
    <>
      <AdminSection
        title="MCP Proxy URL"
        description="URL where LlamaStack can reach the Backstage backend for MCP proxy routing. Required when LlamaStack runs on a remote server."
        source={proxyConfig.source}
        saving={proxyConfig.saving}
        error={proxyConfig.error}
        onSave={handleProxySave}
        onReset={
          proxyConfig.source === 'database' ? handleProxyReset : undefined
        }
        saveDisabled={!!proxyUrlError}
      >
        <TextField
          fullWidth
          size="small"
          label="MCP Proxy URL"
          placeholder="https://my-backstage.example.com/api/agentic-chat"
          value={proxyUrl}
          onChange={e => handleProxyUrlChange(e.target.value)}
          error={!!proxyUrlError}
          helperText={
            proxyUrlError ?? 'Overrides the proxyBaseUrl from app-config.yaml'
          }
          InputProps={{
            endAdornment: proxyUrl ? (
              <IconButton
                size="small"
                onClick={() => handleProxyUrlChange('')}
                edge="end"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : undefined,
          }}
        />
      </AdminSection>

      <AdminSection
        title="MCP Servers"
        description={
          totalCount > 0
            ? `${connectedCount}/${totalCount} connected · ${totalTools} tool${
                totalTools !== 1 ? 's' : ''
              } available`
            : 'Configure Model Context Protocol servers for tool use.'
        }
        source={config.source}
        saving={config.saving}
        error={config.error}
        onSave={handleSave}
        onReset={hasChanges ? handleReset : undefined}
      >
        {/* YAML Servers */}
        {yamlServers.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                display: 'block',
                mb: 0.75,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              YAML Configured ({yamlServers.length})
            </Typography>
            {yamlServers.map((s: McpServer) => {
              const disabled = disabledIds.has(s.id);
              const overridden = overriddenYamlIds.has(s.id);
              const display = overridden
                ? adminServers.find(a => a.id === s.id) ?? s
                : s;
              return (
                <McpServerCard
                  key={s.id}
                  server={display}
                  statusInfo={disabled ? undefined : statusMap.get(s.id)}
                  isYaml
                  isOverridden={overridden}
                  isDisabled={disabled}
                  onEdit={() => openEditDialog(display)}
                  onDisable={() => handleToggleDisable(s.id)}
                />
              );
            })}
          </Box>
        )}

        {/* Admin-Added Servers */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              display: 'block',
              mb: 0.75,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Admin Added ({pureAdminServers.length})
          </Typography>

          {pureAdminServers.length > 0 ? (
            pureAdminServers.map(s => (
              <McpServerCard
                key={s.id}
                server={s}
                statusInfo={statusMap.get(s.id)}
                isYaml={false}
                onEdit={() => openEditDialog(s)}
                onRemove={() => handleRemoveAdmin(s.id)}
              />
            ))
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mb: 1, fontStyle: 'italic' }}
            >
              No additional servers. Click &quot;Add Server&quot; to add one.
            </Typography>
          )}
        </Box>

        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
          sx={{ mt: 1 }}
        >
          Add Server
        </Button>
      </AdminSection>

      <McpServerFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        draft={draft}
        setDraft={setDraft}
        isEditing={isEditing}
        testResult={testResult}
        testing={testing}
        onTestConnection={handleTestConnection}
        onUrlChange={handleUrlChange}
        onClearTestResult={clearTestResult}
        urlError={urlError}
        onSubmit={handleDialogSubmit}
        draftValid={draftValid}
        showYamlOverrideInfo={showYamlOverrideInfo}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};
