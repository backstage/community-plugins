import React from 'react';
import {
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import DeleteIcon from '@material-ui/icons/Delete';
import { useParticipantsStyles } from './Styles';

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

export const ParticipantsList = ({
  participants,
  onRemoveParticipant,
  onClearAll,
  isProcessing,
}: ParticipantsListProps) => {
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
                <ListItemIcon>
                  <PersonIcon className={classes.entityIcon} />
                </ListItemIcon>
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
