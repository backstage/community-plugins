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

import { memo, useEffect, useState } from 'react';
import { Button, DialogTrigger, Popover } from '@backstage/ui';
import { isValid } from 'date-fns';
import { find, get } from 'lodash';
import styles from './SelectWindow.module.css';

const SelectWindow = ({ windowOptions, window, setWindow }) => {
  const [open, setOpen] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [intervalString, setIntervalString] = useState(null);

  const handleSubmitPresetDates = dateString => {
    setWindow(dateString);
    setStartDate(null);
    setEndDate(null);
    setOpen(false);
  };

  const handleSubmitCustomDates = () => {
    if (intervalString !== null) {
      setWindow(intervalString);
      setOpen(false);
    }
  };

  const handleStartDateChange = e => {
    const dateStr = e.target.value;
    if (dateStr) {
      const date = new Date(`${dateStr}T00:00:00`);
      if (isValid(date)) {
        setStartDate(date);
      }
    } else {
      setStartDate(null);
    }
  };

  const handleEndDateChange = e => {
    const dateStr = e.target.value;
    if (dateStr) {
      const date = new Date(`${dateStr}T23:59:59`);
      if (isValid(date)) {
        setEndDate(date);
      }
    } else {
      setEndDate(null);
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

  const windowLabel = get(
    find(windowOptions, { value: window }),
    'name',
    'Custom',
  );

  return (
    <div className={styles.windowFieldWrapper}>
      <span className={styles.windowLabel}>Date Range</span>
      <DialogTrigger isOpen={open} onOpenChange={setOpen}>
        <Button className={styles.windowField}>{windowLabel}</Button>
        <Popover placement="bottom left" hideArrow>
          <div className={styles.dateContainer}>
            <div className={styles.dateContainerColumn}>
              <div>
                <label className={styles.dateLabel} htmlFor="date-picker-start">
                  Start Date
                </label>
                <input
                  id="date-picker-start"
                  type="date"
                  className={styles.dateInput}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleStartDateChange}
                  aria-label="Start date"
                />
              </div>
              <div>
                <label className={styles.dateLabel} htmlFor="date-picker-end">
                  End Date
                </label>
                <input
                  id="date-picker-end"
                  type="date"
                  className={styles.dateInput}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleEndDateChange}
                  aria-label="End date"
                />
              </div>
              <div>
                <Button
                  variant="primary"
                  onPress={handleSubmitCustomDates}
                  isDisabled={intervalString === null}
                >
                  Apply
                </Button>
              </div>
            </div>
            <div className={styles.presetList}>
              {windowOptions.map(opt => (
                <Button
                  key={opt.value}
                  className={styles.presetLink}
                  onPress={() => handleSubmitPresetDates(opt.value)}
                >
                  {opt.name}
                </Button>
              ))}
            </div>
          </div>
        </Popover>
      </DialogTrigger>
    </div>
  );
};

export default memo(SelectWindow);
