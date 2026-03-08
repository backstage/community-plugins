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
import AddIcon from '@mui/icons-material/Add';

export interface StringListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Chip-based editor for a list of strings.
 * Renders existing items as deletable chips, with an input + add button
 * for appending new entries.
 */
export const StringListEditor = ({
  items,
  onChange,
  label,
  placeholder = 'Add an item...',
  disabled,
}: StringListEditorProps) => {
  const [draft, setDraft] = useState('');

  const addItem = useCallback(() => {
    const trimmed = draft.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
      setDraft('');
    }
  }, [draft, items, onChange]);

  const removeItem = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange],
  );

  return (
    <Box>
      {label && (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mb: 0.5, display: 'block' }}
        >
          {label}
        </Typography>
      )}

      {items.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {items.map((item, i) => (
            <Chip
              key={`${item}-${i}`}
              label={item}
              size="small"
              onDelete={disabled ? undefined : () => removeItem(i)}
              disabled={disabled}
            />
          ))}
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
              addItem();
            }
          }}
          sx={{ flex: 1 }}
        />
        <IconButton
          onClick={addItem}
          disabled={disabled || !draft.trim()}
          size="small"
          aria-label="add item"
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
