/*
 * Copyright 2021 The Backstage Authors
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

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { xcmetricsApiRef } from '../../api';
import useAsync from 'react-use/esm/useAsync';
import useMeasure from 'react-use/esm/useMeasure';
import { cn } from '../../utils';
import { useApi } from '@backstage/core-plugin-api';
import Alert from '@material-ui/lab/Alert';
import { StatusCell } from '../StatusCell';

const CELL_SIZE = 12;
const CELL_MARGIN = 4;
const MAX_ROWS = 4;

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: 8,
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
  loading: {
    animation: `$loadingOpacity 900ms ${theme.transitions.easing.easeInOut}`,
    animationIterationCount: 'infinite',
  },
  '@keyframes loadingOpacity': {
    '0%': { opacity: 0.3 },
    '100%': { opacity: 0.8 },
  },
}));

export const StatusMatrix = () => {
  const classes = useStyles();
  const [measureRef, { width: rootWidth }] = useMeasure<HTMLDivElement>();
  const client = useApi(xcmetricsApiRef);
  const {
    value: builds,
    loading,
    error,
  } = useAsync(async () => client.getBuildStatuses(300), []);

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const cols = Math.trunc(rootWidth / (CELL_SIZE + CELL_MARGIN)) || 1;

  return (
    <div
      className={cn(classes.root, loading && classes.loading)}
      ref={measureRef}
    >
      {loading &&
        [...new Array(cols * MAX_ROWS)].map((_, index) => {
          return (
            <StatusCell key={index} size={CELL_SIZE} spacing={CELL_MARGIN} />
          );
        })}

      {builds &&
        builds
          .slice(0, cols * MAX_ROWS)
          .map((buildStatus, index) => (
            <StatusCell
              key={index}
              buildStatus={buildStatus}
              size={CELL_SIZE}
              spacing={CELL_MARGIN}
            />
          ))}
    </div>
  );
};
