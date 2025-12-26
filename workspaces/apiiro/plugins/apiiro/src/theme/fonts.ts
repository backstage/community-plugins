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

export const FONT_FAMILY = `'Mulish', HelveticaNeue, 'Helvetica Neue', Helvetica, 'Courier Prime', Arial, sans-serif`;

// Font weights
export const FONT_WEIGHTS = {
  thin: 100,
  light: 300,
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;

// Common font styles
export const fontStyles = {
  body: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.normal,
  },
  heading: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  label: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.medium,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.light,
  },
} as const;
