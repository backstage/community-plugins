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
import type { Dispatch, SetStateAction } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import type { McpTestConnectionResult } from '../../../types';
import type { McpServer } from './mcpServerTypes';
import { AllowedToolsSelector } from './AllowedToolsSelector';

function testResultSeverity(
  result: McpTestConnectionResult,
): 'error' | 'warning' | 'success' {
  if (!result.success) return 'error';
  if (result.warning) return 'warning';
  return 'success';
}

function testResultMessage(result: McpTestConnectionResult): string {
  if (!result.success) return result.error || 'Connection failed';
  if (result.warning) return result.warning;
  const count = result.toolCount ?? 0;
  return `Connected successfully — ${count} tool${
    count !== 1 ? 's' : ''
  } discovered`;
}

export interface McpServerFormDialogProps {
  open: boolean;
  onClose: () => void;
  draft: McpServer;
  setDraft: Dispatch<SetStateAction<McpServer>>;
  isEditing: boolean;
  testResult: McpTestConnectionResult | null;
  testing: boolean;
  onTestConnection: () => void;
  onUrlChange: (val: string) => void;
  onClearTestResult: () => void;
  urlError: string | null;
  onSubmit: () => void;
  draftValid: boolean;
  showYamlOverrideInfo: boolean;
}

export function McpServerFormDialog({
  open,
  onClose,
  draft,
  setDraft,
  isEditing,
  testResult,
  testing,
  onTestConnection,
  onUrlChange,
  onClearTestResult,
  urlError,
  onSubmit,
  draftValid,
  showYamlOverrideInfo,
}: McpServerFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit MCP Server' : 'Add MCP Server'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Server ID"
            size="small"
            value={draft.id}
            onChange={e => setDraft(prev => ({ ...prev, id: e.target.value }))}
            placeholder="e.g. my-mcp-server"
            required
            disabled={isEditing}
            helperText={isEditing ? 'ID cannot be changed' : undefined}
          />
          <TextField
            label="Display Name"
            size="small"
            value={draft.name}
            onChange={e =>
              setDraft(prev => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. My MCP Server"
          />
          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mb: 0.5, display: 'block' }}
            >
              Server Type
            </Typography>
            <ToggleButtonGroup
              value={draft.type}
              exclusive
              onChange={(_, val) => {
                if (val)
                  setDraft(prev => ({
                    ...prev,
                    type: val as McpServer['type'],
                  }));
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value="streamable-http">
                streamable-http
              </ToggleButton>
              <ToggleButton value="sse">sse</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <TextField
            label="URL"
            size="small"
            value={draft.url}
            onChange={e => {
              const val = e.target.value;
              setDraft(prev => ({ ...prev, url: val }));
              onUrlChange(val);
              onClearTestResult();
            }}
            placeholder="e.g. http://localhost:3000/mcp"
            required
            error={!!urlError}
            helperText={urlError}
          />
          <TextField
            label="Bearer Token (optional)"
            size="small"
            type="password"
            value={
              draft.headers?.Authorization?.replace(/^Bearer\s+/i, '') ?? ''
            }
            onChange={e => {
              const raw = e.target.value.trim().replace(/^Bearer\s+/i, '');
              setDraft(prev => {
                if (!raw) {
                  const { Authorization: _, ...rest } = prev.headers ?? {};
                  const remaining =
                    Object.keys(rest).length > 0 ? rest : undefined;
                  return { ...prev, headers: remaining };
                }
                return {
                  ...prev,
                  headers: {
                    ...(prev.headers ?? {}),
                    Authorization: `Bearer ${raw}`,
                  },
                };
              });
              onClearTestResult();
            }}
            placeholder="Leave blank if no auth required"
            helperText="Token sent as Authorization: Bearer header"
          />

          <Box>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mb: 0.5, display: 'block' }}
            >
              Tool Approval (HITL)
            </Typography>
            <ToggleButtonGroup
              value={draft.requireApproval ?? 'never'}
              exclusive
              onChange={(_, val) => {
                if (val)
                  setDraft(prev => ({
                    ...prev,
                    requireApproval: val as 'always' | 'never',
                  }));
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value="never">Auto-execute</ToggleButton>
              <ToggleButton value="always">Require Approval</ToggleButton>
            </ToggleButtonGroup>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ mt: 0.5, display: 'block' }}
            >
              Require Approval pauses each tool call for human confirmation
              before executing.
            </Typography>
          </Box>

          {/* Test connection button */}
          <Button
            size="small"
            variant="outlined"
            onClick={onTestConnection}
            disabled={!draft.url.trim() || testing}
            startIcon={testing ? <CircularProgress size={16} /> : undefined}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>

          {/* Test result */}
          {testResult && (
            <Alert
              severity={testResultSeverity(testResult)}
              sx={{ fontSize: '0.8125rem' }}
            >
              {testResultMessage(testResult)}
              {testResult.success &&
                !testResult.warning &&
                testResult.tools &&
                testResult.tools.length > 0 && (
                  <Box
                    sx={{
                      mt: 0.75,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.5,
                    }}
                  >
                    {testResult.tools.map(t => (
                      <Chip
                        key={t.name}
                        label={t.name}
                        size="small"
                        variant="outlined"
                        sx={{
                          '&.MuiChip-root': { fontSize: '0.7rem', height: 22 },
                        }}
                      />
                    ))}
                  </Box>
                )}
            </Alert>
          )}

          {/* Allowed Tools filter — shown after a successful test with tools */}
          {testResult?.success &&
            !testResult.warning &&
            testResult.tools &&
            testResult.tools.length > 0 && (
              <AllowedToolsSelector
                tools={testResult.tools}
                draft={draft}
                setDraft={setDraft}
              />
            )}

          {showYamlOverrideInfo && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ fontSize: '0.8125rem' }}
            >
              This server is defined in YAML. Your changes will be stored as an
              admin override. Authentication config from YAML is preserved.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={!draftValid}>
          {isEditing ? 'Save Changes' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
