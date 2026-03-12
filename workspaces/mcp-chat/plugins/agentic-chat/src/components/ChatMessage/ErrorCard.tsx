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
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTheme, alpha } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorCardProps {
  message: string;
  code?: string;
  onRetry?: () => void;
}

function getErrorConfig(code?: string) {
  switch (code) {
    case 'safety_violation':
      return {
        icon: WarningAmberIcon,
        title: 'Content Filtered',
        palette: 'warning' as const,
        hint: 'This response was blocked by a safety policy. Try rephrasing your request.',
        showRetry: false,
      };
    case 'network':
      return {
        icon: WifiOffIcon,
        title: 'Connection Error',
        palette: 'info' as const,
        hint: 'The connection to the server was lost. Check your network and try again.',
        showRetry: true,
      };
    case 'stream_error':
    default:
      return {
        icon: ErrorOutlineIcon,
        title: 'Error',
        palette: 'error' as const,
        hint: undefined,
        showRetry: true,
      };
  }
}

export const ErrorCard = React.memo(function ErrorCard({
  message,
  code,
  onRetry,
}: ErrorCardProps) {
  const theme = useTheme();
  const config = getErrorConfig(code);
  const Icon = config.icon;
  const color = theme.palette[config.palette].main;

  const errorBody = message.replace(/^Error:\s*/i, '');

  return (
    <Box
      role="alert"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(color, 0.4)}`,
        backgroundColor: alpha(color, 0.06),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon sx={{ fontSize: 20, color }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color }}>
          {config.title}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
        {errorBody}
      </Typography>

      {config.hint && (
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary }}
        >
          {config.hint}
        </Typography>
      )}

      {config.showRetry && onRetry && (
        <Box sx={{ mt: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
            onClick={onRetry}
            sx={{
              textTransform: 'none',
              borderColor: alpha(color, 0.5),
              color,
              '&:hover': {
                borderColor: color,
                backgroundColor: alpha(color, 0.08),
              },
            }}
          >
            Try again
          </Button>
        </Box>
      )}
    </Box>
  );
});
