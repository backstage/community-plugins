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

import { useCallback, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import { useTheme, alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export interface ToolArgumentsEditorState {
  editedArguments: string;
  isValidJson: boolean;
  showEditor: boolean;
}

export interface ToolArgumentsEditorProps {
  toolName: string;
  parsedArguments: Record<string, unknown>;
  approvalId: string;
  onEditedChange: (state: ToolArgumentsEditorState) => void;
}

/**
 * ToolArgumentsEditor - Displays and optionally edits tool call arguments
 *
 * Features:
 * - Read-only formatted display of parsed arguments
 * - Toggle to show JSON editor
 * - Editable textarea with JSON validation feedback
 */
export function ToolArgumentsEditor({
  toolName,
  parsedArguments,
  approvalId,
  onEditedChange,
}: ToolArgumentsEditorProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [showEditor, setShowEditor] = useState(false);
  const [editedArguments, setEditedArguments] = useState(
    JSON.stringify(parsedArguments ?? {}, null, 2),
  );
  const [isValidJson, setIsValidJson] = useState(true);

  useEffect(() => {
    setEditedArguments(JSON.stringify(parsedArguments ?? {}, null, 2));
    setIsValidJson(true);
    setShowEditor(false);
  }, [approvalId, parsedArguments]);

  useEffect(() => {
    onEditedChange({ editedArguments, isValidJson, showEditor });
  }, [editedArguments, isValidJson, showEditor, onEditedChange]);

  const handleArgumentsChange = useCallback((value: string) => {
    setEditedArguments(value);
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  }, []);

  return (
    <Box
      sx={{
        bgcolor: alpha(theme.palette.background.default, isDark ? 0.6 : 0.8),
        borderRadius: 2,
        p: 1.5,
        mb: 1.5,
        border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.5 : 0.8)}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            color: isDark
              ? theme.palette.primary.light
              : theme.palette.primary.main,
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {toolName}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setShowEditor(!showEditor)}
          aria-label={showEditor ? 'Hide editor' : 'Edit arguments'}
          sx={{
            ml: 'auto',
            width: 24,
            height: 24,
            color: theme.palette.text.disabled,
            '&:hover': {
              bgcolor: alpha(theme.palette.action.active, 0.05),
              color: theme.palette.text.secondary,
            },
          }}
        >
          {showEditor ? (
            <ExpandLessIcon sx={{ fontSize: 16 }} />
          ) : (
            <EditIcon sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      </Box>

      {/* Arguments display - read-only */}
      <Collapse in={!showEditor}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {Object.entries(parsedArguments ?? {}).map(([key, value]) => (
            <Box
              key={key}
              sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.disabled,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.75rem',
                  minWidth: '70px',
                }}
              >
                {key}:
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.primary,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 500,
                  fontSize: '0.72rem',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>

      {/* Arguments editor */}
      <Collapse in={showEditor}>
        <TextField
          multiline
          fullWidth
          minRows={3}
          maxRows={8}
          value={editedArguments}
          onChange={e => handleArgumentsChange(e.target.value)}
          error={!isValidJson}
          helperText={!isValidJson ? 'Invalid JSON' : 'Edit JSON'}
          size="small"
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              fontSize: '0.8rem',
              bgcolor: alpha(theme.palette.background.default, 0.4),
            },
          }}
        />
      </Collapse>
    </Box>
  );
}
