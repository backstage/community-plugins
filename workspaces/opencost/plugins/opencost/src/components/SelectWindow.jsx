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
import { Box, Button, DialogTrigger, Flex, Popover, Text } from '@backstage/ui';
import { isValid } from 'date-fns';
import { find, get } from 'lodash';

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
    <Box m="2" style={{ width: '120px' }}>
      <Text
        as="label"
        variant="body-small"
        color="secondary"
        style={{ marginBottom: 'var(--bui-space-1)', display: 'block' }}
      >
        Date Range
      </Text>
      <DialogTrigger isOpen={open} onOpenChange={setOpen}>
        <Button variant="tertiary">{windowLabel}</Button>
        <Popover placement="bottom left" hideArrow>
          <Flex
            direction="row"
            gap="4"
            style={{
              padding:
                'var(--bui-space-3) var(--bui-space-4) var(--bui-space-4) var(--bui-space-4)',
              backgroundColor: 'var(--bui-bg-surface-1)',
            }}
          >
            <Flex direction="column" gap="3">
              <Box>
                <Text
                  as="label"
                  htmlFor="date-picker-start"
                  variant="body-small"
                  color="secondary"
                  style={{
                    marginBottom: 'var(--bui-space-1)',
                    display: 'block',
                  }}
                >
                  Start Date
                </Text>
                <input
                  id="date-picker-start"
                  type="date"
                  style={{
                    padding: 'var(--bui-space-2)',
                    border: '1px solid var(--bui-border)',
                    borderRadius: 'var(--bui-radius-2)',
                    backgroundColor: 'var(--bui-bg-surface-1)',
                    color: 'var(--bui-fg-primary)',
                    fontSize: 'var(--bui-font-size-2)',
                    width: '144px',
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleStartDateChange}
                  aria-label="Start date"
                />
              </Box>
              <Box>
                <Text
                  as="label"
                  htmlFor="date-picker-end"
                  variant="body-small"
                  color="secondary"
                  style={{
                    marginBottom: 'var(--bui-space-1)',
                    display: 'block',
                  }}
                >
                  End Date
                </Text>
                <input
                  id="date-picker-end"
                  type="date"
                  style={{
                    padding: 'var(--bui-space-2)',
                    border: '1px solid var(--bui-border)',
                    borderRadius: 'var(--bui-radius-2)',
                    backgroundColor: 'var(--bui-bg-surface-1)',
                    color: 'var(--bui-fg-primary)',
                    fontSize: 'var(--bui-font-size-2)',
                    width: '144px',
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleEndDateChange}
                  aria-label="End date"
                />
              </Box>
              <Box>
                <Button
                  variant="primary"
                  onPress={handleSubmitCustomDates}
                  isDisabled={intervalString === null}
                >
                  Apply
                </Button>
              </Box>
            </Flex>
            <Flex
              direction="column"
              gap="1"
              style={{
                paddingTop: 'var(--bui-space-3)',
                marginLeft: 'var(--bui-space-4)',
              }}
            >
              {windowOptions.map(opt => (
                <Button
                  key={opt.value}
                  variant="tertiary"
                  onPress={() => handleSubmitPresetDates(opt.value)}
                >
                  {opt.name}
                </Button>
              ))}
            </Flex>
          </Flex>
        </Popover>
      </DialogTrigger>
    </Box>
  );
};

export default memo(SelectWindow);
