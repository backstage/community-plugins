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

/**
 * StreamingMessage Component
 *
 * Displays real-time streaming responses from the AI agent,
 * including tool calls, RAG results, and generated text.
 *
 * All colors are derived from branding configuration for enterprise customization.
 */

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { useTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { useBranding } from '../../hooks';
import { CodeBlock } from '../CodeBlock';
import type { BrandingConfig } from '../../types';
import { ReasoningDisplay } from './ReasoningDisplay';
import { sanitizeResponseText, formatResponseText } from '../../utils';
import { StreamingState } from './StreamingMessage.types';
import {
  STREAMING_PHASES,
  PHASE_LABELS,
  PHASE_COLOR_KEYS,
  DEFAULT_PHASE_LABEL,
  DEFAULT_PHASE_COLOR_KEY,
} from './StreamingMessage.constants';
import {
  getContainerSx,
  getAvatarSx,
  getContentContainerSx,
  getMarkdownContentSx,
  getTypingCursorSx,
  StatusColors,
} from './styles';
import { ToolCallDisplay, RAGSearchDisplay } from './ToolCallDisplay';
import { PhaseChip, LoadingIndicator } from './StreamingProgress';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets the color for a phase from branding
 */
function getPhaseColor(phase: string, branding: BrandingConfig): string {
  const colorKey = PHASE_COLOR_KEYS[phase] || DEFAULT_PHASE_COLOR_KEY;
  return branding[colorKey];
}

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeKatex];

const ScrollableTable = (props: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="table-scroll-wrapper">
    <table {...props} />
  </div>
);

const MARKDOWN_COMPONENTS = {
  code: CodeBlock as never,
  table: ScrollableTable as never,
};

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface StreamingMessageProps {
  state: StreamingState;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * StreamingMessage - Displays real-time streaming responses
 *
 * Features:
 * - Animated avatar with phase-based colors (from branding)
 * - RAG search activity display
 * - MCP tool call tracking with arguments and output
 * - Markdown rendering for generated text
 * - Loading states with animated dots
 * - All colors from branding for enterprise customization
 */
export const StreamingMessage: React.FC<StreamingMessageProps> = ({
  state,
}) => {
  const theme = useTheme();
  const { branding } = useBranding();

  // Get phase info from branding colors
  const phaseLabel = PHASE_LABELS[state.phase] || DEFAULT_PHASE_LABEL;
  const phaseColor = getPhaseColor(state.phase, branding);

  const statusColors: StatusColors = useMemo(
    () => ({
      success: branding.successColor,
      error: branding.errorColor,
      primary: branding.primaryColor,
    }),
    [branding.successColor, branding.errorColor, branding.primaryColor],
  );

  const showRAG =
    state.phase === STREAMING_PHASES.SEARCHING ||
    state.filesSearched.length > 0;
  const hasToolCalls = state.toolCalls.length > 0;
  const hasReasoning = !!state.reasoning;
  const isReasoning = state.phase === STREAMING_PHASES.REASONING;
  // Don't show generic loading if we have reasoning content to show
  const showLoading = !state.text && !state.completed && !hasReasoning;

  // Don't render anything during pending_approval phase with no visible content
  // The ToolApprovalDialog will handle the UI
  const isPendingApproval = state.phase === 'pending_approval';
  const hasVisibleContent =
    showRAG || hasToolCalls || state.text || showLoading || hasReasoning;
  if (isPendingApproval && !hasVisibleContent) {
    return null;
  }

  return (
    <Box sx={getContainerSx()}>
      {/* Avatar */}
      <Box sx={getAvatarSx(theme, phaseColor, state.completed)}>
        <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
          >
            {branding.appName}
          </Typography>
          <PhaseChip
            phaseLabel={phaseLabel}
            phaseColor={phaseColor}
            completed={state.completed}
          />
        </Box>

        {/* Content Container - aria-live for screen reader announcements */}
        <Box
          sx={getContentContainerSx(theme)}
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Model Reasoning/Thinking (if available) */}
          {hasReasoning && (
            <ReasoningDisplay
              reasoning={state.reasoning!}
              reasoningDuration={state.reasoningDuration}
              isStreaming={isReasoning}
              theme={theme}
              branding={branding}
            />
          )}

          {/* RAG Search Activity */}
          {showRAG && (
            <Box sx={{ mb: hasToolCalls || state.text ? 2 : 0 }}>
              <RAGSearchDisplay
                filesSearched={state.filesSearched}
                theme={theme}
                branding={branding}
                statusColors={statusColors}
              />
            </Box>
          )}

          {/* MCP Tool Activity */}
          {hasToolCalls && (
            <Box sx={{ mb: state.text ? 2 : 0 }}>
              {state.toolCalls.map((tc, index) => (
                <ToolCallDisplay
                  key={tc.id || index}
                  tc={tc}
                  theme={theme}
                  branding={branding}
                  statusColors={statusColors}
                />
              ))}
            </Box>
          )}

          {/* Text Content with Markdown */}
          {state.text && (
            <Box sx={getMarkdownContentSx(theme)}>
              <ReactMarkdown
                remarkPlugins={REMARK_PLUGINS}
                rehypePlugins={REHYPE_PLUGINS}
                components={MARKDOWN_COMPONENTS}
              >
                {formatResponseText(sanitizeResponseText(state.text))}
              </ReactMarkdown>
              {!state.completed && (
                <Box component="span" sx={getTypingCursorSx()} />
              )}
            </Box>
          )}

          {/* Loading state */}
          {showLoading && (
            <LoadingIndicator phase={state.phase} phaseColor={phaseColor} />
          )}
        </Box>
      </Box>
    </Box>
  );
};
