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
import { alpha, type Theme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface RightPaneHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  theme: Theme;
}

/**
 * Header with collapse/expand toggle for the right pane sidebar
 */
export function RightPaneHeader({
  sidebarCollapsed,
  onToggleSidebar,
  theme,
}: RightPaneHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1,
        minHeight: 48,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
      }}
    >
      <Tooltip
        title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        placement="left"
      >
        <IconButton
          onClick={onToggleSidebar}
          size="small"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          sx={{
            color: theme.palette.text.secondary,
            transition: 'all 0.2s',
            '&:hover': {
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.action.hover, 0.8),
            },
          }}
        >
          {sidebarCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
