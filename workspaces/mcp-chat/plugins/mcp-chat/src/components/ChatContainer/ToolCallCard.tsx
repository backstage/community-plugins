/*
 * Copyright 2026 The Backstage Authors
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

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import BuildIcon from '@mui/icons-material/Build';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTheme, type Theme } from '@mui/material/styles';
import { ApprovalStatus, ToolCall } from '../../types';
import { CodeBlock } from './CodeBlock';

function getStatusLabel(decision: ApprovalStatus): string {
  if (decision === 'pending') return 'Awaiting approval for MCP tool';
  if (decision === 'approved') return 'Called MCP tool';
  return 'Rejected MCP tool';
}

function getStateColor(decision: ApprovalStatus, theme: Theme): string {
  if (decision === 'pending') return theme.palette.warning.main;
  if (decision === 'approved') return theme.palette.success.main;
  return theme.palette.error.main;
}

function formatArguments(args: string): string {
  try {
    return JSON.stringify(JSON.parse(args), null, 2);
  } catch {
    return args;
  }
}

interface ToolCallCardHeaderProps {
  decision: ApprovalStatus;
  serverName: string;
  toolCall: ToolCall;
  expanded: boolean;
  setExpanded: (value: ((prev: boolean) => boolean) | boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function ToolCallCardHeader({
  decision,
  serverName,
  toolCall,
  expanded,
  setExpanded,
  onApprove,
  onReject,
}: ToolCallCardHeaderProps) {
  const theme = useTheme();
  const isPending = decision === 'pending';
  const stateColor = getStateColor(decision, theme);
  const statusLabel = getStatusLabel(decision);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        py: 1,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.03)',
        },
      }}
      onClick={() => setExpanded(prev => !prev)}
    >
      <BuildIcon
        fontSize="small"
        sx={{ color: stateColor, mr: 1, fontSize: '1rem' }}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '0.85rem',
          color: theme.palette.text.primary,
          mr: 1,
        }}
      >
        {statusLabel}
      </Typography>
      <Box
        component="code"
        sx={{
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.06)',
          color: theme.palette.text.secondary,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 0.5,
          px: 0.75,
          py: 0.25,
        }}
      >
        {serverName} / {toolCall.function.name}
      </Box>
      <Box sx={{ flex: 1 }} />
      {isPending && (
        <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
          <Tooltip title="Reject" placement="top">
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                setExpanded(false);
                onReject(toolCall.id);
              }}
              aria-label="Reject tool call"
              sx={{
                color: theme.palette.error.main,
                border: `1px solid ${theme.palette.error.main}`,
                borderRadius: 1,
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.error.contrastText,
                },
              }}
            >
              <CloseIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Approve" placement="top">
            <IconButton
              size="small"
              onClick={e => {
                e.stopPropagation();
                setExpanded(false);
                onApprove(toolCall.id);
              }}
              aria-label="Approve tool call"
              sx={{
                color: theme.palette.success.main,
                border: `1px solid ${theme.palette.success.main}`,
                borderRadius: 1,
                width: 28,
                height: 28,
                '&:hover': {
                  backgroundColor: theme.palette.success.main,
                  color: theme.palette.success.contrastText,
                },
              }}
            >
              <CheckIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {!isPending && (
        <Box sx={{ ml: 1 }}>
          {expanded ? (
            <ExpandLessIcon
              fontSize="small"
              sx={{ color: theme.palette.text.secondary }}
            />
          ) : (
            <ExpandMoreIcon
              fontSize="small"
              sx={{ color: theme.palette.text.secondary }}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

interface ToolResultProps {
  toolResult: string;
}

function ToolResult({ toolResult }: ToolResultProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.secondary,
          fontWeight: 600,
          display: 'block',
          mb: 0.5,
        }}
      >
        Result
      </Typography>
      <CodeBlock maxHeight="12em">{toolResult}</CodeBlock>
    </Box>
  );
}

interface ToolCallCardBodyProps {
  expanded: boolean;
  toolCall: ToolCall;
  isApproved: boolean;
  toolResult: string | undefined;
}

function ToolCallCardBody({
  expanded,
  toolCall,
  isApproved,
  toolResult,
}: ToolCallCardBodyProps) {
  const theme = useTheme();

  return (
    <Collapse in={expanded}>
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600,
            display: 'block',
            mb: 0.5,
          }}
        >
          Parameters
        </Typography>
        <CodeBlock maxHeight="12em">
          {formatArguments(toolCall.function.arguments)}
        </CodeBlock>

        {isApproved && toolResult && <ToolResult toolResult={toolResult} />}
      </Box>
    </Collapse>
  );
}

/**
 * @public
 */
export interface ToolCallCardProps {
  toolCall: ToolCall;
  approvalStatus: ApprovalStatus;
  serverName: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  toolResult?: string;
}

/**
 * @public
 */
export function ToolCallCard({
  toolCall,
  approvalStatus,
  serverName,
  onApprove,
  onReject,
  toolResult,
}: ToolCallCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(approvalStatus === 'pending');
  const borderColor = getStateColor(approvalStatus, theme);

  return (
    <Card
      sx={{
        my: 0.5,
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 1,
        backgroundColor:
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(0, 0, 0, 0.02)',
        boxShadow: 'none',
        overflow: 'visible',
      }}
    >
      <ToolCallCardHeader
        decision={approvalStatus}
        serverName={serverName}
        toolCall={toolCall}
        expanded={expanded}
        setExpanded={setExpanded}
        onApprove={onApprove}
        onReject={onReject}
      />

      <ToolCallCardBody
        expanded={expanded}
        toolCall={toolCall}
        isApproved={approvalStatus === 'approved'}
        toolResult={toolResult}
      />
    </Card>
  );
}
