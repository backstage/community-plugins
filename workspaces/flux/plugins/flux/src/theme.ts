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
import { DefaultTheme } from 'styled-components';

export enum ThemeTypes {
  Light = 'light',
  Dark = 'dark',
}

const baseSpacingNumber = 16;

export const baseTheme = {
  fontFamilies: {
    monospace: "'Roboto Mono', monospace",
    regular: "'proxima-nova', Helvetica, Arial, sans-serif",
  },
  fontSizes: {
    huge: '48px',
    extraLarge: '32px',
    large: '20px',
    medium: '14px',
    small: '12px',
    tiny: '10px',
  },
  spacing: {
    none: '0',
    // 4px
    xxs: `${baseSpacingNumber * 0.25}px`,
    // 8px
    xs: `${baseSpacingNumber * 0.5}px`,
    // 12px
    small: `${baseSpacingNumber * 0.75}px`,
    // 16px
    base: `${baseSpacingNumber}px`,
    // 24px
    medium: `${baseSpacingNumber * 1.5}px`,
    // 32px
    large: `${baseSpacingNumber * 2}px`,
    // 48px
    xl: `${baseSpacingNumber * 3}px`,
    // 64px
    xxl: `${baseSpacingNumber * 4}px`,
  },
  borderRadius: {
    circle: '50%',
    none: '0',
    soft: '2px',
  },
  boxShadow: {
    light: '0 1px 3px #f5f5f5, 0 1px 2px #d8d8d8',
    none: 'none',
  },
};

export const theme = (mode: ThemeTypes = ThemeTypes.Light): DefaultTheme => {
  // dark
  if (mode === ThemeTypes.Dark) {
    return {
      ...baseTheme,
      colors: {
        black: '#fff',
        white: '#1a1a1a',
        primary: '#009CCC',
        // only used in nav text when collapsed + selected/hover
        primaryLight05: 'rgba(0,179,236,0.05)',
        primaryLight10: '#98E0F7',
        primary10: '#00b3ec',
        primary20: '#006B8E',
        successLight: '#156034',
        successMedium: '#78CC9C',
        successOriginal: '#27AE60',
        successDark: '#C9EBD7',
        alertLight: '#9F3119',
        alertMedium: '#D58572',
        alertOriginal: '#BC3B1D',
        alertDark: '#9F3119',
        neutralGray: '#32324B',
        neutral00: '#1a1a1a',
        neutral10: '#737373',
        neutral20: '#d8d8d8',
        neutral30: '#f5f5f5',
        neutral40: '#ffffff',
        whiteToPrimary: '#32324B',
        grayToPrimary: '#009CCC',
        backGray: '#32324B',
        blueWithOpacity: 'rgba(0, 179, 236, 0.1)',
        feedbackLight: '#8A460A',
        feedbackMedium: '#F7BF8E',
        feedbackOriginal: '#F2994A',
        feedbackDark: '#FCE6D2',
        defaultLight: '#FCE6D2',
        defaultMedium: '#F7BF8E',
        defaultOriginal: '#F2994A',
        defaultDark: '#8A460A',
      },
      mode: ThemeTypes.Dark,
    };
  }

  // light
  return {
    ...baseTheme,
    colors: {
      black: '#1a1a1a',
      white: '#fff',
      primary: '#00b3ec',
      primaryLight05: '#E5F7FD',
      primaryLight10: '#98E0F7',
      primary10: '#009CCC',
      primary20: '#006B8E',
      successLight: '#C9EBD7',
      successMedium: '#78CC9C',
      successOriginal: '#27AE60',
      successDark: '#156034',
      alertLight: '#EECEC7',
      alertMedium: '#D58572',
      alertOriginal: '#BC3B1D',
      alertDark: '#9F3119',
      neutralGray: '#F6F7F9',
      neutral00: '#ffffff',
      neutral10: '#f5f5f5',
      neutral20: '#d8d8d8',
      neutral30: '#737373',
      neutral40: '#1a1a1a',
      whiteToPrimary: '#fff',
      grayToPrimary: '#737373',
      backGray: '#eef0f4',
      blueWithOpacity: 'rgba(0, 179, 236, 0.1)',
      feedbackLight: '#FCE6D2',
      feedbackMedium: '#F7BF8E',
      feedbackOriginal: '#F2994A',
      feedbackDark: '#8A460A',
      defaultLight: '#FCE6D2',
      defaultMedium: '#F7BF8E',
      defaultOriginal: '#F2994A',
      defaultDark: '#8A460A',
    },
    mode: ThemeTypes.Light,
  };
};

export default theme;
