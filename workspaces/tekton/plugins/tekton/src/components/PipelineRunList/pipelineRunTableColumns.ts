/*
 * Copyright 2024 The Backstage Authors
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
import type { SxProps, Theme } from '@mui/material/styles';

export const pipelineRunTableSx: SxProps<Theme> = {
  width: '100%',
};

export const pipelineRunTableCellSx: SxProps<Theme> = {
  px: 1.5,
  py: 1,
};

export const pipelineRunTableHeaderCellSx: SxProps<Theme> = {
  px: 1.5,
  py: 1,
  borderTop: (theme: Theme) => `1px solid ${theme.palette.grey.A100}`,
  borderBottom: (theme: Theme) => `1px solid ${theme.palette.grey.A100}`,
  fontWeight: 'bold',
  wordBreak: 'normal',
};

// Auto table layout: content-sized columns use width 1% + nowrap so they
// shrink to fit; Name has no width and absorbs the remaining space.
const columnSxById: Record<string, SxProps<Theme>> = {
  expander: {
    width: '1%',
    whiteSpace: 'nowrap',
    pr: 0,
    pl: 0.5,
  },
  name: {
    pl: 0.5,
    wordBreak: 'break-word',
  },
  vulnerabilities: {
    whiteSpace: 'nowrap',
  },
  status: {
    whiteSpace: 'nowrap',
  },
  'task-status': {
    whiteSpace: 'nowrap',
  },
  'start-time': {
    whiteSpace: 'nowrap',
  },
  duration: {
    whiteSpace: 'nowrap',
  },
  actions: {
    width: '1%',
    whiteSpace: 'nowrap',
  },
};

export const getPipelineRunTableColumnSx = (columnId: string): SxProps<Theme> =>
  columnSxById[columnId] ?? {};

export const getMergedPipelineRunTableCellSx = (
  columnId: string,
): SxProps<Theme> =>
  [
    pipelineRunTableCellSx,
    getPipelineRunTableColumnSx(columnId),
  ] as SxProps<Theme>;

export const getMergedPipelineRunTableHeaderCellSx = (
  columnId: string,
): SxProps<Theme> =>
  [
    pipelineRunTableHeaderCellSx,
    getPipelineRunTableColumnSx(columnId),
  ] as SxProps<Theme>;
