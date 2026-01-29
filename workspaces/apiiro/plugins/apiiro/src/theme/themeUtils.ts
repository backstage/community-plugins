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
import { Theme } from '@mui/material/styles';

/**
 * Valid MUI grey palette keys.
 */
type GreyKey =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | 'A100'
  | 'A200'
  | 'A400'
  | 'A700';

/**
 * Light mode color palette for the Apiiro plugin.
 */
const lightPalette = {
  risk: {
    critical: '#bc0e4d',
    high: '#f2405e',
    medium: '#ffa70f',
    low: '#ffe366',
  },
  riskStatus: {
    open: '#f2405e',
    accepted: '#00d0b3',
  },
  trend: {
    positive: { line: '#f44336', background: '#fde7eb', text: '#9d0b23' },
    negative: { line: '#2eefd9', background: '#d9fcf8', text: '#09776a' },
    neutral: { line: '#769cd6', background: '#ebf1fa', text: '#012b70' },
  },
  activity: {
    active: '#11e4cb',
  },
  businessImpact: {
    high: '#d32f2f',
    medium: '#f57c00',
    low: '#388e3c',
  },
  gauge: {
    success: '#2eefd9',
    warning: '#f2405e',
  },
  sla: {
    breach: '#f2405e',
    adherence: '#a8c5ff',
  },
  blueVariants: [
    '#012b70',
    '#2e5a9e',
    '#769cd6',
    '#9db9e2',
    '#b3c9e9',
    '#c5d7ef',
    '#d5e2f4',
    '#e1eaf8',
    '#ebf1fa',
    '#f2f6fd',
    '#f7fafe',
    '#f9fbff',
  ],
  avatar: [
    '#1976d2',
    '#388e3c',
    '#f57c00',
    '#7b1fa2',
    '#c62828',
    '#00796b',
    '#5d4037',
    '#455a64',
  ],
  logo: {
    background: '#E6E6E6',
    fill: '#21263F',
  },
  countBadge: {
    background: '#dfe4ff',
    text: '#2b3ba8',
  },
  spinner: '#2eefd9',
  other: '#e2e2e9',
  header: '#21263F',
  // Grey palette indices for light mode
  grey: {
    riskAutoIgnored: 600 as GreyKey,
    riskStatusIgnored: 500 as GreyKey,
    activityInactive: 400 as GreyKey,
    businessImpactDefault: 600 as GreyKey,
    gaugeBackground: 100 as GreyKey,
    slaNotSet: 300 as GreyKey,
    other: 700 as GreyKey,
    searchBackground: 50 as GreyKey,
    searchBorder: 300 as GreyKey,
    searchHoverBorder: 400 as GreyKey,
    codeBackground: 100 as GreyKey,
    codeBorder: 400 as GreyKey,
  },
};

/**
 * Dark mode color palette for the Apiiro plugin.
 */
const darkPalette = {
  risk: {
    critical: '#d40f57ff',
    high: '#f14763ff',
    medium: '#ffb84d',
    low: '#ffe680',
  },
  riskStatus: {
    open: '#f2405e',
    accepted: '#00d0b3',
  },
  trend: {
    positive: {
      line: '#ff7b8f',
      background: 'rgba(244, 67, 54, 0.2)',
      text: '#ffb3bf',
    },
    negative: {
      line: '#4dffd9',
      background: 'rgba(46, 239, 217, 0.2)',
      text: '#80ffe6',
    },
    neutral: {
      line: '#a3c4f3',
      background: 'rgba(118, 156, 214, 0.2)',
      text: '#c4d9f7',
    },
  },
  activity: {
    active: '#4dffd9',
  },
  businessImpact: {
    high: '#ff6b6b',
    medium: '#ffb84d',
    low: '#69db7c',
  },
  gauge: {
    success: '#4dffd9',
    warning: '#ff7b8f',
  },
  sla: {
    breach: '#ff7b8f',
    adherence: '#a3c4f3',
  },
  blueVariants: [
    '#4a7fc7',
    '#5d8fd4',
    '#709fe0',
    '#83afec',
    '#96bff8',
    '#a9cfff',
    '#bcdfff',
    '#cfefff',
    '#e2f5ff',
    '#f0faff',
    '#f7fcff',
    '#fafeff',
  ],
  avatar: [
    '#5c9ce6',
    '#5cb85c',
    '#f5a623',
    '#9b59b6',
    '#e74c3c',
    '#1abc9c',
    '#8b6914',
    '#7f8c8d',
  ],
  countBadge: {
    background: 'rgba(25, 118, 210, 0.2)', // primary.main with 0.2 alpha
    text: '#64b5f6', // primary.light
  },
  logo: {
    background: 'rgba(255, 255, 255, 0.1)', // white with 0.1 alpha
    fill: '#ffffff',
  },
  spinner: '#2eefd9',
  other: '#616161', // grey[700]
  header: '#21263F', // background.paper in dark mode
  // Grey palette indices for dark mode
  grey: {
    riskAutoIgnored: 400 as GreyKey,
    riskStatusIgnored: 400 as GreyKey,
    activityInactive: 500 as GreyKey,
    businessImpactDefault: 400 as GreyKey,
    gaugeBackground: 300 as GreyKey,
    slaNotSet: 600 as GreyKey,
    other: 700 as GreyKey,
    searchBackground: 900 as GreyKey,
    searchBorder: 700 as GreyKey,
    searchHoverBorder: 600 as GreyKey,
    codeBackground: 900 as GreyKey,
    codeBorder: 700 as GreyKey,
  },
};

/**
 * Gets the appropriate color palette based on theme mode.
 */
const getPalette = (theme: Theme) =>
  theme.palette.mode === 'dark' ? darkPalette : lightPalette;

/**
 * Theme-aware semantic colors for risk levels.
 * These colors are designed to work in both light and dark modes.
 */
export const getRiskColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    critical: palette.risk.critical,
    high: palette.risk.high,
    medium: palette.risk.medium,
    low: palette.risk.low,
    autoIgnored: theme.palette.grey[palette.grey.riskAutoIgnored],
  };
};

/**
 * Theme-aware semantic colors for risk status.
 */
export const getRiskStatusColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    open: palette.riskStatus.open,
    accepted: palette.riskStatus.accepted,
    ignored: theme.palette.grey[palette.grey.riskStatusIgnored],
  };
};

/**
 * Theme-aware colors for trend indicators (positive/negative/neutral).
 */
export const getTrendColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    positive: palette.trend.positive,
    negative: palette.trend.negative,
    neutral: palette.trend.neutral,
  };
};

/**
 * Theme-aware colors for activity status indicator.
 */
export const getActivityStatusColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    active: palette.activity.active,
    inactive: theme.palette.grey[palette.grey.activityInactive],
  };
};

/**
 * Theme-aware colors for business impact levels.
 */
export const getBusinessImpactColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    high: palette.businessImpact.high,
    medium: palette.businessImpact.medium,
    low: palette.businessImpact.low,
    default: theme.palette.grey[palette.grey.businessImpactDefault],
  };
};

/**
 * Theme-aware colors for gauge chart.
 */
export const getGaugeColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    success: palette.gauge.success,
    warning: palette.gauge.warning,
    background: theme.palette.grey[palette.grey.gaugeBackground],
    pointer: theme.palette.text.primary,
  };
};

/**
 * Theme-aware colors for SLA adherence chart.
 */
export const getSlaColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    breach: palette.sla.breach,
    adherence: palette.sla.adherence,
    notSet: theme.palette.grey[palette.grey.slaNotSet],
  };
};

/**
 * Theme-aware blue color variants for charts (e.g., TopLanguagesTile).
 */
export const getBlueColorVariants = (theme: Theme) => {
  const palette = getPalette(theme);
  return palette.blueVariants;
};

/**
 * Theme-aware "other" color for charts.
 */
export const getOtherColor = (theme: Theme) => {
  const palette = getPalette(theme);
  return palette.other || theme.palette.grey[palette.grey.other];
};

/**
 * Theme-aware colors for logo container.
 */
export const getLogoContainerColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    background: palette.logo.background,
    logoFill: palette.logo.fill,
  };
};

/**
 * Theme-aware colors for avatar backgrounds.
 */
export const getAvatarColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return palette.avatar;
};

/**
 * Theme-aware colors for count badge.
 */
export const getCountBadgeColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    background: palette.countBadge.background,
    text: palette.countBadge.text,
  };
};

/**
 * Theme-aware colors for search toolbar.
 */
export const getSearchToolbarColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    iconColor: theme.palette.text.secondary,
    backgroundColor: theme.palette.grey[palette.grey.searchBackground],
    borderColor: theme.palette.grey[palette.grey.searchBorder],
    hoverBorderColor: theme.palette.grey[palette.grey.searchHoverBorder],
    focusBorderColor: theme.palette.primary.main,
  };
};

/**
 * Theme-aware colors for text (used in typography).
 */
export const getTypographyColors = (theme: Theme) => {
  return {
    primary: theme.palette.text.primary,
    secondary: theme.palette.text.secondary,
    disabled: theme.palette.text.disabled,
  };
};

/**
 * Theme-aware colors for code blocks.
 */
export const getCodeBlockColors = (theme: Theme) => {
  const palette = getPalette(theme);
  return {
    background: theme.palette.grey[palette.grey.codeBackground],
    border: theme.palette.grey[palette.grey.codeBorder],
  };
};

/**
 * Theme-aware spinner color.
 */
export const getSpinnerColor = (theme: Theme) => {
  const palette = getPalette(theme);
  return palette.spinner;
};

/**
 * Theme-aware header background color.
 */
export const getHeaderBackground = (theme: Theme) => {
  const palette = getPalette(theme);
  return palette.header || theme.palette.background.paper;
};
