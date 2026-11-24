/*
 * Copyright 2026 The Backstage Authors
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
const DEFAULT_PALETTE = [
  'var(--bui-accent-bg)',
  'var(--bui-fg-positive)',
  'var(--bui-fg-warning)',
  'var(--bui-fg-announcement)',
  'var(--bui-fg-negative)',
  'var(--bui-fg-secondary)',
];

export const chartPalette = (colors?: string[]) => {
  const palette = colors && colors.length > 0 ? colors : DEFAULT_PALETTE;
  return (index: number) => palette[index % palette.length];
};
