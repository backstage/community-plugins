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

import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTheme } from '@mui/material/styles';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { agenticChatAccessPermission } from '@backstage-community/plugin-agentic-chat-common';
import type { BrandingConfig } from '@backstage-community/plugin-agentic-chat-common';
import type { SecurityMode } from '../../types';

export interface SecurityGateProps {
  securityLoading: boolean;
  backendReady: boolean | null;
  configurationErrors: string[];
  securityMode: SecurityMode | null;
  branding: BrandingConfig;
  children: ReactNode;
}

/**
 * Handles security/permission gating for the agentic chat page:
 * - Loading spinner when configs/permissions are loading
 * - Config error page display
 * - Permission gate wrapping (RequirePermission) in plugin-only/full modes
 */
export function SecurityGate({
  securityLoading,
  backendReady,
  configurationErrors,
  securityMode,
  branding,
  children,
}: SecurityGateProps) {
  const theme = useTheme();

  if (securityLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          minHeight: 0,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show configuration error page if backend is not ready
  if (backendReady === false && configurationErrors.length > 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          minHeight: 0,
          p: 4,
          maxWidth: 700,
          mx: 'auto',
        }}
      >
        <WarningAmberIcon
          sx={{
            fontSize: 64,
            color: theme.palette.warning.main,
            mb: 2,
          }}
        />
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          Configuration Required
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{ mb: 3, textAlign: 'center' }}
        >
          {branding.appName} is not properly configured. Please fix the
          following issues:
        </Typography>
        <Box sx={{ width: '100%' }}>
          {configurationErrors.map(err => (
            <Alert key={err} severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Configuration Error</AlertTitle>
              {err}
            </Alert>
          ))}
        </Box>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          After updating your configuration, restart the backend server.
        </Typography>
      </Box>
    );
  }

  // In 'none' mode, don't require any permissions
  if (securityMode === 'none') {
    return <>{children}</>;
  }

  // In 'plugin-only' or 'full' modes, require the permission
  return (
    <RequirePermission
      permission={agenticChatAccessPermission}
      errorPage={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            minHeight: 0,
            textAlign: 'center',
            p: 4,
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{ maxWidth: 500 }}
          >
            You do not have permission to access {branding.appName}. Please
            contact your administrator to request access.
          </Typography>
        </Box>
      }
    >
      {children}
    </RequirePermission>
  );
}
