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

import { useCallback } from 'react';

import { useTheme } from '@mui/styles';

/**
 * @deprecated ### Pass CSS color strings instead.
 * MUI colors are still supported, but all components using colors
 * allow passing any CSS color string.
 *
 * Use that approach instead, and resolve
 * colors using `const { palette } = useTheme()` or BUI `var(--bui-fg-xxx)`.
 *
 * This type and support for MUI color strings will be removed in a future
 * release.
 *
 * @public
 */
export type ProgressColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success';

const validColors = new Set([
  'inherit',
  'primary',
  'secondary',
  'error',
  'warning',
  'info',
  'success',
] as const);

function isProgressColor(color: string): color is ProgressColor {
  return validColors.has(color as ProgressColor);
}

/**
 * Returns the real color of a color value that might be a ProgressColor
 *
 * @deprecated Resolve colors and use CSS color strings instead of MUI colors.
 * See {@link ProgressColor}
 *
 * @public
 */
export function useParseColor(): (color: string) => string {
  const { palette } = useTheme();

  return useCallback(
    (color: string) => {
      if (isProgressColor(color)) {
        return color === 'inherit' ? 'inherit' : palette[color].main;
      }
      return color;
    },
    [palette],
  );
}
