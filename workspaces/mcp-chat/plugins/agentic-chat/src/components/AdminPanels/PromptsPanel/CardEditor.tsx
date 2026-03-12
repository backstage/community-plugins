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
import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import Link from '@mui/material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import type { EditableCard, ValidationErrors } from '../useSwimLanesEditor';
import { IconPicker } from './IconPicker';

export interface CardEditorProps {
  readonly card: EditableCard;
  readonly laneKey: string;
  readonly validationErrors: ValidationErrors;
  readonly onUpdate: (
    laneKey: string,
    cardKey: string,
    updates: Partial<Omit<EditableCard, '_key'>>,
  ) => void;
  readonly onRemove: (laneKey: string, cardKey: string) => void;
}

const PAPER_SX = {
  px: 2,
  py: 1.5,
  mb: 1,
  borderRadius: 2,
} as const;

const ROW_SX = {
  display: 'flex',
  gap: 1.5,
  alignItems: 'flex-start',
} as const;

const FIELDS_SX = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  minWidth: 0,
} as const;

const ACTIONS_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 0.5,
  pt: 0.5,
} as const;

export const CardEditor: React.FC<CardEditorProps> = ({
  card,
  laneKey,
  validationErrors,
  onUpdate,
  onRemove,
}) => {
  const titleError = validationErrors.cards.get(`${card._key}:title`);
  const promptError = validationErrors.cards.get(`${card._key}:prompt`);
  const hasDescription = Boolean(card.description);
  const [showMore, setShowMore] = useState(hasDescription);

  const handleField = useCallback(
    (field: keyof Omit<EditableCard, '_key'>) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(laneKey, card._key, { [field]: e.target.value });
      },
    [laneKey, card._key, onUpdate],
  );

  return (
    <Paper variant="outlined" sx={PAPER_SX}>
      <Box sx={ROW_SX}>
        <Box sx={FIELDS_SX}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Title"
              size="small"
              value={card.title}
              onChange={handleField('title')}
              error={!!titleError}
              helperText={titleError}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              label="Prompt"
              size="small"
              value={card.prompt}
              onChange={handleField('prompt')}
              error={!!promptError}
              helperText={promptError}
              required
              sx={{ flex: 2 }}
            />
          </Box>

          <Collapse in={showMore}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Description"
                size="small"
                value={card.description || ''}
                onChange={handleField('description')}
                placeholder="Optional text below the title"
                sx={{ flex: 1 }}
              />
              <IconPicker
                value={card.icon}
                onChange={icon => onUpdate(laneKey, card._key, { icon })}
                sx={{ width: 140 }}
              />
            </Box>
          </Collapse>

          {!showMore && (
            <Link
              component="button"
              variant="caption"
              underline="hover"
              onClick={() => setShowMore(true)}
              sx={{ alignSelf: 'flex-start' }}
            >
              + Description &amp; Icon
            </Link>
          )}
        </Box>

        <Box sx={ACTIONS_SX}>
          <Tooltip title="Remove card">
            <IconButton
              size="small"
              onClick={() => onRemove(laneKey, card._key)}
              aria-label="Remove card"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};
