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
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export interface BrandingState {
  appName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface BrandingSectionProps {
  values: BrandingState;
  onFieldChange: <K extends keyof BrandingState>(
    field: K,
    value: BrandingState[K],
  ) => void;
  onSave: () => void;
  onReset: () => void;
  configSource: 'database' | 'default';
  saving: boolean;
  error: string | null;
}

export const BrandingSection = ({
  values,
  onFieldChange,
  onSave,
  onReset,
  configSource,
  saving,
  error,
}: BrandingSectionProps) => {
  const theme = useTheme();

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="h6">Branding</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {configSource === 'database' && (
            <Chip label="Customized" size="small" color="info" />
          )}
          <Button
            size="small"
            startIcon={<RestoreIcon />}
            onClick={onReset}
            disabled={saving || configSource === 'default'}
          >
            Reset
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
        <TextField
          label="App Name"
          size="small"
          value={values.appName}
          onChange={e => onFieldChange('appName', e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <TextField
          label="Tagline"
          size="small"
          value={values.tagline}
          onChange={e => onFieldChange('tagline', e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
        <TextField
          label="Primary Color"
          size="small"
          value={values.primaryColor}
          onChange={e => onFieldChange('primaryColor', e.target.value)}
          placeholder={theme.palette.primary.main}
          sx={{ width: 150 }}
          error={!!values.primaryColor && !HEX_RE.test(values.primaryColor)}
          helperText={
            values.primaryColor && !HEX_RE.test(values.primaryColor)
              ? 'Invalid hex'
              : ''
          }
        />
        <TextField
          label="Secondary Color"
          size="small"
          value={values.secondaryColor}
          onChange={e => onFieldChange('secondaryColor', e.target.value)}
          placeholder={theme.palette.text.secondary}
          sx={{ width: 150 }}
          error={!!values.secondaryColor && !HEX_RE.test(values.secondaryColor)}
          helperText={
            values.secondaryColor && !HEX_RE.test(values.secondaryColor)
              ? 'Invalid hex'
              : ''
          }
        />
        {values.primaryColor && HEX_RE.test(values.primaryColor) && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              backgroundColor: values.primaryColor,
              border: '1px solid',
              borderColor: 'divider',
              alignSelf: 'center',
            }}
          />
        )}
      </Box>
      <Button
        variant="contained"
        size="small"
        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
        onClick={onSave}
        disabled={saving}
      >
        Save
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};
