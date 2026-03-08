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
import { useTheme, alpha } from '@mui/material/styles';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import type { BrandingConfig } from '@backstage-community/plugin-agentic-chat-common';

export interface AdminOnboardingCardProps {
  branding: BrandingConfig;
  onStartChat: () => void;
  onOpenAdmin: () => void;
}

export const AdminOnboardingCard = ({
  branding: _branding,
  onStartChat,
  onOpenAdmin,
}: AdminOnboardingCardProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.background.default, 0.6),
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          mx: 2,
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          overflow: 'hidden',
        }}
      >
        {/* Card header */}
        <Box sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <AdminPanelSettingsIcon
                sx={{
                  fontSize: 20,
                  color: theme.palette.primary.main,
                }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.0625rem',
                color: theme.palette.text.primary,
              }}
            >
              Welcome, Admin
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
            }}
          >
            You have administrative access. How would you like to start?
          </Typography>
        </Box>

        {/* Option cards */}
        <Box sx={{ px: 3, pb: 1.5 }}>
          {/* Option 1: Continue to Chat */}
          <Box
            onClick={onStartChat}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onStartChat();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              mb: 1,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                flexShrink: 0,
              }}
            >
              <ChatBubbleOutlineIcon
                sx={{
                  fontSize: 17,
                  color: theme.palette.success.main,
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: theme.palette.text.primary,
                  mb: 0.25,
                }}
              >
                Continue to Chat
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  lineHeight: 1.3,
                }}
              >
                Use the AI assistant for conversations
              </Typography>
            </Box>
          </Box>

          {/* Option 2: Open Command Center */}
          <Box
            onClick={onOpenAdmin}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onOpenAdmin();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                flexShrink: 0,
              }}
            >
              <AdminPanelSettingsIcon
                sx={{
                  fontSize: 17,
                  color: theme.palette.primary.main,
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: theme.palette.text.primary,
                  mb: 0.25,
                }}
              >
                Open Command Center
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.75rem',
                  lineHeight: 1.3,
                }}
              >
                Manage knowledge base, prompts & settings
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer hint */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
            backgroundColor: alpha(theme.palette.action.hover, 0.3),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.text.secondary, 0.7),
              fontSize: '0.6875rem',
              lineHeight: 1.5,
            }}
          >
            You can switch between modes anytime using the Command Center button
            in the sidebar.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
