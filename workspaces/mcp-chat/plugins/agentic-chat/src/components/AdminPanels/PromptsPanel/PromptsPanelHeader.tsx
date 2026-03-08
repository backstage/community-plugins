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
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

export interface PromptsPanelHeaderProps {
  readonly source: 'database' | 'default';
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly onSave: () => void;
  readonly onReset: () => void;
}

const HEADER_SX = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  mb: 2,
  gap: 2,
  flexWrap: 'wrap',
} as const;

const ACTIONS_SX = {
  display: 'flex',
  gap: 1,
  flexShrink: 0,
} as const;

export const PromptsPanelHeader: React.FC<PromptsPanelHeaderProps> = ({
  source,
  dirty,
  saving,
  onSave,
  onReset,
}) => (
  <Box sx={HEADER_SX}>
    <Box>
      <Typography variant="h5" gutterBottom>
        Prompts &amp; Actions
      </Typography>
      <Typography variant="body2" color="textSecondary" component="div">
        Configure swim lanes and clickable prompts shown on the welcome screen.{' '}
        {source === 'database' && (
          <Chip label="Customized" size="small" color="info" />
        )}
      </Typography>
    </Box>
    <Box sx={ACTIONS_SX}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<RestoreIcon />}
        onClick={onReset}
        disabled={saving || source === 'default'}
      >
        Reset to Defaults
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={saving ? <CircularProgress size={14} /> : <SaveIcon />}
        onClick={onSave}
        disabled={saving || !dirty}
      >
        {dirty ? 'Save Changes' : 'Saved'}
      </Button>
    </Box>
  </Box>
);
