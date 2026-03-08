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

import { Theme, alpha, SxProps } from '@mui/material/styles';

export const CARD_GAP = 16;

/** Main welcome screen container -- fills the scroll area, content flows top-down. */
export const getContainerSx = (theme: Theme): SxProps<Theme> => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 0',
  minHeight: 0,
  height: '100%',
  pt: 1,
  pb: 0.5,
  background: theme.palette.background.default,
  overflow: 'hidden',
});

/** Hero title + tagline. */
export const getHeroSx = (): SxProps<Theme> => ({
  textAlign: 'center',
  mb: 2.5,
  px: { xs: 2, sm: 3 },
});

/** Title text. */
export const getTitleSx = (primaryColor: string): SxProps<Theme> => ({
  fontWeight: 700,
  fontSize: { xs: '1.25rem', sm: '1.375rem' },
  letterSpacing: '-0.01em',
  color: primaryColor,
  mb: 0.25,
});

/** Swim lanes scrollable area -- grows to fill, left-aligned, constrained width. */
export const getSwimLanesContainerSx = (isDark: boolean): SxProps<Theme> => ({
  flex: '1 1 0',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  overflowX: 'clip',
  px: { xs: 2, sm: 3 },
  maxWidth: 1100,
  width: '100%',
  mx: 'auto',
  boxSizing: 'border-box',
  scrollbarWidth: 'thin',
  scrollbarColor: `${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} ${
    isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
  }`,
  '&::-webkit-scrollbar': { width: 8 },
  '&::-webkit-scrollbar-track': {
    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    borderRadius: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    '&:hover': {
      bgcolor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
    },
  },
});

/** Lane header icon (small colored square). */
export const getLaneIconSx = (
  theme: Theme,
  laneColor: string,
): SxProps<Theme> => ({
  width: 24,
  height: 24,
  borderRadius: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: laneColor,
  color: theme.palette.common.white,
  '& svg': { fontSize: 14 },
});

/** Individual swim lane card. */
export const getCardSx = (
  isDark: boolean,
  laneColor: string,
  isComingSoon: boolean,
): SxProps<Theme> => ({
  width: '100%',
  minHeight: 72,
  flexShrink: 0,
  position: 'relative',
  overflow: 'visible',
  backgroundColor: isDark ? alpha(laneColor, 0.06) : alpha(laneColor, 0.03),
  border: `1px solid ${alpha(laneColor, isDark ? 0.15 : 0.12)}`,
  borderRadius: 2,
  boxShadow: 'none',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  opacity: isComingSoon ? 0.5 : 1,
  cursor: isComingSoon ? 'not-allowed' : 'pointer',
  ...(!isComingSoon && {
    '&:hover': {
      borderColor: alpha(laneColor, isDark ? 0.35 : 0.3),
      boxShadow: `0 2px 8px ${alpha(laneColor, isDark ? 0.15 : 0.1)}`,
    },
  }),
  '& .MuiCardActionArea-root, & .MuiButtonBase-root': {
    display: 'block',
    textAlign: 'left',
    justifyContent: 'flex-start',
  },
});

/** Card icon circle. */
export const getCardIconSx = (
  theme: Theme,
  isDark: boolean,
  laneColor: string,
  isComingSoon: boolean,
): SxProps<Theme> => {
  const gray = theme.palette.text.secondary;
  let iconColor: string;
  if (isComingSoon) {
    iconColor = isDark
      ? theme.palette.text.disabled
      : theme.palette.text.secondary;
  } else {
    iconColor = laneColor;
  }

  return {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: isComingSoon
      ? alpha(gray, isDark ? 0.2 : 0.12)
      : alpha(laneColor, isDark ? 0.2 : 0.12),
    color: iconColor,
    '& svg': { fontSize: 16 },
  };
};
