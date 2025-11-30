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
import { cloneElement, isValidElement, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { FilterDropdownSearch } from './FilterDropdownSearch';
import { FilterDropdownClear } from './FilterDropdownClear';
import { FilterDropdownList } from './FilterDropdownList';
import { FilterDropdownProps } from './FilterDropdown.types';
import { SimpleTooltip } from '../SimpleTooltip';

type DropdownButtonProps = {
  open: boolean;
  hasSelection: boolean;
};

const DropdownButton = styled(ButtonBase, {
  shouldForwardProp: prop => prop !== 'open' && prop !== 'hasSelection',
})<DropdownButtonProps>(({ theme, open, hasSelection }) => {
  const primaryMain = theme.palette.primary.main;
  const closedBorder = theme.palette.divider;
  const isDark = theme.palette.mode === 'dark';
  const hoverBackground = alpha(primaryMain, isDark ? 0.28 : 0.12);
  const selectedBorder = isDark
    ? theme.palette.primary.light
    : theme.palette.primary.dark;
  const selectedBackground = alpha(primaryMain, isDark ? 0.2 : 0.06);
  let buttonBackground = theme.palette.background.paper;
  if (open) {
    buttonBackground = hoverBackground;
  } else if (hasSelection) {
    buttonBackground = selectedBackground;
  }

  let borderColor = closedBorder;
  if (open) {
    borderColor = primaryMain;
  } else if (hasSelection) {
    borderColor = selectedBorder;
  }

  let boxShadow = 'none';
  if (open) {
    boxShadow = '0 4px 12px rgba(38, 54, 140, 0.18)';
  } else if (hasSelection) {
    boxShadow = '0 2px 8px rgba(38, 54, 140, 0.12)';
  }

  const hoverColor = hasSelection
    ? alpha(primaryMain, isDark ? 0.24 : 0.1)
    : hoverBackground;

  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 1.5),
    borderRadius: 999,
    border: `1px solid ${borderColor}`,
    backgroundColor: buttonBackground,
    transition: 'all 0.2s ease',
    boxShadow,
    '&:hover': {
      backgroundColor: hoverColor,
    },
    '& .MuiSvgIcon-root': {
      fontSize: 18,
      color: hasSelection
        ? theme.palette.primary.main
        : theme.palette.text.secondary,
    },
  };
});

const CountBadge = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 26,
  padding: theme.spacing(0.25, 1),
  borderRadius: 999,
  backgroundColor: '#dfe4ff',
  color: '#2b3ba8',
  fontSize: 12,
  fontWeight: 600,
}));

export const FilterDropdown = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
  searchPlaceholder = 'Search…',
  clearLabel = 'Clear selection',
  loading = false,
}: FilterDropdownProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const theme = useTheme();

  const optionLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    options.forEach(option => {
      map.set(option.value, option.label);
    });
    return map;
  }, [options]);

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const firstSelectedOption = useMemo(() => {
    const firstValue = selectedValues[0];
    if (!firstValue) {
      return undefined;
    }
    return options.find(option => option.value === firstValue);
  }, [options, selectedValues]);

  const firstSelectionLabel = useMemo(() => {
    const firstValue = selectedValues[0];
    return firstValue ? optionLabelMap.get(firstValue) : undefined;
  }, [optionLabelMap, selectedValues]);

  const firstSelectionIcon = useMemo(() => {
    const icon = firstSelectedOption?.icon;
    if (!icon) {
      return undefined;
    }
    if (isValidElement(icon)) {
      return cloneElement(icon, { key: 'selected-icon' });
    }
    return icon;
  }, [firstSelectedOption]);

  const additionalCount =
    selectedValues.length > 1 ? selectedValues.length - 1 : 0;

  const remainingItemsTooltip = useMemo(() => {
    if (selectedValues.length <= 1) {
      return '';
    }
    const remainingItems = selectedValues.slice(1).map(value => {
      const option = options.find(opt => opt.value === value);
      return option?.label ?? value;
    });
    return remainingItems.join(', ');
  }, [selectedValues, options]);

  const hasSelection = selectedValues.length > 0;

  const filteredOptions = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    if (!normalizedSearch) {
      return options;
    }
    return options.filter(option =>
      option.label.toLowerCase().includes(normalizedSearch),
    );
  }, [options, searchValue]);

  const handleToggle = (value: string) => {
    const next = new Set(selectedValues);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    const ordered = options
      .filter(option => next.has(option.value))
      .map(option => option.value);
    onChange(ordered);
  };

  const handleClear = () => {
    if (!selectedValues.length) {
      return;
    }
    setSearchValue('');
    onChange([]);
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
      setSearchValue('');
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchValue('');
  };

  const isOpen = Boolean(anchorEl);

  if (loading) {
    return (
      <Skeleton
        variant="rounded"
        width={120}
        height={36}
        sx={{
          borderRadius: 999,
        }}
      />
    );
  }

  return (
    <>
      <DropdownButton
        open={isOpen}
        hasSelection={hasSelection}
        onClick={handleButtonClick}
        sx={{
          color: hasSelection
            ? theme.palette.primary.dark
            : theme.palette.text.secondary,
        }}
      >
        {hasSelection ? (
          <>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap',
              }}
            >
              {`${label}:`}
            </Typography>
            {firstSelectionIcon && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {firstSelectionIcon}
              </Box>
            )}
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap',
              }}
            >
              {firstSelectionLabel}
            </Typography>
          </>
        ) : (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.primary,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
        )}
        {additionalCount > 0 && (
          <SimpleTooltip
            title={remainingItemsTooltip}
            placement="top"
            tooltipProps={{
              componentsProps: {
                tooltip: {
                  sx: {
                    whiteSpace: 'normal',
                    maxWidth: '400px',
                  },
                },
              },
            }}
          >
            <CountBadge>{`+${additionalCount}`}</CountBadge>
          </SimpleTooltip>
        )}
        <KeyboardArrowDownIcon
          fontSize="small"
          sx={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            color: theme.palette.text.secondary,
          }}
        />
      </DropdownButton>

      <Popper
        open={isOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              borderRadius: 3,
              boxShadow: '0 16px 32px rgba(31, 45, 98, 0.18)',
              width: 280,
              maxHeight: 360,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2 }}>
              <FilterDropdownSearch
                value={searchValue}
                onChange={setSearchValue}
                placeholder={searchPlaceholder}
              />
            </Box>

            <FilterDropdownList
              options={filteredOptions}
              selectedValues={selectedSet}
              onToggle={handleToggle}
              placeholder={placeholder}
            />

            <FilterDropdownClear
              disabled={!hasSelection}
              label={clearLabel}
              onClear={handleClear}
            />
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};
