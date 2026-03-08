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
import React, { useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getIconForName } from '../../WelcomeScreen/iconUtils';
import type {
  EditableLane,
  EditableCard,
  ValidationErrors,
} from '../useSwimLanesEditor';
import { CardEditor } from './CardEditor';
import { ColorPicker } from './ColorPicker';
import { DeleteConfirmButton } from './DeleteConfirmButton';
import { IconPicker } from './IconPicker';

export interface LaneAccordionProps {
  readonly lane: EditableLane;
  readonly defaultExpanded: boolean;
  readonly validationErrors: ValidationErrors;
  readonly onUpdateLane: (
    laneKey: string,
    updates: Partial<Omit<EditableLane, '_key' | 'cards'>>,
  ) => void;
  readonly onUpdateCard: (
    laneKey: string,
    cardKey: string,
    updates: Partial<Omit<EditableCard, '_key'>>,
  ) => void;
  readonly onAddCard: (laneKey: string) => void;
  readonly onRemoveCard: (laneKey: string, cardKey: string) => void;
  readonly onRemoveLane: (laneKey: string) => void;
}

const SUMMARY_SX = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  width: '100%',
} as const;

const ICON_PREVIEW_SX = {
  width: 24,
  height: 24,
  borderRadius: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'common.white',
  '& svg': { fontSize: 14 },
  flexShrink: 0,
} as const;

const LANE_FIELDS_SX = {
  display: 'flex',
  gap: 1.5,
  mb: 2,
  flexWrap: 'wrap',
} as const;

export const LaneAccordion: React.FC<LaneAccordionProps> = ({
  lane,
  defaultExpanded,
  validationErrors,
  onUpdateLane,
  onUpdateCard,
  onAddCard,
  onRemoveCard,
  onRemoveLane,
}) => {
  const titleError = validationErrors.lanes.get(`${lane._key}:title`);
  const cardsError = validationErrors.lanes.get(`${lane._key}:cards`);

  const handleLaneField = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateLane(lane._key, { [field]: e.target.value });
    },
    [lane._key, onUpdateLane],
  );

  const laneColor = lane.color || '#1976d2';

  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={SUMMARY_SX}>
          <Box sx={{ ...ICON_PREVIEW_SX, backgroundColor: laneColor }}>
            {getIconForName(lane.icon)}
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {lane.title || 'Untitled Lane'}
          </Typography>
          <Chip
            label={`${lane.cards.length} card${
              lane.cards.length !== 1 ? 's' : ''
            }`}
            size="small"
            variant="outlined"
          />
          {cardsError && (
            <Typography variant="caption" color="error">
              {cardsError}
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          <DeleteConfirmButton
            confirmLabel={`Delete lane & ${lane.cards.length} card${
              lane.cards.length !== 1 ? 's' : ''
            }?`}
            tooltipTitle="Delete lane"
            onConfirm={() => onRemoveLane(lane._key)}
          />
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={LANE_FIELDS_SX}>
          <TextField
            label="Lane Title"
            size="small"
            value={lane.title}
            onChange={handleLaneField('title')}
            error={!!titleError}
            helperText={
              titleError || 'Give this lane a name, e.g. "DevOps Tasks"'
            }
            placeholder="e.g. DevOps Tasks"
            sx={{ flex: 1, minWidth: 200 }}
            required
          />
          <IconPicker
            value={lane.icon}
            onChange={icon => onUpdateLane(lane._key, { icon })}
            sx={{ width: 150 }}
          />
          <ColorPicker
            value={lane.color}
            onChange={color => onUpdateLane(lane._key, { color })}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {lane.cards.map(card => (
          <CardEditor
            key={card._key}
            card={card}
            laneKey={lane._key}
            validationErrors={validationErrors}
            onUpdate={onUpdateCard}
            onRemove={onRemoveCard}
          />
        ))}

        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => onAddCard(lane._key)}
          sx={{ mt: 0.5 }}
        >
          Add Card
        </Button>
      </AccordionDetails>
    </Accordion>
  );
};
