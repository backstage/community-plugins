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
import Tooltip from '@mui/material/Tooltip';
import CloudIcon from '@mui/icons-material/Cloud';
import type { ConfigStatus } from '../../api/McpChatApi';
import { useTheme } from '@mui/material/styles';

interface ProviderConnectionStatus {
  connected: boolean;
  models?: string[];
  error?: string;
  loading: boolean;
}

interface ProviderStatusProps {
  configStatus: ConfigStatus | null;
  providerConnectionStatus: ProviderConnectionStatus;
}

export const ProviderStatus = ({
  configStatus,
  providerConnectionStatus,
}: ProviderStatusProps) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const isError =
    providerConnectionStatus.connected === false &&
    !providerConnectionStatus.loading;

  // Helper functions to avoid nested ternary expressions
  const getBoxBackgroundColor = () => {
    if (isError) {
      return isDarkMode ? '#2e1e1e' : '#fff5f5';
    }
    return isDarkMode ? '#2a2a2a' : '#f8f9fa';
  };

  const getBorderColor = () => {
    if (isError) {
      return isDarkMode ? '#4a2c2c' : '#fed7d7';
    }
    return theme.palette.divider;
  };

  const getStatusColor = () => {
    if (providerConnectionStatus.loading) return '#ff9800';
    if (providerConnectionStatus.connected) return '#2e7d32';
    return '#d32f2f';
  };

  const getStatusBackgroundColor = () => {
    if (providerConnectionStatus.loading) {
      return isDarkMode ? '#2d2316' : '#fff8e1';
    }
    if (providerConnectionStatus.connected) {
      return isDarkMode ? '#1e2e1e' : '#e8f5e8';
    }
    return isDarkMode ? '#2e1e1e' : '#ffebee';
  };

  const getStatusBorderColor = () => {
    if (providerConnectionStatus.loading) return '#ffcc02';
    if (providerConnectionStatus.connected) return '#4caf50';
    return '#f44336';
  };

  const getStatusText = () => {
    if (providerConnectionStatus.loading) return 'Testing...';
    if (providerConnectionStatus.connected) return 'Connected';
    return 'Disconnected';
  };

  const getTooltipTitle = () => {
    if (providerConnectionStatus.loading) {
      return 'Testing provider connection...';
    }
    if (providerConnectionStatus.connected) {
      const modelsText = providerConnectionStatus.models
        ? `${providerConnectionStatus.models.length} models available.`
        : '';
      return `Successfully connected. ${modelsText}`;
    }
    return `Connection failed: ${
      providerConnectionStatus.error || 'Unknown error'
    }`;
  };

  return (
    <Box
      style={{
        padding: '16px',
        margin: '16px',
        backgroundColor: getBoxBackgroundColor(),
        borderRadius: '8px',
        border: `1px solid ${getBorderColor()}`,
      }}
    >
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CloudIcon
            style={{ fontSize: '18px', color: theme.palette.text.secondary }}
          />
          <Typography
            variant="subtitle2"
            style={{ fontWeight: 600, color: theme.palette.text.primary }}
          >
            Provider
          </Typography>
        </Box>
        <Tooltip title={getTooltipTitle()} placement="left">
          <Typography
            variant="caption"
            style={{
              color: getStatusColor(),
              fontWeight: 600,
              fontSize: '0.75rem',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: getStatusBackgroundColor(),
              cursor: 'help',
              border: `1px solid ${getStatusBorderColor()}`,
            }}
          >
            {getStatusText()}
          </Typography>
        </Tooltip>
      </Box>
      <Typography
        variant="caption"
        style={{
          color: theme.palette.text.secondary,
          lineHeight: 1.5,
          fontSize: '0.8rem',
        }}
      >
        <strong>Model:</strong> {configStatus?.provider?.model || 'Loading...'}
        <br />
        <strong>URL:</strong> {configStatus?.provider?.baseURL || 'Loading...'}
      </Typography>
      {providerConnectionStatus.error && !providerConnectionStatus.loading && (
        <Box
          style={{
            marginTop: '12px',
            padding: '10px',
            backgroundColor: isDarkMode ? '#2e1e1e' : '#ffebee',
            borderRadius: '6px',
            border: `1px solid ${isDarkMode ? '#4a2c2c' : '#ffcdd2'}`,
            maxHeight: '80px',
            overflowY: 'auto',
          }}
        >
          <Typography
            variant="caption"
            style={{
              color: isDarkMode ? '#ff6b6b' : '#d32f2f',
              fontSize: '0.75rem',
              lineHeight: 1.4,
              display: 'block',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            <strong>Error:</strong> {providerConnectionStatus.error}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
