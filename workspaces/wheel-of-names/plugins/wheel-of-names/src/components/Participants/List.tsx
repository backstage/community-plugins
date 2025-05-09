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
import {
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Avatar,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import { useParticipantsStyles } from './Styles';
import { Entity } from '@backstage/catalog-model';

interface Participant {
  id: string;
  name: string;
  displayName?: string;
  fromGroup?: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  onRemoveParticipant: (id: string) => void;
  onClearAll: () => void;
  isProcessing: boolean;
}

export const ParticipantsList = (
  {
    participants,
    onRemoveParticipant,
    onClearAll,
    isProcessing,
  }: ParticipantsListProps,
  entity: Entity,
) => {
  const classes = useParticipantsStyles();

  const getParticipantClassName = (participant: Participant) => {
    return participant.fromGroup
      ? classes.groupMemberItem
      : classes.selectedParticipantItem;
  };

  if (participants.length === 0) {
    return null;
  }

  return (
    <div className={classes.selectedParticipantsContainer}>
      <div className={classes.participantsHeader}>
        <Typography variant="subtitle1">
          Selected Participants ({participants.length})
        </Typography>

        <Button
          variant="outlined"
          color="secondary"
          size="small"
          onClick={onClearAll}
          disabled={isProcessing}
          startIcon={<DeleteIcon />}
        >
          Clear All
        </Button>
      </div>

      <Paper className={classes.selectedParticipantsList}>
        <List dense>
          {participants.map(participant => (
            <React.Fragment key={participant.id}>
              <ListItem className={getParticipantClassName(participant)}>
                <Avatar
                  className={
                    entity.kind === 'Group'
                      ? classes.groupAvatar
                      : classes.userAvatar
                  }
                >
                  <PersonIcon />
                </Avatar>
                <ListItemText
                  primary={participant.displayName || participant.name}
                  secondary={
                    participant.fromGroup
                      ? `From group: ${participant.fromGroup}`
                      : undefined
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onRemoveParticipant(participant.id)}
                    disabled={isProcessing}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </div>
  );
};
