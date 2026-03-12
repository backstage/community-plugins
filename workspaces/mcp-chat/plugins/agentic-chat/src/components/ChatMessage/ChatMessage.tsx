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
import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import TextField from '@mui/material/TextField';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import type { Message, RAGSource } from '../../types';
import { useBranding } from '../../hooks';
import {
  sanitizeResponseText,
  formatResponseText,
  formatRelativeTime,
} from '../../utils';
import { TokenUsageBadge } from '../TokenUsageBadge';
import { CodeBlock } from '../CodeBlock';
import { ReasoningDisplay } from '../StreamingMessage/ReasoningDisplay';
import { ToolCallsSection } from './ToolCallsSection';
import { RAGSourcesSection } from './RAGSourcesSection';
import { ErrorCard } from './ErrorCard';
import {
  getMessageContainerSx,
  getMessageWrapperSx,
  getAvatarSx,
  getMessageLabelSx,
  getMessagePaperSx,
  getMarkdownContentSx,
  getTimestampSx,
  getUserTimestampSx,
} from './styles';
import { useMessageEdit } from './useMessageEdit';
import { MessageActionButtons } from './MessageActionButtons';

const TIMESTAMP_REFRESH_MS = 30_000;

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

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
  onEditMessage?: (messageId: string, newText: string) => void;
  isLastAssistantMessage?: boolean;
}

export const ChatMessage = React.memo(function ChatMessage({
  message,
  onRegenerate,
  onEditMessage,
  isLastAssistantMessage,
}: ChatMessageProps) {
  const theme = useTheme();
  const { branding } = useBranding();
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), TIMESTAMP_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const [isHovered, setIsHovered] = useState(false);
  const {
    isEditing,
    editText,
    setEditText,
    handleStartEdit,
    handleCancelEdit,
    handleSubmitEdit,
    handleEditKeyDown,
  } = useMessageEdit(message.id, message.text, onEditMessage);

  // Use ragSources if available, fallback to filesSearched for backwards compatibility
  const ragSources: RAGSource[] =
    message.ragSources ||
    message.filesSearched?.map(f => ({ filename: f })) ||
    [];
  const hasRAGSources = ragSources.length > 0;
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
  const isError = !message.isUser && !!message.errorCode;

  // Don't render empty assistant messages (e.g., when tool call is pending approval)
  const hasTextContent = message.text && message.text.trim().length > 0;

  // Early return for empty assistant messages (must be after all hooks)
  if (!message.isUser && !hasTextContent && !hasToolCalls && !hasRAGSources) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await window.navigator.clipboard.writeText(message.text);
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available - fail silently
    }
  };

  return (
    <Box
      sx={getMessageContainerSx(message.isUser)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={getMessageWrapperSx(message.isUser)}>
        {/* Avatar */}
        <Box
          role="img"
          aria-label={message.isUser ? 'User avatar' : 'AI assistant avatar'}
          sx={getAvatarSx(theme, message.isUser)}
        >
          {message.isUser ? (
            <PersonIcon sx={{ fontSize: 18 }} />
          ) : (
            <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Message Label */}
          <Typography
            variant="caption"
            sx={getMessageLabelSx(theme, message.isUser)}
          >
            {message.isUser ? 'You' : branding.appName}
          </Typography>

          {/* Message Content */}
          <Box sx={{ position: 'relative' }}>
            <Paper elevation={0} sx={getMessagePaperSx(theme, message.isUser)}>
              {/* Inline edit mode for user messages */}
              {message.isUser && isEditing ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    multiline
                    minRows={1}
                    maxRows={8}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.9rem',
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.5,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={handleCancelEdit}
                      aria-label="Cancel edit"
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleSubmitEdit}
                      aria-label="Submit edit"
                      disabled={
                        !editText.trim() || editText.trim() === message.text
                      }
                      color="primary"
                    >
                      <SendIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  {/* Reasoning / thinking (persisted from streaming) */}
                  {!message.isUser && message.reasoning && (
                    <ReasoningDisplay
                      reasoning={message.reasoning}
                      reasoningDuration={message.reasoningDuration}
                      isStreaming={false}
                      theme={theme}
                      branding={branding}
                    />
                  )}

                  {/* Error card for differentiated error display */}
                  {isError && hasTextContent && (
                    <ErrorCard
                      message={message.text}
                      code={message.errorCode}
                      onRetry={
                        isLastAssistantMessage ? onRegenerate : undefined
                      }
                    />
                  )}

                  {/* Only render text content if there's actual text and not an error */}
                  {!isError && message.text && message.text.trim() && (
                    <Box sx={getMarkdownContentSx(theme, message.isUser)}>
                      <ReactMarkdown
                        remarkPlugins={REMARK_PLUGINS}
                        rehypePlugins={REHYPE_PLUGINS}
                        components={MARKDOWN_COMPONENTS}
                      >
                        {message.isUser
                          ? message.text
                          : formatResponseText(
                              sanitizeResponseText(message.text),
                            )}
                      </ReactMarkdown>
                    </Box>
                  )}

                  {hasToolCalls && (
                    <ToolCallsSection toolCalls={message.toolCalls!} />
                  )}

                  {hasRAGSources && (
                    <RAGSourcesSection ragSources={ragSources} />
                  )}
                </>
              )}
            </Paper>
          </Box>

          {/* Timestamp, Token Usage, and Action Buttons (AI messages) */}
          {!message.isUser && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={getTimestampSx(theme)}>
                  {formatRelativeTime(message.timestamp)}
                </Typography>
                {message.usage && <TokenUsageBadge usage={message.usage} />}
              </Box>

              <MessageActionButtons
                isHovered={isHovered}
                copied={copied}
                onCopy={handleCopy}
                onRegenerate={onRegenerate}
                isLastAssistantMessage={isLastAssistantMessage}
                theme={theme}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* User message timestamp + edit button */}
      {message.isUser && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
            mt: 0.5,
            pr: 1,
          }}
        >
          <Typography variant="caption" sx={getUserTimestampSx(theme)}>
            {formatRelativeTime(message.timestamp)}
          </Typography>
          {onEditMessage && !isEditing && (
            <Tooltip title="Edit message" arrow placement="top">
              <IconButton
                size="small"
                onClick={handleStartEdit}
                aria-label="Edit message"
                sx={{
                  opacity: isHovered ? 0.7 : 0,
                  transition: 'opacity 0.2s',
                  p: 0.3,
                  color: theme.palette.text.secondary,
                  '&:focus': {
                    opacity: 0.7,
                  },
                  '&:hover': {
                    opacity: 1,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
});
