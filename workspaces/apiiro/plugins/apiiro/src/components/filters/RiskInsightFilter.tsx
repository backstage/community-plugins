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
import { MouseEvent, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Popper from '@mui/material/Popper';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import { SimpleTooltip } from '../SimpleTooltip';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { alpha, styled, Theme, useTheme } from '@mui/material/styles';
import type {
  RiskInsightFilterProps,
  RiskInsightOption,
} from './RiskInsightFilter.types';
import { FilterDropdownSearch } from './FilterDropdownSearch';
import { FilterDropdownClear } from './FilterDropdownClear';
import { getCountBadgeColors } from '../../theme/themeUtils';

const GROUP_DISPLAY_LIMIT = 5;
const GROUP_OPTION_LIMIT = 4;

const DropdownButton = styled(ButtonBase, {
  shouldForwardProp: prop => prop !== 'open' && prop !== 'hasSelection',
})<{ open: boolean; hasSelection: boolean }>(
  ({ theme, open, hasSelection }) => {
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

    let hoverColor = hoverBackground;
    if (hasSelection) {
      hoverColor = alpha(primaryMain, isDark ? 0.24 : 0.1);
    }

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
  },
);

const sentimentPalette = (theme: Theme, sentiment: string) => {
  const normalized = (sentiment || '').toLowerCase();
  if (normalized === 'positive') {
    return {
      color: theme.palette.success.main,
      background: alpha(theme.palette.success.main, 0.12),
    };
  }
  if (normalized === 'negative') {
    return {
      color: theme.palette.error.main,
      background: alpha(theme.palette.error.main, 0.12),
    };
  }
  if (normalized === 'neutral') {
    return {
      color: theme.palette.info.main,
      background: alpha(theme.palette.info.main, 0.12),
    };
  }
  return {
    color: theme.palette.text.secondary,
    background: alpha(theme.palette.text.secondary, 0.15),
  };
};

const sortByPriority = (options: RiskInsightOption[]) => {
  return [...options].sort((a, b) => {
    const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return a.displayName.localeCompare(b.displayName);
  });
};

const groupOptions = (options: RiskInsightOption[]) => {
  const groups = new Map<string, RiskInsightOption[]>();
  options.forEach(option => {
    const list = groups.get(option.group) ?? [];
    list.push(option);
    groups.set(option.group, list);
  });

  return [...groups.entries()]
    .map(([groupName, groupItems]) => ({
      groupName,
      groupOrder: groupItems[0]?.groupOrder ?? Number.MAX_SAFE_INTEGER,
      options: sortByPriority(groupItems),
    }))
    .sort((a, b) => {
      if (a.groupOrder !== b.groupOrder) {
        return (
          (a.groupOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.groupOrder ?? Number.MAX_SAFE_INTEGER)
        );
      }
      return a.groupName.localeCompare(b.groupName);
    });
};

export const RiskInsightFilter = ({
  label,
  options,
  selectedValues,
  onChange,
  loading = false,
  clearLabel = 'Clear selection',
}: RiskInsightFilterProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedOptions, setExpandedOptions] = useState<
    Record<string, boolean>
  >({});

  const isOpen = Boolean(anchorEl);
  const hasSelection = selectedValues.length > 0;

  const groupedOptions = useMemo(() => groupOptions(options), [options]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) {
      return groupedOptions;
    }
    const lower = search.trim().toLowerCase();
    return groupedOptions
      .map(group => ({
        ...group,
        options: group.options.filter(
          option =>
            option.displayName.toLowerCase().includes(lower) ||
            option.group.toLowerCase().includes(lower),
        ),
      }))
      .filter(group => group.options.length > 0);
  }, [groupedOptions, search]);

  const hasMoreGroups = filteredGroups.length > GROUP_DISPLAY_LIMIT;
  const visibleGroups =
    showAll || search
      ? filteredGroups
      : filteredGroups.slice(0, GROUP_DISPLAY_LIMIT);

  const toggleGroup = (groupName: string) => {
    if (search) return; // keep groups expanded during search
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const toggleOptions = (groupName: string) => {
    setExpandedOptions(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const toggleOption = (name: string) => {
    const set = new Set(selectedValues);
    if (set.has(name)) {
      set.delete(name);
    } else {
      set.add(name);
    }
    onChange([...set]);
  };

  const handleToggle = (event: MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClear = () => {
    if (!selectedValues.length) {
      return;
    }
    setSearch('');
    onChange([]);
  };

  const selectedChipLabel = (() => {
    if (!hasSelection) {
      return label;
    }
    const firstSelectedName = selectedValues[0];
    const firstSelected = options.find(
      option => option.name === firstSelectedName,
    );
    const firstLabel = firstSelected?.displayName ?? firstSelectedName;
    const remainingCount = selectedValues.length - 1;
    if (remainingCount > 0) {
      return `${label}: ${firstLabel} (+${remainingCount})`;
    }
    return `${label}: ${firstLabel}`;
  })();

  const additionalCount =
    selectedValues.length > 1 ? selectedValues.length - 1 : 0;

  const remainingItemsTooltip = useMemo(() => {
    if (selectedValues.length <= 1) {
      return '';
    }
    const remainingItems = selectedValues.slice(1).map(value => {
      const option = options.find(opt => opt.name === value);
      return option?.displayName ?? value;
    });
    return remainingItems.join(', ');
  }, [selectedValues, options]);

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
        onClick={handleToggle}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.primary,
            whiteSpace: 'nowrap',
          }}
        >
          {selectedChipLabel.replace(/ \(\+\d+\)$/, '')}
        </Typography>
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
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 26,
                px: 1,
                py: 0.25,
                borderRadius: 999,
                backgroundColor: getCountBadgeColors(theme).background,
                color: getCountBadgeColors(theme).text,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {`+${additionalCount}`}
            </Box>
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
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            sx={{
              borderRadius: 3,
              boxShadow: '0 16px 32px rgba(31, 45, 98, 0.18)',
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.common.black, 0.08)}`,
            }}
          >
            <Box
              sx={{
                p: 2,
                pb: 1,
              }}
            >
              <FilterDropdownSearch
                value={search}
                onChange={setSearch}
                placeholder="Search..."
              />
            </Box>

            <Box sx={{ px: 1, pt: 1, pb: 1.5 }}>
              {filteredGroups.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, py: 1 }}
                >
                  No insights found
                </Typography>
              ) : (
                <>
                  <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                    {visibleGroups.map(group => {
                      const isExpanded = search
                        ? true
                        : expandedGroups[group.groupName] ?? false;
                      const isOptionExpanded =
                        expandedOptions[group.groupName] ?? false;
                      const optionsToRender =
                        isOptionExpanded || search
                          ? group.options
                          : group.options.slice(0, GROUP_OPTION_LIMIT);
                      const hasMoreOptions =
                        group.options.length > GROUP_OPTION_LIMIT;
                      return (
                        <Box key={group.groupName}>
                          <ListItemButton
                            disableRipple
                            onClick={() => toggleGroup(group.groupName)}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              '&:hover': {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.04,
                                ),
                              },
                            }}
                          >
                            <ListItemText
                              primaryTypographyProps={{
                                fontSize: 12,
                                letterSpacing: 0.6,
                                color: alpha(theme.palette.text.primary, 0.85),
                                textTransform: 'uppercase',
                              }}
                              primary={`${group.groupName} (${group.options.length})`}
                            />
                            <KeyboardArrowRightIcon
                              sx={{
                                transition: 'transform 0.2s ease',
                                transform: isExpanded
                                  ? 'rotate(90deg)'
                                  : 'none',
                                color: alpha(theme.palette.text.primary, 0.6),
                              }}
                            />
                          </ListItemButton>
                          <Collapse
                            in={isExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            <List disablePadding sx={{ px: 2, py: 1 }}>
                              {optionsToRender.map(option => {
                                const palette = sentimentPalette(
                                  theme,
                                  option.sentiment,
                                );
                                return (
                                  <ListItemButton
                                    key={option.name}
                                    onClick={() => toggleOption(option.name)}
                                    sx={{
                                      display: 'flex',
                                      py: 0,
                                      borderRadius: 2,
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      width: '100%',
                                    }}
                                    dense
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flex: 1,
                                        minWidth: 0,
                                      }}
                                    >
                                      <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Checkbox
                                          edge="start"
                                          tabIndex={-1}
                                          disableRipple
                                          checked={selectedValues.includes(
                                            option.name,
                                          )}
                                        />
                                      </ListItemIcon>
                                      <Chip
                                        label={option.displayName}
                                        size="small"
                                        sx={{
                                          mb: 0,
                                          fontWeight: 600,
                                          color: palette.color,
                                          backgroundColor: palette.background,
                                          borderRadius: 2,
                                          maxWidth: '100%',
                                          '& .MuiChip-label': {
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                          },
                                        }}
                                      />
                                    </Box>
                                    <SimpleTooltip
                                      title={
                                        option.description || 'No description'
                                      }
                                      placement="top"
                                      tooltipProps={{
                                        componentsProps: {
                                          tooltip: {
                                            sx: {
                                              whiteSpace: 'pre-wrap',
                                              maxWidth: '300px',
                                              wordBreak: 'break-word',
                                            },
                                          },
                                        },
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        sx={{ ml: 0.5, flexShrink: 0 }}
                                      >
                                        <InfoOutlinedIcon fontSize="small" />
                                      </IconButton>
                                    </SimpleTooltip>
                                  </ListItemButton>
                                );
                              })}
                            </List>
                            {hasMoreOptions && !search && (
                              <Link
                                component="button"
                                type="button"
                                underline="hover"
                                onClick={() => toggleOptions(group.groupName)}
                                sx={{
                                  mx: 2,
                                  mb: 1,
                                  display: 'inline-flex',
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: theme.palette.primary.main,
                                  textUnderlineOffset: '2px',
                                }}
                              >
                                {isOptionExpanded
                                  ? 'Show less'
                                  : 'Show full list'}
                              </Link>
                            )}
                          </Collapse>
                          <Divider
                            sx={{
                              borderColor: alpha(theme.palette.divider, 0.1),
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>

                  {hasMoreGroups && !search && (
                    <Link
                      alignSelf="center"
                      component="button"
                      type="button"
                      underline="hover"
                      onClick={() => setShowAll(prev => !prev)}
                      sx={{
                        mt: 1,
                        fontSize: 13,
                        fontWeight: 500,
                        color: theme.palette.primary.main,
                        textUnderlineOffset: '2px',
                      }}
                    >
                      {showAll ? 'Hide full list' : 'Show full list'}
                    </Link>
                  )}
                </>
              )}
            </Box>

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
