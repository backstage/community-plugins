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
import { MouseEvent, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import { alpha } from '@mui/material/styles';

import {
  CalendarDatePicker,
  CalendarDateValue,
  CalendarQuickRange,
} from '../CalendarDatePicker';

type DiscoveredOnFilterProps = {
  label?: string;
  value: CalendarDateValue;
  quickRanges: CalendarQuickRange[];
  selectedQuickRange: string;
  onChange: (value: CalendarDateValue) => void;
  onQuickRangeSelect: (range: CalendarQuickRange) => void;
  loading?: boolean;
};

const hasCompleteRange = (value: CalendarDateValue): value is [Date, Date] => {
  if (!Array.isArray(value)) {
    return false;
  }
  const [start, end] = value;
  return start instanceof Date && end instanceof Date;
};

// Helper function to calculate the difference between two dates in years
const getYearsDifference = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime());

  // Convert to years (365.25 days per year to account for leap years)
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

  return diffYears;
};

// Helper function to format the date range span with years and days
const formatDateRangeSpan = (startDate: Date, endDate: Date): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate the difference in milliseconds
  const diffTime = Math.abs(end.getTime() - start.getTime());

  // Convert to total days
  const totalDays = diffTime / (1000 * 60 * 60 * 24);

  // Calculate years and remaining days
  const years = Math.floor(totalDays / 365.25);
  const remainingDays = Math.floor(totalDays % 365.25);

  if (years > 0) {
    return `${years} year${years !== 1 ? 's' : ''} and ${remainingDays} day${
      remainingDays !== 1 ? 's' : ''
    }`;
  }

  return `${Math.floor(totalDays)} day${
    Math.floor(totalDays) !== 1 ? 's' : ''
  }`;
};

// Maximum allowed range in years
const MAX_RANGE_YEARS = 10;

export const DiscoveredOnFilter = ({
  label = 'Discovered on',
  value,
  quickRanges,
  selectedQuickRange,
  onChange,
  onQuickRangeSelect,
  loading = false,
}: DiscoveredOnFilterProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const skipCloseRef = useRef(false);

  const isOpen = Boolean(anchorEl);

  const displayLabel = useMemo(() => {
    if (selectedQuickRange !== 'custom') {
      const preset = quickRanges.find(
        range => range.value === selectedQuickRange,
      );
      if (preset) {
        return `${label}: ${preset.label}`;
      }
    }

    if (hasCompleteRange(value)) {
      const [from, to] = value;
      const formatDate = (date: Date) =>
        date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      return `${label}: ${formatDate(from)} – ${formatDate(to)}`;
    }

    return label;
  }, [label, quickRanges, selectedQuickRange, value]);

  const hasSelection = displayLabel !== label;

  const handleToggle = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(prev => (prev ? null : event.currentTarget));
  };

  const handleClose = () => {
    setAnchorEl(null);
    setValidationError(null); // Clear validation error when dropdown closes
  };

  const handleCalendarChange = (nextValue: CalendarDateValue) => {
    // Clear any previous validation errors
    setValidationError(null);

    // Validate the date range if it's complete
    if (hasCompleteRange(nextValue)) {
      const [startDate, endDate] = nextValue;
      const yearsDiff = getYearsDifference(startDate, endDate);

      if (yearsDiff > MAX_RANGE_YEARS) {
        const spanText = formatDateRangeSpan(startDate, endDate);
        setValidationError(
          `Date range cannot exceed ${MAX_RANGE_YEARS} years. Current selection spans ${spanText}.`,
        );
        return; // Don't proceed with the change
      }
    }

    onChange(nextValue);

    const shouldSkipClose = skipCloseRef.current;
    skipCloseRef.current = false;

    if (shouldSkipClose) {
      return;
    }

    if (hasCompleteRange(nextValue)) {
      handleClose();
    }
  };

  const handleQuickRangeClick = (range: CalendarQuickRange) => {
    // Clear any previous validation errors
    setValidationError(null);

    // Validate the quick range if it's not custom
    if (range.value !== 'custom') {
      const rangeValue = range.getRange();
      if (rangeValue && hasCompleteRange(rangeValue)) {
        const [startDate, endDate] = rangeValue;
        const yearsDiff = getYearsDifference(startDate, endDate);

        if (yearsDiff > MAX_RANGE_YEARS) {
          const spanText = formatDateRangeSpan(startDate, endDate);
          setValidationError(
            `"${range.label}" preset spans ${spanText}, which exceeds ${MAX_RANGE_YEARS} years limit. Please use a custom range.`,
          );
          return; // Don't proceed with the selection
        }
      }
    }

    skipCloseRef.current = range.value !== 'custom';
    onQuickRangeSelect(range);
  };

  const handleClear = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    skipCloseRef.current = false;
    setValidationError(null); // Clear any validation errors
    onChange([]);
    handleClose();
  };

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        width={140}
        height={36}
        sx={{
          borderRadius: 999,
        }}
      />
    );
  }

  return (
    <Box data-testid="discovered-on-filter" sx={{ position: 'relative' }}>
      <ButtonBase
        className="discovered-on-button"
        onClick={handleToggle}
        sx={theme => {
          const primaryMain = theme.palette.primary.main;
          const closedBorder = theme.palette.divider;
          const isDark = theme.palette.mode === 'dark';
          const hoverBackground = alpha(primaryMain, isDark ? 0.28 : 0.12);
          const selectedBorder = isDark
            ? theme.palette.primary.light
            : theme.palette.primary.dark;
          const selectedBackground = alpha(primaryMain, isDark ? 0.2 : 0.06);

          let backgroundColor = theme.palette.background.paper;
          if (isOpen) {
            backgroundColor = hoverBackground;
          } else if (hasSelection) {
            backgroundColor = selectedBackground;
          }

          let borderColor = closedBorder;
          if (isOpen) {
            borderColor = primaryMain;
          } else if (hasSelection) {
            borderColor = selectedBorder;
          }

          let boxShadow = 'none';
          if (isOpen) {
            boxShadow = '0 4px 12px rgba(38, 54, 140, 0.18)';
          } else if (hasSelection) {
            boxShadow = '0 2px 8px rgba(38, 54, 140, 0.12)';
          }

          return {
            borderRadius: 999,
            padding: theme.spacing(0.75, 1.75),
            border: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backgroundColor,
            boxShadow,
            transition: 'all 0.2s ease',
            minHeight: 38,
          };
        }}
      >
        <Typography
          variant="body2"
          sx={theme => ({
            whiteSpace: 'nowrap',
            color: theme.palette.text.primary,
          })}
        >
          {displayLabel}
        </Typography>
        {hasSelection ? (
          <Tooltip title="Clear and remove filter">
            <IconButton
              size="small"
              onClick={handleClear}
              sx={theme => ({
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              })}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        ) : null}
        <KeyboardArrowDownIcon
          fontSize="small"
          sx={theme => ({
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            color: hasSelection
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
          })}
        />
      </ButtonBase>
      <Popper
        open={isOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: { offset: [0, 8] },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Box sx={{ mt: 1 }}>
            <CalendarDatePicker
              value={value}
              onChange={handleCalendarChange}
              selectedQuickRange={selectedQuickRange}
              onQuickRangeSelect={handleQuickRangeClick}
              quickRanges={quickRanges}
            />
            {validationError && (
              <Box
                sx={{
                  mt: 1,
                  p: 1,
                  backgroundColor: 'error.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'error.main',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'error.contrastText',
                    fontWeight: 500,
                  }}
                >
                  {validationError}
                </Typography>
              </Box>
            )}
          </Box>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};
