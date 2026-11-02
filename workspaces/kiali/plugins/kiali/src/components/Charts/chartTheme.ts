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
import type { Theme } from '@material-ui/core/styles';

/**
 * MUI X Charts applies axis text via SVG attributes; sx alone does not win.
 * Prefer theme text color, with an explicit light fallback for dark mode.
 */
export const getChartAxisStyles = (theme: Theme) => {
  const isDark =
    theme.palette.type === 'dark' ||
    (theme.palette as { mode?: string }).mode === 'dark';
  const axisColor = isDark
    ? theme.palette.text.primary || '#f5f5f5'
    : theme.palette.text.secondary || '#000';

  return {
    axisColor,
    axisLabelStyle: { fill: axisColor, fontSize: 12 },
    tickLabelStyle: { fill: axisColor, fontSize: 11 },
    axisSx: {
      '& .MuiChartsAxis-line': { stroke: axisColor },
      '& .MuiChartsAxis-tick': { stroke: axisColor },
    },
  };
};
