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
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import { useTheme, alpha } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export interface ChatScrollAreaProps {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  showScrollFab: boolean;
  onScrollToBottom: () => void;
  children: React.ReactNode;
}

/**
 * Scrollable message area with scroll-to-bottom FAB.
 */
export function ChatScrollArea({
  scrollContainerRef,
  messagesEndRef,
  onScroll,
  showScrollFab,
  onScrollToBottom,
  children,
}: ChatScrollAreaProps) {
  const theme = useTheme();

  return (
    <Box
      ref={scrollContainerRef}
      onScroll={onScroll}
      sx={{
        flex: 1,
        overflow: 'auto',
        overscrollBehavior: 'contain',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        scrollbarWidth: 'thin',
        scrollbarColor: `${alpha(theme.palette.primary.main, 0.2)} transparent`,
        '&::-webkit-scrollbar': {
          width: 5,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          borderRadius: 3,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.35),
          },
        },
      }}
    >
      {children}

      <div ref={messagesEndRef} />

      <Zoom in={showScrollFab}>
        <Fab
          size="small"
          color="default"
          aria-label="Scroll to bottom"
          onClick={onScrollToBottom}
          sx={{
            position: 'sticky',
            bottom: 16,
            alignSelf: 'center',
            zIndex: 10,
            opacity: 0.85,
            boxShadow: theme.shadows[4],
            '&:hover': { opacity: 1 },
          }}
        >
          <KeyboardArrowDownIcon />
        </Fab>
      </Zoom>
    </Box>
  );
}
