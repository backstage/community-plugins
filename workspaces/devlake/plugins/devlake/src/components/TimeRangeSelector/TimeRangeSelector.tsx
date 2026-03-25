/*
 * Copyright 2024 The Backstage Authors
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

/* eslint-disable @backstage/no-undeclared-imports */
import { Button, ButtonGroup, TextField, makeStyles } from '@material-ui/core';
import { TimeRangePreset } from '@backstage-community/plugin-devlake-common';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  dateField: {
    width: 160,
  },
  activeButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const PRESETS: { label: string; value: TimeRangePreset }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'Quarter', value: 'quarter' },
  { label: '1Y', value: '1y' },
];

/** @public */
export interface TimeRangeSelectorProps {
  preset?: TimeRangePreset;
  from?: string;
  to?: string;
  onPresetChange: (preset: TimeRangePreset) => void;
  onCustomRangeChange: (from: string, to: string) => void;
}

/** @public */
export const TimeRangeSelector = (props: TimeRangeSelectorProps) => {
  const { preset, from, to, onPresetChange, onCustomRangeChange } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <ButtonGroup size="small" variant="outlined">
        {PRESETS.map(p => (
          <Button
            key={p.value}
            onClick={() => onPresetChange(p.value)}
            className={preset === p.value ? classes.activeButton : undefined}
          >
            {p.label}
          </Button>
        ))}
      </ButtonGroup>
      <TextField
        type="date"
        label="From"
        size="small"
        variant="outlined"
        className={classes.dateField}
        value={from ?? ''}
        onChange={e => onCustomRangeChange(e.target.value, to ?? '')}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        type="date"
        label="To"
        size="small"
        variant="outlined"
        className={classes.dateField}
        value={to ?? ''}
        onChange={e => onCustomRangeChange(from ?? '', e.target.value)}
        InputLabelProps={{ shrink: true }}
      />
    </div>
  );
};
