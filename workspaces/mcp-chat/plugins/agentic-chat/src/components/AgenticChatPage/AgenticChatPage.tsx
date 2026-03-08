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
import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useTheme, alpha } from '@mui/material/styles';
import { Content, Page, ErrorBoundary } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { ChatContainer, type ChatContainerRef } from '../ChatContainer';
import { RightPane } from '../RightPane';
import { agenticChatApiRef } from '../../api';
import {
  useBranding,
  useChatSessions,
  useStatus,
  useBackendStatus,
  useAdminView,
} from '../../hooks';
import { injectBrandingStyles } from '../../theme/branding';
import { AgenticChatErrorBoundary } from './AgenticChatErrorBoundary';
import { AdminOnboardingCard } from './AdminOnboardingCard';
import { SwitchSessionDialog } from './SwitchSessionDialog';
import { SecurityGate } from './SecurityGate';
import { CommandCenterHeader } from './CommandCenterHeader';
import { ProviderOfflineBanner } from './ProviderOfflineBanner';
import { AgentConfigPanel, BrandingPanel } from '../AdminPanels';

const AgenticChatPageContent = () => {
  const theme = useTheme();
  const { branding } = useBranding();

  useEffect(() => {
    injectBrandingStyles(branding);
  }, [branding]);

  const api = useApi(agenticChatApiRef);
  const [rightPaneCollapsed, setRightPaneCollapsed] = useState(true);
  const chatContainerRef = useRef<ChatContainerRef>(null);

  const {
    activeSessionId,
    messages,
    loadingConversation,
    sessionRefreshTrigger,
    switchDialogOpen,
    error,
    setError,
    handleNewChat,
    handleMessagesChange,
    handleSessionCreated,
    guardedSelectSession,
    handleSwitchConfirm,
    handleSwitchCancel,
  } = useChatSessions({
    api,
    chatContainerRef,
  });

  // Backend status (security mode, readiness, config errors, admin flag)
  const {
    securityMode,
    securityLoading,
    backendReady,
    configurationErrors,
    isAdmin,
  } = useBackendStatus();

  // Admin view state (chat vs admin mode, panel, banner)
  const {
    viewMode,
    adminPanel,
    setAdminPanel,
    showAdminBanner,
    switchToAdmin,
    switchToChat,
    dismissAdminBanner,
  } = useAdminView({ isAdmin });

  // Continuous status polling (30s interval) for detecting model going offline
  const {
    status: liveStatus,
    loading: statusPollLoading,
    error: statusPollError,
  } = useStatus();

  const toggleRightPane = () => {
    setRightPaneCollapsed(!rightPaneCollapsed);
  };

  // After the initial load succeeds, detect if the AI provider goes offline.
  // This triggers a persistent warning banner so the user doesn't discover the
  // problem only when they try to send a message.
  const providerOffline =
    !securityLoading &&
    !statusPollLoading &&
    backendReady !== false &&
    (liveStatus?.provider.connected === false ||
      (statusPollError !== null && !liveStatus));

  return (
    <Page themeId="tool">
      <Content noPadding stretch>
        <SecurityGate
          securityLoading={securityLoading}
          backendReady={backendReady}
          configurationErrors={configurationErrors}
          securityMode={securityMode}
          branding={branding}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              backgroundColor: theme.palette.background.default,
              overflow: 'hidden',
            }}
          >
            {/* ============================================= */}
            {/* COMMAND CENTER MODE                           */}
            {/* ============================================= */}
            {viewMode === 'admin' && (
              <>
                <CommandCenterHeader
                  adminPanel={adminPanel}
                  onAdminPanelChange={setAdminPanel}
                  onBackToChat={switchToChat}
                />

                {/* Admin Panel Content — position-based containment guarantees
                    the scroll region is bounded even if the flex height chain
                    from Backstage/RHDH is incomplete. */}
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      overflow: 'auto',
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${alpha(
                        theme.palette.primary.main,
                        0.2,
                      )} transparent`,
                      '&::-webkit-scrollbar': {
                        width: 5,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        borderRadius: 3,
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.35,
                          ),
                        },
                      },
                    }}
                  >
                    {adminPanel === 'agent' && <AgentConfigPanel />}
                    {adminPanel === 'branding' && <BrandingPanel />}
                  </Box>
                </Box>
              </>
            )}

            {/* ============================================= */}
            {/* CHAT MODE                                     */}
            {/* ============================================= */}
            {viewMode === 'chat' && (
              <>
                {/* Chat Content Area — position-based containment guarantees
                    ChatContainer's messages scroll area gets a bounded height,
                    even if the flex chain from Backstage/RHDH is incomplete. */}
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      overflow: 'hidden',
                    }}
                  >
                    {loadingConversation && (
                      <LinearProgress
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          height: 2,
                        }}
                      />
                    )}

                    <ProviderOfflineBanner
                      show={providerOffline}
                      loadingConversation={loadingConversation}
                      statusPollError={statusPollError !== null}
                      appName={branding.appName}
                    />

                    <ErrorBoundary>
                      <ChatContainer
                        ref={chatContainerRef}
                        rightPaneCollapsed={rightPaneCollapsed}
                        messages={messages}
                        onMessagesChange={handleMessagesChange}
                        onNewChat={handleNewChat}
                        onSessionCreated={handleSessionCreated}
                        loadingConversation={loadingConversation}
                      />

                      <RightPane
                        sidebarCollapsed={rightPaneCollapsed}
                        onToggleSidebar={toggleRightPane}
                        onSelectSession={guardedSelectSession}
                        onActiveSessionDeleted={handleNewChat}
                        activeSessionId={activeSessionId}
                        refreshTrigger={sessionRefreshTrigger}
                        isAdmin={isAdmin}
                        onAdminClick={switchToAdmin}
                      />
                    </ErrorBoundary>

                    {/* First-time admin onboarding card */}
                    {isAdmin && showAdminBanner && (
                      <AdminOnboardingCard
                        branding={branding}
                        onStartChat={dismissAdminBanner}
                        onOpenAdmin={switchToAdmin}
                      />
                    )}

                    {/* Error toast */}
                    <Snackbar
                      open={!!error}
                      autoHideDuration={8000}
                      onClose={() => setError(null)}
                      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                      <Alert
                        severity="error"
                        variant="filled"
                        onClose={() => setError(null)}
                        sx={{ width: '100%' }}
                      >
                        {error}
                      </Alert>
                    </Snackbar>

                    {/* Streaming-in-progress switch confirmation */}
                    <SwitchSessionDialog
                      open={switchDialogOpen}
                      onConfirm={handleSwitchConfirm}
                      onCancel={handleSwitchCancel}
                    />
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </SecurityGate>
      </Content>
    </Page>
  );
};

export const AgenticChatPage = () => (
  <AgenticChatErrorBoundary>
    <AgenticChatPageContent />
  </AgenticChatErrorBoundary>
);
