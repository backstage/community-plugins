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
import Calendar from 'react-calendar';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { alpha, styled } from '@mui/material/styles';

export const CalendarContainer = styled('div')(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  const surface = theme.palette.background.paper;
  const borderColor = isDark
    ? alpha(theme.palette.common.white, 0.08)
    : alpha(theme.palette.primary.main, 0.12);
  const shadow = isDark
    ? '0 24px 48px rgba(8, 12, 41, 0.5)'
    : '0 24px 48px rgba(38, 54, 140, 0.16)';

  return {
    display: 'flex',
    alignItems: 'stretch',
    gap: theme.spacing(2),
    padding: theme.spacing(2.5),
    borderRadius: theme.spacing(3),
    backgroundColor: surface,
    border: `1px solid ${borderColor}`,
    boxShadow: shadow,
    width: 'fit-content',
    maxWidth: '100%',
  };
});

export const StyledCalendar = styled(Calendar)(({ theme }) => {
  const primary = theme.palette.primary.main;
  const primarySoft = alpha(
    primary,
    theme.palette.mode === 'dark' ? 0.28 : 0.16,
  );
  const rangeSoft = alpha(primary, theme.palette.mode === 'dark' ? 0.24 : 0.12);
  const hoverSoft = alpha(primary, theme.palette.mode === 'dark' ? 0.32 : 0.18);

  return {
    '&.react-calendar': {
      border: 'none',
      width: 280,
      backgroundColor: 'transparent',
    },
    '& .react-calendar__navigation': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(2.5),
      button: {
        minWidth: theme.spacing(4.5),
        minHeight: theme.spacing(4.5),
        borderRadius: theme.spacing(2.5),
        border: 'none',
        backgroundColor: 'transparent',
        color: theme.palette.text.secondary,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover:not(:disabled)': {
          backgroundColor: hoverSoft,
          color: primary,
        },
        '&:disabled': {
          opacity: 0.4,
          cursor: 'not-allowed',
        },
      },
      '.react-calendar__navigation__label': {
        fontWeight: 700,
        fontSize: 18,
        color: theme.palette.text.primary,
      },
    },
    '& .react-calendar__month-view__weekdays': {
      textTransform: 'uppercase',
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.4,
      color: alpha(theme.palette.text.secondary, 0.8),
      abbr: {
        textDecoration: 'none',
      },
    },
    '& .react-calendar__tile': {
      height: 40,
      borderRadius: theme.spacing(3),
      padding: 0,
      fontWeight: 500,
      color: theme.palette.text.primary,
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden',
      '> abbr': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
      },
      '&:hover:not(:disabled)': {
        backgroundColor: hoverSoft,
        color: primary,
      },
      '&:disabled': {
        color: alpha(theme.palette.text.disabled, 0.7),
        backgroundColor: 'transparent',
      },
    },
    '& .react-calendar__tile--now': {
      border: `1px solid ${alpha(primary, 0.5)}`,
      borderRadius: theme.spacing(3),
      backgroundColor: 'inherit',
    },
    '& .react-calendar__tile--active': {
      backgroundColor: primarySoft,
      color: primary,
    },
    '& .react-calendar__month-view .react-calendar__tile--range': {
      backgroundColor: rangeSoft,
      color: primary,
      borderRadius: 0,
    },
    '& .react-calendar__month-view .react-calendar__tile--rangeStart': {
      backgroundColor: rangeSoft,
      color: primary,
      borderRadius: `${theme.spacing(3)} 0 0 ${theme.spacing(3)}`,
      '> abbr': {
        backgroundColor: primary,
        color: theme.palette.primary.contrastText,
        borderRadius: '50%',
        width: 32,
        height: 32,
        margin: 'auto',
      },
    },
    '& .react-calendar__month-view .react-calendar__tile--rangeEnd': {
      backgroundColor: rangeSoft,
      color: primary,
      borderRadius: `0 ${theme.spacing(3)} ${theme.spacing(3)} 0`,
      '> abbr': {
        backgroundColor: primary,
        color: theme.palette.primary.contrastText,
        borderRadius: '50%',
        width: 32,
        height: 32,
        margin: 'auto',
      },
    },
    '& .react-calendar__month-view__days__day--neighboringMonth': {
      color: alpha(theme.palette.text.disabled, 0.8),
    },
    '& .react-calendar__year-view .react-calendar__tile, & .react-calendar__decade-view .react-calendar__tile, & .react-calendar__century-view .react-calendar__tile':
      {
        height: 64,
      },
  };
});

export const QuickRangeList = styled(List)(({ theme }) => ({
  width: 160,
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const QuickRangeItem = styled(ListItemButton)<{ $selected?: boolean }>(
  ({ theme, $selected }) => {
    const primary = theme.palette.primary.main;
    const isDark = theme.palette.mode === 'dark';
    const inactiveBackground = isDark
      ? alpha(primary, 0.16)
      : alpha(primary, 0.06);
    const hoverBackground = isDark
      ? alpha(primary, 0.28)
      : alpha(primary, 0.12);

    return {
      borderRadius: theme.spacing(2),
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: theme.spacing(1, 1.75),
      minHeight: 44,
      border: `1px solid ${
        $selected ? alpha(primary, 0.48) : alpha(primary, 0.16)
      }`,
      backgroundColor: $selected ? primary : inactiveBackground,
      color: $selected
        ? theme.palette.primary.contrastText
        : theme.palette.text.secondary,
      fontWeight: $selected ? 700 : 500,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: $selected ? primary : hoverBackground,
        color: $selected ? theme.palette.primary.contrastText : primary,
      },
    };
  },
);

export const QuickRangeText = styled(ListItemText)(({ theme }) => ({
  '.MuiListItemText-primary': {
    fontSize: 14,
    fontWeight: 600,
  },
  '.MuiListItemText-secondary': {
    fontSize: 12,
    color: theme.palette.text.secondary,
  },
}));
