import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Box,
  FormHelperText,
  Chip,
} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import GroupIcon from '@material-ui/icons/Group';
import { Entity } from '@backstage/catalog-model';
import { useParticipantsStyles } from './Styles';
import { getUserDisplayName } from './utils/participantUtils';

interface EntityPickerProps {
  entities: Entity[];
  selectedEntities: string[];
  onChange: (selected: string[]) => void;
  isProcessing: boolean;
}

export const EntityPicker = ({
  entities,
  selectedEntities,
  onChange,
  isProcessing,
}: EntityPickerProps) => {
  const classes = useParticipantsStyles();

  const getEntityIcon = (entity: Entity) => {
    return entity.kind === 'Group' ? (
      <GroupIcon className={classes.groupIcon} />
    ) : (
      <PersonIcon className={classes.entityIcon} />
    );
  };

  const getChipClassName = (entity: Entity) => {
    return entity.kind === 'Group' ? classes.groupChip : classes.userChip;
  };

  return (
    <FormControl className={classes.formControl}>
      <Select
        multiple
        value={selectedEntities}
        onChange={event => {
          onChange(event.target.value as string[]);
        }}
        disabled={isProcessing}
        renderValue={selected => (
          <Box className={classes.chips}>
            {(selected as string[]).map(value => {
              const entity = entities.find(u => u.metadata.uid === value);
              return entity ? (
                <Chip
                  key={value}
                  icon={getEntityIcon(entity)}
                  label={getUserDisplayName(entity)}
                  className={getChipClassName(entity)}
                />
              ) : null;
            })}
          </Box>
        )}
      >
        {entities.map(entity => {
          // Skip entities without UIDs
          if (!entity.metadata.uid) {
            return null;
          }
          return (
            <MenuItem
              key={entity.metadata.uid}
              value={entity.metadata.uid}
              className={classes.menuItem}
            >
              <div className={classes.checkboxItem}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {getEntityIcon(entity)}
                  <ListItemText primary={getUserDisplayName(entity)} />
                </div>
                <Checkbox
                  checked={
                    !!entity.metadata.uid &&
                    selectedEntities.includes(entity.metadata.uid)
                  }
                  color="primary"
                />
              </div>
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>
        Select users and groups to include in the wheel
      </FormHelperText>
    </FormControl>
  );
};
