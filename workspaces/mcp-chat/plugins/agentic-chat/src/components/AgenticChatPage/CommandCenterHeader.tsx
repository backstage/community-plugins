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
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PaletteIcon from '@mui/icons-material/Palette';
import { useTheme, alpha } from '@mui/material/styles';
import type { AdminPanel } from '../../hooks';

export interface CommandCenterHeaderProps {
  adminPanel: AdminPanel;
  onAdminPanelChange: (panel: AdminPanel) => void;
  onBackToChat: () => void;
}

/**
 * Command center header with title, back button, and admin sub-tabs.
 */
export function CommandCenterHeader({
  adminPanel,
  onAdminPanelChange,
  onBackToChat,
}: CommandCenterHeaderProps) {
  const theme = useTheme();

  return (
    <>
      {/* Command Center Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          flexShrink: 0,
          minHeight: 48,
        }}
      >
        <AdminPanelSettingsIcon
          sx={{
            fontSize: 22,
            color: theme.palette.primary.main,
          }}
        />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: theme.palette.text.primary,
            flex: 1,
          }}
        >
          Command Center
        </Typography>
        <Button
          size="small"
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={onBackToChat}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.action.hover, 0.8),
            },
          }}
        >
          Back to Chat
        </Button>
      </Box>

      {/* Command Center Sub-tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: theme.palette.background.paper,
          flexShrink: 0,
        }}
      >
        <Tabs
          value={adminPanel}
          onChange={(_, v) => onAdminPanelChange(v as AdminPanel)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontSize: '0.875rem',
              minWidth: 'auto',
              px: 2,
              mr: 0.5,
            },
          }}
        >
          <Tab
            icon={<PsychologyIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Agent Config"
            value="agent"
          />
          <Tab
            icon={<PaletteIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Branding"
            value="branding"
          />
        </Tabs>
      </Box>
    </>
  );
}
