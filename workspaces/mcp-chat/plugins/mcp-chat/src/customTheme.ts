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

export const getCustomTheme = (baseTheme: any, isDarkMode: boolean) => ({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    primary: {
      main: '#4CAF50', // Green primary color
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#ffffff',
    },
    background: {
      ...baseTheme.palette.background,
      default: isDarkMode ? '#121212' : '#f5f5f5',
      paper: isDarkMode ? '#1e1e1e' : '#ffffff',
    },
    text: {
      ...baseTheme.palette.text,
      primary: isDarkMode ? '#ffffff' : '#333333',
      secondary: isDarkMode ? '#b3b3b3' : '#666666',
    },
    divider: isDarkMode ? '#333333' : '#e0e0e0',
  },
  components: {
    ...baseTheme.components,
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f8f8',
            '& fieldset': {
              borderColor: isDarkMode ? '#444444' : '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: isDarkMode ? '#666666' : '#c0c0c0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4CAF50',
            },
          },
          '& .MuiInputBase-input': {
            color: isDarkMode ? '#ffffff' : '#333333',
          },
          '& .MuiInputBase-input::placeholder': {
            color: isDarkMode ? '#888888' : '#999999',
            opacity: 1,
          },
        },
      },
    },
  },
});
