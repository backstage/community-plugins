/*
 * Copyright 2026 The Backstage Authors
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

import { useState } from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import { MuiPickersUtilsProvider } from '@material-ui/pickers/MuiPickersUtilsProvider';
import { KeyboardDatePicker } from '@material-ui/pickers/DatePicker';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from 'luxon';
import { Duration } from '../../types';
import { formatLastTwoLookaheadQuarters } from '../../utils/formatters';
import { useLastCompleteBillingDate } from '../../hooks';

const useStyles = makeStyles(theme => ({
  button: {
    fontWeight: theme.typography.fontWeightBold,
    textTransform: 'none',
    color: theme.palette.text.primary,
    borderColor: theme.palette.divider,
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  },
  popover: {
    padding: theme.spacing(2),
    minWidth: 320,
  },
  presetSection: {
    marginBottom: theme.spacing(2),
  },
  presetChip: {
    margin: theme.spacing(0.5),
  },
  datePickersSection: {
    marginTop: theme.spacing(2),
  },
  datePickerWrapper: {
    marginBottom: theme.spacing(2),
    '& .MuiTextField-root': {
      width: '100%',
    },
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
}));

export type PeriodOption = {
  value: Duration;
  label: string;
};

export function getDefaultOptions(
  lastCompleteBillingDate: string,
): PeriodOption[] {
  return [
    {
      value: Duration.P90D,
      label: 'Past 6 Months',
    },
    {
      value: Duration.P30D,
      label: 'Past 60 Days',
    },
    {
      value: Duration.P3M,
      label: formatLastTwoLookaheadQuarters(lastCompleteBillingDate),
    },
  ];
}

type DateRangePickerProps = {
  duration: Duration;
  onSelect: (
    duration: Duration,
    customDateRange?: { start: string; end: string },
  ) => void;
  options?: PeriodOption[];
  customDateRange?: { start: string; end: string };
};

export const DateRangePicker = ({
  duration,
  onSelect,
  options,
  customDateRange,
}: DateRangePickerProps) => {
  const classes = useStyles();
  const lastCompleteBillingDate = useLastCompleteBillingDate();
  const optionsOrDefault =
    options ?? getDefaultOptions(lastCompleteBillingDate);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [startDate, setStartDate] = useState<DateTime | null>(
    customDateRange ? DateTime.fromISO(customDateRange.start) : null,
  );
  const [endDate, setEndDate] = useState<DateTime | null>(
    customDateRange ? DateTime.fromISO(customDateRange.end) : null,
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePresetSelect = (preset: Duration) => {
    onSelect(preset);
    handleClose();
  };

  const handleCustomApply = () => {
    if (startDate) {
      // If end date is not provided, default to lastCompleteBillingDate (day before today)
      const finalEndDate = endDate || DateTime.fromISO(lastCompleteBillingDate);
      const customRange = {
        start: startDate.toFormat('yyyy-MM-dd'),
        end: finalEndDate.toFormat('yyyy-MM-dd'),
      };
      onSelect(Duration.CUSTOM, customRange);
      handleClose();
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  // Display label
  const getDisplayLabel = () => {
    if (duration === Duration.CUSTOM && customDateRange) {
      return `${customDateRange.start} to ${customDateRange.end}`;
    }
    const option = optionsOrDefault.find(o => o.value === duration);
    return option?.label || 'Select Period';
  };

  return (
    <MuiPickersUtilsProvider utils={LuxonUtils}>
      <Button
        className={classes.button}
        variant="outlined"
        startIcon={<CalendarTodayIcon />}
        onClick={handleClick}
        data-testid="period-select"
      >
        {getDisplayLabel()}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box className={classes.popover}>
          <div className={classes.presetSection}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Select
            </Typography>
            <Box display="flex" flexWrap="wrap">
              {optionsOrDefault.map(option => (
                <Chip
                  key={option.value}
                  label={option.label}
                  onClick={() => handlePresetSelect(option.value)}
                  color={duration === option.value ? 'primary' : 'default'}
                  className={classes.presetChip}
                  data-testid={`period-preset-${option.value}`}
                />
              ))}
            </Box>
          </div>

          <Divider />

          <div className={classes.datePickersSection}>
            <Typography variant="subtitle2" gutterBottom>
              Custom Date Range
            </Typography>
            <Box className={classes.datePickerWrapper}>
              <KeyboardDatePicker
                label="Start Date"
                value={startDate}
                onChange={newValue => setStartDate(newValue)}
                format="yyyy-MM-dd"
                inputVariant="outlined"
                size="small"
              />
            </Box>
            <Box className={classes.datePickerWrapper}>
              <KeyboardDatePicker
                label="End Date (optional)"
                value={endDate}
                onChange={newValue => setEndDate(newValue)}
                minDate={startDate || undefined}
                format="yyyy-MM-dd"
                inputVariant="outlined"
                size="small"
                helperText={endDate ? '' : 'Defaults to yesterday'}
              />
            </Box>
            <Box className={classes.actionButtons}>
              <Button onClick={handleClose} size="small">
                Cancel
              </Button>
              <Button
                onClick={handleCustomApply}
                variant="contained"
                color="primary"
                size="small"
                disabled={!startDate}
                data-testid="apply-custom-range"
              >
                Apply
              </Button>
            </Box>
          </div>
        </Box>
      </Popover>
    </MuiPickersUtilsProvider>
  );
};
