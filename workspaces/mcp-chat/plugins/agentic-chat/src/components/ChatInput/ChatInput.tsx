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

import React, { useMemo, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import StopIcon from '@mui/icons-material/Stop';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { createChatInputStyles } from './styles';

/**
 * Props for the ChatInput component
 */
export interface ChatInputProps {
  /** Current input value */
  value: string;
  /** Callback when input value changes */
  onChange: (value: string) => void;
  /** Callback when send button is clicked or Enter is pressed */
  onSend: () => void;
  /** Callback when stop button is clicked */
  onStop: () => void;
  /** Callback when new chat button is clicked */
  onNewChat?: () => void;
  /** Callback when a file is selected for upload */
  onFileSelect?: (file: File) => void;
  /** Currently attached file (pending upload) */
  attachedFile?: File | null;
  /** Callback to clear the attached file */
  onClearFile?: () => void;
  /** Placeholder text for the input */
  placeholder: string;
  /** Whether the AI is currently generating a response */
  isTyping: boolean;
  /** Whether to show the new chat button */
  showNewChatButton?: boolean;
  /** Whether file upload is enabled */
  enableFileUpload?: boolean;
  /** Ref to the underlying textarea for programmatic focus */
  inputRef?: React.Ref<HTMLTextAreaElement>;
}

/**
 * ChatInput - Premium glassmorphism input component for the chat interface
 * Handles text input, send/stop buttons, and new chat button
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  onNewChat,
  onFileSelect,
  attachedFile,
  onClearFile,
  placeholder,
  isTyping,
  showNewChatButton = false,
  enableFileUpload = false,
  inputRef,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = useMemo(
    () => createChatInputStyles(theme, isTyping),
    [theme, isTyping],
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && onFileSelect) {
        onFileSelect(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFileSelect],
  );

  const hasValue = value.trim().length > 0;

  return (
    <Box sx={styles.container}>
      <Box sx={styles.centeredWrapper}>
        <Box sx={styles.inputRow}>
          {/* New Chat Button */}
          {onNewChat && showNewChatButton && (
            <Tooltip title="New conversation (⌘⇧O)" placement="top">
              <span>
                <IconButton
                  onClick={onNewChat}
                  disabled={isTyping}
                  aria-label="Start new conversation"
                  sx={styles.newChatButton}
                >
                  <AddIcon sx={styles.newChatIcon} />
                </IconButton>
              </span>
            </Tooltip>
          )}

          {/* Input Pill */}
          <Box sx={styles.inputPill}>
            {/* Hidden file input */}
            {enableFileUpload && onFileSelect && (
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt,.pdf,.json,.yaml,.yml"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-hidden="true"
              />
            )}

            {/* File attachment button */}
            {enableFileUpload && onFileSelect && !isTyping && (
              <Tooltip title="Attach file" placement="top">
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                  sx={{
                    p: 0.5,
                    color: theme.palette.text.secondary,
                    flexShrink: 0,
                    '&:hover': { color: theme.palette.text.primary },
                  }}
                >
                  <AttachFileIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              {/* Attached file indicator */}
              {attachedFile && (
                <Chip
                  label={attachedFile.name}
                  size="small"
                  onDelete={onClearFile}
                  sx={{
                    alignSelf: 'flex-start',
                    mb: 0.5,
                    maxWidth: '100%',
                    fontSize: '0.75rem',
                    height: 24,
                  }}
                />
              )}
              <TextField
                sx={styles.textField}
                placeholder={placeholder}
                variant="outlined"
                multiline
                minRows={1}
                maxRows={8}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                fullWidth
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                inputRef={inputRef}
                inputProps={{
                  'aria-label': 'Chat message input',
                }}
              />
            </Box>

            {isTyping ? (
              <IconButton
                sx={styles.stopButton}
                onClick={onStop}
                title="Stop generation"
                aria-label="Stop message generation"
              >
                <StopIcon sx={{ fontSize: 18 }} />
              </IconButton>
            ) : (
              <IconButton
                sx={styles.createSendButton(hasValue)}
                onClick={onSend}
                disabled={!hasValue}
                aria-label="Send message"
              >
                <SendIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
