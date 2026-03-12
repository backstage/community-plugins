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
import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { alpha, useTheme } from '@mui/material/styles';

export interface ServerItemPickerProps {
  /** Currently selected items */
  selected: string[];
  /** Callback when selection changes */
  onChange: (items: string[]) => void;
  /** Items discovered from the server */
  serverItems: string[];
  /** Whether server items are still loading */
  serverLoading: boolean;
  /** Error loading server items */
  serverError: string | null;
  /** Refresh server items */
  onRefresh: () => void;
  /** Label for the section */
  label: string;
  /** Placeholder for custom item input */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** What to call the items (e.g. "shields", "scoring functions") */
  itemLabel?: string;
  /** Name of the provider/server (e.g. "Llama Stack") */
  providerName?: string;
}

/**
 * A picker that shows server-discovered items as toggleable chips,
 * with the ability to also add custom entries manually.
 * Selected items appear as filled chips; available-but-unselected as outlined.
 */
export const ServerItemPicker = ({
  selected,
  onChange,
  serverItems,
  serverLoading,
  serverError,
  onRefresh,
  label,
  placeholder = 'Add custom item...',
  disabled,
  itemLabel = 'items',
  providerName = 'the server',
}: ServerItemPickerProps) => {
  const theme = useTheme();
  const [draft, setDraft] = useState('');

  const toggleItem = useCallback(
    (item: string) => {
      if (disabled) return;
      if (selected.includes(item)) {
        onChange(selected.filter(s => s !== item));
      } else {
        onChange([...selected, item]);
      }
    },
    [selected, onChange, disabled],
  );

  const addCustom = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setDraft('');
    }
  }, [draft, selected, onChange]);

  const removeItem = useCallback(
    (item: string) => {
      onChange(selected.filter(s => s !== item));
    },
    [selected, onChange],
  );

  const customSelected = selected.filter(s => !serverItems.includes(s));

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ fontWeight: 600 }}
        >
          {label}
        </Typography>
        {serverLoading ? (
          <CircularProgress size={14} />
        ) : (
          <Tooltip title={`Refresh available ${itemLabel} from server`}>
            <IconButton
              size="small"
              onClick={onRefresh}
              sx={{ p: 0.25 }}
              aria-label={`Refresh ${itemLabel}`}
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
        {!serverLoading && serverItems.length > 0 && (
          <Typography
            variant="caption"
            sx={{
              color: alpha(theme.palette.text.secondary, 0.6),
              fontSize: '0.7rem',
            }}
          >
            {serverItems.length} available on server
          </Typography>
        )}
      </Box>

      {serverError && (
        <Alert severity="warning" sx={{ mb: 1, py: 0, fontSize: '0.75rem' }}>
          Could not discover {itemLabel}: {serverError}
        </Alert>
      )}

      {!serverLoading && serverItems.length === 0 && !serverError && (
        <Alert severity="info" sx={{ mb: 1, py: 0, fontSize: '0.75rem' }}>
          No {itemLabel} registered on the {providerName} server. You can still
          add IDs manually below.
        </Alert>
      )}

      {serverItems.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {serverItems.map(item => {
            const isSelected = selected.includes(item);
            return (
              <Chip
                key={item}
                label={item}
                size="small"
                role="switch"
                aria-checked={isSelected}
                icon={
                  isSelected ? (
                    <CheckCircleIcon sx={{ fontSize: '16px !important' }} />
                  ) : undefined
                }
                onClick={() => toggleItem(item)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                disabled={disabled}
                sx={{
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  fontWeight: isSelected ? 600 : 400,
                  '&:hover': disabled
                    ? {}
                    : {
                        backgroundColor: isSelected
                          ? undefined
                          : alpha(theme.palette.primary.main, 0.08),
                        borderColor: theme.palette.primary.main,
                      },
                }}
              />
            );
          })}
        </Box>
      )}

      {customSelected.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ fontSize: '0.7rem', mb: 0.5, display: 'block' }}
          >
            Custom (not on server)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {customSelected.map(item => (
              <Chip
                key={item}
                label={item}
                size="small"
                color="warning"
                variant="outlined"
                onDelete={disabled ? undefined : () => removeItem(item)}
                disabled={disabled}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
          sx={{ flex: 1 }}
        />
        <IconButton
          onClick={addCustom}
          disabled={disabled || !draft.trim()}
          size="small"
          aria-label="add custom item"
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
