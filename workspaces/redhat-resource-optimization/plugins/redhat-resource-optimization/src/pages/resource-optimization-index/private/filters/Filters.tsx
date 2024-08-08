import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { useFiltersStyles } from './useFiltersStyles';
import { ComboBox } from '../combo-box';

const filterFieldIds = [
  'cluster',
  'project',
  'workload',
  'workloadType',
] as const;

/** @public */
export type FiltersProps = {
  cluster: { label: string; options: string[] };
  project: { label: string; options: string[] };
  workload: { label: string; options: string[] };
  workloadType: { label: string; options: string[] };
  onFiltersChange: (
    fieldId: 'cluster' | 'project' | 'workload' | 'workloadType',
    values: string[],
  ) => void;
  onFiltersReset: () => void;
};

/** @public */
export function Filters(props: FiltersProps) {
  const { onFiltersChange, onFiltersReset, ...filters } = props;
  const classes = useFiltersStyles();
  const [globalKeyId, setGlobalKeyId] = useState(0); // Used for reseting the ComboBoxes internal state

  return (
    <Box className={classes.root}>
      <Box className={classes.header}>
        <Box className={classes.value}>Filters</Box>
        <Button
          color="primary"
          onClick={(_): void => {
            onFiltersReset();
            setGlobalKeyId(globalKeyId + 1);
          }}
        >
          Reset
        </Button>
      </Box>
      <Box className={classes.filters}>
        {filterFieldIds.map(ffid => (
          <ComboBox
            multiple
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            filterSelectedOptions
            key={`${ffid}-${globalKeyId}`}
            label={filters[ffid].label}
            options={filters[ffid].options}
            onChange={(_, values): void => {
              onFiltersChange(ffid, values);
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
