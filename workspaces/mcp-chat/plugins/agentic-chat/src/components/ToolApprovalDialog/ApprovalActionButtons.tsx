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
import Button from '@mui/material/Button';
import { useTheme, alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CircularProgress from '@mui/material/CircularProgress';
import { useBranding } from '../../hooks/useBranding';

export interface ApprovalActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  isSubmitting: boolean;
  approveDisabled?: boolean;
}

/**
 * Approve and Reject buttons for tool approval dialog
 */
export function ApprovalActionButtons({
  onApprove,
  onReject,
  isSubmitting,
  approveDisabled = false,
}: ApprovalActionButtonsProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { branding } = useBranding();

  return (
    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', pl: 1 }}>
      <Button
        variant="text"
        size="small"
        startIcon={<CancelIcon sx={{ fontSize: 15 }} />}
        onClick={onReject}
        disabled={isSubmitting}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.8rem',
          px: 2,
          py: 0.75,
          color: isDark ? theme.palette.error.light : theme.palette.error.main,
          '&:hover': {
            bgcolor: isDark
              ? alpha(branding.errorColor, 0.1)
              : alpha(branding.errorColor, 0.08),
          },
        }}
      >
        Reject
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={
          isSubmitting ? (
            <CircularProgress
              size={14}
              sx={{ color: theme.palette.success.contrastText }}
            />
          ) : (
            <CheckCircleIcon sx={{ fontSize: 15 }} />
          )
        }
        onClick={onApprove}
        disabled={isSubmitting || approveDisabled}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8rem',
          px: 2.5,
          py: 0.75,
          minWidth: 110,
          bgcolor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          boxShadow: 'none',
          '&:hover': {
            bgcolor: theme.palette.success.dark,
            boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
          },
          '&.Mui-disabled': {
            bgcolor: isSubmitting
              ? alpha(theme.palette.success.main, 0.7)
              : undefined,
            color: isSubmitting
              ? theme.palette.success.contrastText
              : undefined,
          },
        }}
      >
        {isSubmitting ? 'Running...' : 'Approve'}
      </Button>
    </Box>
  );
}
