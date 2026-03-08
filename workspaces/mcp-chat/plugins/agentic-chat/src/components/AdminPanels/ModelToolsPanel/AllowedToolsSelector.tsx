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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import type { McpServer } from './mcpServerTypes';

export interface AllowedToolsSelectorProps {
  /** List of tools from test connection */
  tools: { name: string; description?: string }[];
  /** Current draft - allowedTools comes from here */
  draft: McpServer;
  /** Update the draft */
  setDraft: Dispatch<SetStateAction<McpServer>>;
}

export function AllowedToolsSelector({
  tools,
  draft,
  setDraft,
}: AllowedToolsSelectorProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Allowed Tools
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {draft.allowedTools?.length
            ? `${draft.allowedTools.length} of ${tools.length} selected`
            : `All ${tools.length} tools enabled`}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ display: 'block', mb: 1 }}
      >
        Select specific tools to reduce token usage. Leave unchecked to send all
        tools.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 0.5,
          mb: 1,
        }}
      >
        <Button
          size="small"
          variant="text"
          onClick={() =>
            setDraft(prev => ({
              ...prev,
              allowedTools: tools.map(t => t.name),
            }))
          }
        >
          Select All
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={() =>
            setDraft(prev => {
              const { allowedTools: _, ...rest } = prev;
              return rest as McpServer;
            })
          }
        >
          Clear Selection
        </Button>
      </Box>
      <Box
        sx={{
          maxHeight: 240,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {tools.map(tool => {
          const checked = draft.allowedTools?.includes(tool.name) ?? false;
          return (
            <FormControlLabel
              key={tool.name}
              sx={{
                ml: 0,
                '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' },
              }}
              control={
                <Checkbox
                  size="small"
                  checked={checked}
                  onChange={() => {
                    setDraft(prev => {
                      const current = prev.allowedTools ?? [];
                      const next = checked
                        ? current.filter(n => n !== tool.name)
                        : [...current, tool.name];
                      if (next.length === 0) {
                        const { allowedTools: _, ...rest } = prev;
                        return rest as McpServer;
                      }
                      return { ...prev, allowedTools: next };
                    });
                  }}
                />
              }
              label={
                <Tooltip
                  title={tool.description || 'No description'}
                  placement="right"
                >
                  <Box component="span">{tool.name}</Box>
                </Tooltip>
              }
            />
          );
        })}
      </Box>
    </Box>
  );
}
