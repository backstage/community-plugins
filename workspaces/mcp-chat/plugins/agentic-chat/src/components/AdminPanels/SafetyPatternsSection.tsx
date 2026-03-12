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
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

export interface SafetyPatternsSectionProps {
  patterns: string[];
  onAddPattern: (pattern: string) => void;
  onRemovePattern: (index: number) => void;
  newPattern: string;
  onNewPatternChange: (value: string) => void;
  onSave: () => void;
  onReset: () => void;
  configSource: 'database' | 'default';
  saving: boolean;
  error: string | null;
}

export const SafetyPatternsSection = ({
  patterns,
  onAddPattern,
  onRemovePattern,
  newPattern,
  onNewPatternChange,
  onSave,
  onReset,
  configSource,
  saving,
  error,
}: SafetyPatternsSectionProps) => {
  const handleAddPattern = () => {
    if (newPattern.trim()) {
      onAddPattern(newPattern.trim());
      onNewPatternChange('');
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="h6">Safety Patterns</Typography>
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
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        Words or phrases that trigger safety guardrails when detected in user
        input.
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {patterns.map((p, i) => (
          <Chip
            key={i}
            label={p}
            onDelete={() => onRemovePattern(i)}
            size="small"
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <TextField
          size="small"
          value={newPattern}
          onChange={e => onNewPatternChange(e.target.value)}
          placeholder="Add a safety pattern..."
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddPattern();
          }}
          sx={{ flex: 1 }}
        />
        <IconButton onClick={handleAddPattern} disabled={!newPattern.trim()}>
          <AddIcon />
        </IconButton>
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
