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
import type { MouseEvent } from 'react';

import {
  makeStyles,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';

import { Order } from '../../types/types';
import { getPipelineRunColumnHeader } from './PipelineRunColumnHeader';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { tektonTranslationRef } from '../../translations/index.ts';

type EnhancedTableProps = {
  onRequestSort: (
    event: MouseEvent<unknown>,
    property: string,
    id: string,
  ) => void;
  order: Order;
  orderBy: string;
  orderById: string;
};

const useStyles = makeStyles(theme => ({
  header: {
    padding: theme.spacing(1, 2, 1, 2.5),
    borderTop: `1px solid ${theme.palette.grey.A100}`,
    borderBottom: `1px solid ${theme.palette.grey.A100}`,
    // withStyles hasn't a generic overload for theme
    fontWeight: 'bold',
    position: 'static',
    wordBreak: 'normal',
  },
}));

export const EnhancedTableHead = ({
  order,
  orderBy,
  orderById,
  onRequestSort,
}: EnhancedTableProps) => {
  const createSortHandler =
    (property: string, id: string) => (event: MouseEvent<unknown>) => {
      onRequestSort(event, property, id);
    };
  const classes = useStyles();
  const { t } = useTranslationRef(tektonTranslationRef);
  const pipelineRunColumnHeader = getPipelineRunColumnHeader(t);

  return (
    <TableHead>
      <TableRow>
        {pipelineRunColumnHeader.map(headCell => {
          return (
            <TableCell
              className={classes.header}
              key={headCell.id as string}
              align="left"
              padding="normal"
              sortDirection={
                orderBy === headCell.field ? headCell.defaultSort : false
              }
            >
              {headCell.field ? (
                <TableSortLabel
                  active={
                    orderBy === headCell.field && orderById === headCell.id
                  }
                  direction={order}
                  onClick={createSortHandler(
                    headCell.field as string,
                    headCell.id as string,
                  )}
                >
                  {headCell.title}
                </TableSortLabel>
              ) : (
                <> {headCell.title}</>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
