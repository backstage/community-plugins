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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export interface CollapsedSidebarProps {
  overallReady: boolean;
  loading: boolean;
  theme: Theme;
  isAdmin: boolean;
  onAdminClick?: () => void;
}

/**
 * Collapsed state of the right pane sidebar - shows status indicator and admin button
 */
export function CollapsedSidebar({
  overallReady,
  loading,
  theme,
  isAdmin,
  onAdminClick,
}: CollapsedSidebarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 1,
        pt: 2,
        flex: 1,
      }}
    >
      <Tooltip
        title={`Agent: ${overallReady ? 'Ready' : 'Offline'}`}
        placement="left"
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: (() => {
              if (loading) return theme.palette.warning.main;
              if (overallReady) return theme.palette.success.main;
              return theme.palette.error.main;
            })(),
            boxShadow: `0 0 8px ${alpha(
              overallReady
                ? theme.palette.success.main
                : theme.palette.error.main,
              0.6,
            )}`,
            cursor: 'help',
          }}
        />
      </Tooltip>

      {/* Admin icon in collapsed strip */}
      {isAdmin && onAdminClick && (
        <Box sx={{ mt: 'auto', mb: 1 }}>
          <Tooltip title="Command Center" placement="left">
            <IconButton
              size="small"
              onClick={onAdminClick}
              aria-label="Open Command Center"
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.16),
                },
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}
