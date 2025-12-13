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
import 'react-calendar/dist/Calendar.css';

import { forwardRef, useCallback, useMemo } from 'react';
import { CalendarProps } from 'react-calendar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import {
  CalendarContainer,
  StyledCalendar,
  QuickRangeList,
  QuickRangeItem,
  QuickRangeText,
} from './CalendarDatePicker.styles';
import { LooseValue } from 'react-calendar/dist/cjs/shared/types';

type Value = Date | Date[] | null;

export type CalendarDateValue = Date | [Date, Date] | [];

export type CalendarQuickRange = {
  label: string;
  value: string;
  getRange: () => CalendarDateValue | null;
};

type CalendarDatePickerProps = {
  value?: CalendarDateValue;
  onChange?: (date: CalendarDateValue) => void;
  quickRanges?: CalendarQuickRange[];
  selectedQuickRange?: string;
  onQuickRangeSelect?: (quickRange: CalendarQuickRange) => void;
  showQuickRanges?: boolean;
  tileStyle?: (args: {
    date: Date;
    view: string;
  }) => globalThis.React.CSSProperties;
} & Pick<
  CalendarProps,
  | 'activeStartDate'
  | 'minDate'
  | 'maxDate'
  | 'tileClassName'
  | 'tileContent'
  | 'tileDisabled'
  | 'selectRange'
  | 'onActiveStartDateChange'
>;

export const createDefaultQuickRanges = (): CalendarQuickRange[] => {
  const today = new Date();

  const startOfDay = (date: Date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const endOfDay = (date: Date) => {
    const copy = new Date(date);
    copy.setHours(23, 59, 59, 999);
    return copy;
  };

  const subtractDays = (amount: number) => {
    const date = new Date();
    date.setDate(date.getDate() - amount);
    return date;
  };

  return [
    {
      label: 'All Dates',
      value: 'all',
      getRange: () => [subtractDays(365 * 10), endOfDay(new Date())],
    },
    {
      label: 'Last 7 days',
      value: 'last-7-days',
      getRange: () => [startOfDay(subtractDays(6)), endOfDay(today)],
    },
    {
      label: 'Last 14 days',
      value: 'last-14-days',
      getRange: () => [startOfDay(subtractDays(13)), endOfDay(today)],
    },
    {
      label: 'Last 30 days',
      value: 'last-30-days',
      getRange: () => [startOfDay(subtractDays(29)), endOfDay(today)],
    },
    {
      label: 'Last 90 days',
      value: 'last-90-days',
      getRange: () => [startOfDay(subtractDays(89)), endOfDay(today)],
    },
    {
      label: 'Custom',
      value: 'custom',
      getRange: () => [],
    },
  ];
};

export const CalendarDatePicker = forwardRef<
  HTMLDivElement,
  CalendarDatePickerProps
>(
  (
    {
      selectRange = true,
      showQuickRanges = true,
      quickRanges,
      selectedQuickRange,
      onQuickRangeSelect,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();

    const computedQuickRanges = useMemo(
      () => quickRanges ?? createDefaultQuickRanges(),
      [quickRanges],
    );

    const formatShortWeekday = useCallback(
      (locale: string | undefined, date: Date) =>
        date
          .toLocaleDateString(locale || 'en-US', { weekday: 'short' })
          .slice(0, 1),
      [],
    );

    const handleCalendarChange = useCallback(
      (calendarValue: Value) => {
        if (onChange) {
          onChange(calendarValue as CalendarDateValue);
        }
      },
      [onChange],
    );

    const handleQuickRangeSelect = (range: CalendarQuickRange) => {
      if (onQuickRangeSelect) {
        onQuickRangeSelect(range);
      }
      const nextValue = range.getRange();
      if (nextValue && onChange) {
        onChange(nextValue);
      }
    };

    return (
      <CalendarContainer ref={ref}>
        <StyledCalendar
          value={value as LooseValue}
          onChange={handleCalendarChange as any}
          selectRange={selectRange}
          formatShortWeekday={formatShortWeekday}
          prev2Label={null}
          next2Label={null}
          prevLabel={<ChevronLeftIcon />}
          nextLabel={<ChevronRightIcon />}
          minDetail="decade"
          {...props}
        />
        {showQuickRanges && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              Presets
            </Typography>
            <QuickRangeList>
              {computedQuickRanges.map(range => (
                <QuickRangeItem
                  key={range.value}
                  $selected={selectedQuickRange === range.value}
                  onClick={() => handleQuickRangeSelect(range)}
                >
                  <QuickRangeText primary={range.label} />
                </QuickRangeItem>
              ))}
            </QuickRangeList>
          </Box>
        )}
      </CalendarContainer>
    );
  },
);

CalendarDatePicker.displayName = 'CalendarDatePicker';
