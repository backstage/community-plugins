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

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import type { Theme } from '@mui/material/styles';
import { getActionButtonSx, getActionButtonsContainerSx } from './styles';

export interface MessageActionButtonsProps {
  isHovered: boolean;
  copied: boolean;
  onCopy: () => void;
  onRegenerate?: () => void;
  isLastAssistantMessage?: boolean;
  theme: Theme;
}

/**
 * Copy, regenerate, and edit action buttons for AI messages
 */
export function MessageActionButtons({
  isHovered,
  copied,
  onCopy,
  onRegenerate,
  isLastAssistantMessage,
  theme,
}: MessageActionButtonsProps) {
  return (
    <Box sx={getActionButtonsContainerSx(isHovered)}>
      <Tooltip
        title={copied ? 'Copied!' : 'Copy response'}
        arrow
        placement="top"
      >
        <IconButton
          size="small"
          onClick={onCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy response'}
          sx={getActionButtonSx(theme, copied)}
        >
          {copied ? (
            <CheckIcon sx={{ fontSize: 14 }} />
          ) : (
            <ContentCopyIcon sx={{ fontSize: 14 }} />
          )}
        </IconButton>
      </Tooltip>

      {isLastAssistantMessage && onRegenerate && (
        <Tooltip title="Regenerate response" arrow placement="top">
          <IconButton
            size="small"
            onClick={onRegenerate}
            aria-label="Regenerate response"
            sx={getActionButtonSx(theme, false)}
          >
            <RefreshIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
