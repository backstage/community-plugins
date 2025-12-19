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

import { makeStyles } from '@mui/styles';
import Tooltip from '@mui/material/Tooltip';
import HideSourceIcon from '@mui/icons-material/HideSource';

const useStyles = makeStyles(() => ({
  root: {
    opacity: 0.5,
  },
  noIcon: {
    opacity: 0,
  },
}));

/**
 * Props for {@link ColumnIconError}
 *
 * @public
 */
export interface ColumnIconNoDataProps {
  /**
   * Optional title to show in a tooltip
   */
  title?: string;

  /**
   * Hide the "no data" icon and just show the tooltip text
   */
  noIcon?: boolean;
}

/**
 * A column icon for errors
 *
 * @public
 */
export function ColumnIconNoData(props: ColumnIconNoDataProps) {
  const { root, noIcon } = useStyles();

  return (
    <Tooltip title={props.title ?? 'No data available'}>
      <HideSourceIcon
        className={props.noIcon ? noIcon : root}
        color="disabled"
      />
    </Tooltip>
  );
}
