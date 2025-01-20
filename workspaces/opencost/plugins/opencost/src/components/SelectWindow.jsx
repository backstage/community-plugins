/*
 * Copyright 2023 The Backstage Authors
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

import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { isValid } from 'date-fns';
import { find, get } from 'lodash';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const useStyles = makeStyles({
  dateContainer: {
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 6,
    paddingBottom: 18,
    display: 'flex',
    flexFlow: 'row',
  },
  dateContainerColumn: {
    display: 'flex',
    flexFlow: 'column',
  },
  formControl: {
    margin: 8,
    width: 120,
  },
});

const SelectWindow = ({ windowOptions, window, setWindow }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [intervalString, setIntervalString] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStartDateChange = date => {
    if (isValid(date)) {
      setStartDate(new Date(date.setHours(0, 0, 0, 0)));
    }
  };

  const handleEndDateChange = date => {
    if (isValid(date)) {
      setEndDate(new Date(date.setHours(0, 0, 0, 0)));
    }
  };

  const handleSubmitPresetDates = dateString => {
    setWindow(dateString);
    setStartDate(null);
    setEndDate(null);
    handleClose();
  };

  const handleSubmitCustomDates = () => {
    if (intervalString !== null) {
      setWindow(intervalString);
      handleClose();
    }
  };

  useEffect(() => {
    if (startDate !== null && endDate !== null) {
      // Note: getTimezoneOffset() is calculated based on current system locale, NOT date object
      const adjustedStartDate = new Date(
        startDate - startDate.getTimezoneOffset() * 60000,
      );
      const adjustedEndDate = new Date(
        endDate - endDate.getTimezoneOffset() * 60000,
      );
      setIntervalString(
        `${adjustedStartDate.toISOString().split('.')[0]}Z` +
          `,${adjustedEndDate.toISOString().split('.')[0]}Z`,
      );
    }
  }, [startDate, endDate]);

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  return (
    <>
      <FormControl className={classes.formControl}>
        <TextField
          id="filled-read-only-input"
          label="Date Range"
          value={get(find(windowOptions, { value: window }), 'name', 'Custom')}
          onClick={e => handleClick(e)}
          inputProps={{
            readOnly: true,
            style: { cursor: 'pointer' },
          }}
        />
      </FormControl>
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
          horizontal: 'center',
        }}
      >
        <div className={classes.dateContainer}>
          <div className={classes.dateContainerColumn}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                style={{ width: '144px' }}
                autoOk
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="date-picker-start"
                label="Start Date"
                value={startDate}
                maxDate={new Date()}
                maxDateMessage="Date should not be after today."
                onChange={handleStartDateChange}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
              <DatePicker
                style={{ width: '144px' }}
                autoOk
                disableToolbar
                variant="inline"
                format="MM/dd/yyyy"
                margin="normal"
                id="date-picker-end"
                label="End Date"
                value={endDate}
                maxDate={new Date()}
                maxDateMessage="Date should not be after today."
                onChange={handleEndDateChange}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
              />
            </LocalizationProvider>
            <div>
              <Button
                style={{ marginTop: 16 }}
                variant="contained"
                color="default"
                onClick={handleSubmitCustomDates}
              >
                Apply
              </Button>
            </div>
          </div>
          <div
            className={classes.dateContainerColumn}
            style={{ paddingTop: 12, marginLeft: 18 }}
          >
            {windowOptions.map(opt => (
              <Typography key={opt.value}>
                <Link
                  style={{ cursor: 'pointer' }}
                  key={opt.value}
                  value={opt.value}
                  onClick={() => handleSubmitPresetDates(opt.value)}
                >
                  {opt.name}
                </Link>
              </Typography>
            ))}
          </div>
        </div>
      </Popover>
    </>
  );
};

export default React.memo(SelectWindow);
