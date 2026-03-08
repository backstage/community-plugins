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
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

export interface AdminSectionProps {
  title: string;
  description?: string;
  source: 'database' | 'default';
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onReset?: () => void;
  /** Disable the save button (e.g. when form is invalid) */
  saveDisabled?: boolean;
  children: ReactNode;
}

/**
 * Reusable card wrapper for admin config sections.
 * Provides a consistent header, customized chip, save/reset buttons,
 * and error display.
 */
export const AdminSection = ({
  title,
  description,
  source,
  saving,
  error,
  onSave,
  onReset,
  saveDisabled,
  children,
}: AdminSectionProps) => (
  <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
    <Box
      sx={{
        display: 'flex',
        justifyContent: title ? 'space-between' : 'flex-end',
        alignItems: 'center',
        mb: 1,
      }}
    >
      {title && <Typography variant="h6">{title}</Typography>}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {source === 'database' && (
          <Chip label="Customized" size="small" color="info" />
        )}
        {onReset && (
          <Button
            size="small"
            startIcon={<RestoreIcon />}
            onClick={onReset}
            disabled={saving || source === 'default'}
          >
            Reset
          </Button>
        )}
      </Box>
    </Box>

    {description && (
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
        {description}
      </Typography>
    )}

    {children}

    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant="contained"
        size="small"
        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
        onClick={onSave}
        disabled={saving || saveDisabled}
        aria-busy={saving}
      >
        Save
      </Button>
    </Box>

    {error && (
      <Alert severity="error" sx={{ mt: 1 }}>
        {error}
      </Alert>
    )}
  </Paper>
);
