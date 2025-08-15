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
import { useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloudIcon from '@mui/icons-material/Cloud';
import { useTheme } from '@mui/material/styles';
import { ProviderStatusData } from '../../types';

interface ProviderStatusProps {
  providerStatusData: ProviderStatusData | null;
  isLoading: boolean;
  error: string | null;
}

export const ProviderStatus = ({
  providerStatusData,
  isLoading,
  error,
}: ProviderStatusProps) => {
  const theme = useTheme();

  const primaryProvider = providerStatusData?.providers?.[0];
  const connectionInfo = primaryProvider?.connection;
  const isConnected = connectionInfo?.connected ?? false;
  const isError = !isConnected && !isLoading;

  const getBoxBackgroundColor = useCallback(() => {
    return theme.palette.background.paper;
  }, [theme.palette.background.paper]);

  const getBorderColor = useCallback(() => {
    if (isError) {
      return theme.palette.error.main;
    }
    return theme.palette.divider;
  }, [isError, theme.palette]);

  const getChipBackgroundColor = useCallback(() => {
    if (isLoading) {
      return 'transparent';
    }
    if (isConnected) {
      return theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : 'transparent';
    }
    return 'transparent';
  }, [
    isLoading,
    isConnected,
    theme.palette.mode,
    theme.palette.background.paper,
  ]);

  const getChipColor = useCallback(() => {
    if (isLoading) {
      return theme.palette.warning.main;
    }
    if (isConnected) {
      return theme.palette.mode === 'dark'
        ? theme.palette.success.light
        : theme.palette.success.dark;
    }
    return theme.palette.error.main;
  }, [isLoading, isConnected, theme.palette]);

  const getChipBorder = useCallback(() => {
    if (isLoading) {
      return `2px solid ${theme.palette.warning.main}`;
    }
    if (isConnected) {
      return `2px solid ${theme.palette.success.main}`;
    }
    return `2px solid ${theme.palette.error.main}`;
  }, [isLoading, isConnected, theme.palette]);

  const getDotColor = useCallback(() => {
    if (isLoading) {
      return theme.palette.warning.main;
    }
    if (isConnected) {
      return theme.palette.success.main;
    }
    return theme.palette.error.main;
  }, [isLoading, isConnected, theme.palette]);

  const getStatusText = useCallback(() => {
    if (isLoading) return 'Testing...';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  }, [isLoading, isConnected]);

  const getTooltipTitle = useCallback(() => {
    if (isLoading) {
      return 'Testing provider connection...';
    }
    if (isConnected) {
      const modelsText = connectionInfo?.models
        ? `${connectionInfo.models.length} models available.`
        : '';
      return `Successfully connected. ${modelsText}`;
    }
    return `Connection failed: ${
      connectionInfo?.error || error || 'Unknown error'
    }`;
  }, [isLoading, isConnected, connectionInfo, error]);

  const displayModel = useMemo(() => {
    if (isLoading) return 'Loading...';
    if (error && !providerStatusData) return 'Error';
    return primaryProvider?.model || 'Not available';
  }, [isLoading, error, providerStatusData, primaryProvider?.model]);

  const displayUrl = useMemo(() => {
    if (isLoading) return 'Loading...';
    if (error && !providerStatusData) return 'Error';
    return primaryProvider?.baseUrl || 'Not available';
  }, [isLoading, error, providerStatusData, primaryProvider?.baseUrl]);

  const errorMessage = connectionInfo?.error || error;

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
          <Chip
            label={getStatusText()}
            size="small"
            icon={
              <FiberManualRecordIcon
                sx={{
                  fill: getDotColor(),
                  fontSize: '10px !important',
                  marginLeft: '8px',
                }}
              />
            }
            sx={{
              cursor: 'help',
              backgroundColor: getChipBackgroundColor(),
              color: getChipColor(),
              border: getChipBorder(),
              fontSize: '0.75rem',
              fontWeight: 600,
              '& .MuiChip-icon': {
                marginLeft: '8px',
                marginRight: '4px',
              },
            }}
          />
        </Tooltip>
      </Box>
      <Typography
        variant="caption"
        style={{
          color: theme.palette.text.primary,
          lineHeight: 1.5,
          fontSize: '0.8rem',
        }}
      >
        <strong>Model:</strong> {displayModel}
        <br />
        <strong>URL:</strong> {displayUrl}
      </Typography>
      {errorMessage && !isLoading && (
        <Box
          style={{
            marginTop: '12px',
            padding: '10px',
            backgroundColor: theme.palette.background.paper,
            borderRadius: '6px',
            border: `1px solid ${theme.palette.error.main}`,
            maxHeight: '80px',
            overflowY: 'auto',
          }}
        >
          <Typography
            variant="caption"
            style={{
              color: theme.palette.text.primary,
              fontSize: '0.75rem',
              lineHeight: 1.4,
              display: 'block',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            <strong>Error:</strong> {errorMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
