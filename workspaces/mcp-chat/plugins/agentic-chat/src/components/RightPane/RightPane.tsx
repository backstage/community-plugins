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
import { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, alpha } from '@mui/material/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { ConversationHistory } from '../ConversationHistory';
import { RightPaneHeader } from './RightPaneHeader';
import { CollapsedSidebar } from './CollapsedSidebar';
import { useStatus } from '../../hooks';
import { AgentInfoSection } from './AgentInfoSection';

interface RightPaneProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onSelectSession?: (sessionId: string, adminView?: boolean) => void;
  onActiveSessionDeleted?: () => void;
  activeSessionId?: string;
  refreshTrigger?: number;
  isAdmin?: boolean;
  onAdminClick?: () => void;
}

export const RightPane = ({
  sidebarCollapsed,
  onToggleSidebar,
  onSelectSession,
  onActiveSessionDeleted,
  activeSessionId,
  refreshTrigger,
  isAdmin = false,
  onAdminClick,
}: RightPaneProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { status, loading } = useStatus();
  const isDark = theme.palette.mode === 'dark';
  const [agentExpanded, setAgentExpanded] = useState(false);

  const providerConnected = status?.provider.connected ?? false;
  const overallReady = !loading && providerConnected;

  const panelContent = (
    <Box
      sx={{
        // eslint-disable-next-line no-nested-ternary
        width: isMobile ? '300px' : sidebarCollapsed ? '56px' : '340px',
        backgroundColor: theme.palette.background.default,
        borderLeft: isMobile
          ? 'none'
          : `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        display: 'flex',
        flexDirection: 'column',
        transition: isMobile ? 'none' : 'width 0.3s ease',
        ...(!isMobile && {
          position: 'absolute' as const,
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
        }),
        height: isMobile ? '100%' : undefined,
        overflow: 'hidden',
        // eslint-disable-next-line no-nested-ternary
        boxShadow: isMobile
          ? 'none'
          : isDark
          ? '-2px 0 8px rgba(0,0,0,0.2)'
          : '-2px 0 8px rgba(0,0,0,0.05)',
      }}
    >
      {/* Header */}
      <RightPaneHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        theme={theme}
      />

      {/* Expanded Content */}
      {!sidebarCollapsed && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Conversation History -- single scroll owner is inside ConversationHistory */}
          <Box
            sx={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              p: 2,
            }}
          >
            <ConversationHistory
              onSelectSession={onSelectSession || (() => {})}
              onActiveSessionDeleted={onActiveSessionDeleted}
              activeSessionId={activeSessionId}
              refreshTrigger={refreshTrigger}
              isAdmin={isAdmin}
            />
          </Box>

          {/* Admin Command Center — sidebar footer */}
          {isAdmin && onAdminClick && (
            <Box
              onClick={onAdminClick}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') onAdminClick();
              }}
              aria-label="Open Command Center"
              sx={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mx: 1.5,
                mb: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                cursor: 'pointer',
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                transition: 'all 0.15s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  borderColor: alpha(theme.palette.primary.main, 0.25),
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              <AdminPanelSettingsIcon
                sx={{
                  fontSize: 17,
                  color: theme.palette.primary.main,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  lineHeight: 1,
                  flex: 1,
                }}
              >
                Command Center
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.625rem',
                  color: alpha(theme.palette.primary.main, 0.6),
                  lineHeight: 1,
                }}
              >
                Admin
              </Typography>
            </Box>
          )}

          {/* Agent Info — flat status list */}
          <AgentInfoSection
            expanded={agentExpanded}
            onToggleExpanded={() => setAgentExpanded(prev => !prev)}
          />
        </Box>
      )}

      {/* Collapsed State */}
      {sidebarCollapsed && (
        <CollapsedSidebar
          overallReady={overallReady}
          loading={loading}
          theme={theme}
          isAdmin={isAdmin}
          onAdminClick={onAdminClick}
        />
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="right"
        open={!sidebarCollapsed}
        onClose={onToggleSidebar}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        {panelContent}
      </Drawer>
    );
  }

  return panelContent;
};
