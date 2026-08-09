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

import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

import { Order } from '../../types/types';
import { getPipelineRunColumnHeader } from './PipelineRunColumnHeader';
import { getMergedPipelineRunTableHeaderCellSx } from './pipelineRunTableColumns';
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
  const { t } = useTranslationRef(tektonTranslationRef);
  const pipelineRunColumnHeader = getPipelineRunColumnHeader(t);

  return (
    <TableHead>
      <TableRow>
        {pipelineRunColumnHeader.map(headCell => {
          const columnId = headCell.id as string;
          const isExpander = columnId === 'expander';

          return (
            <TableCell
              sx={getMergedPipelineRunTableHeaderCellSx(columnId)}
              key={columnId}
              align="left"
              padding={isExpander ? 'checkbox' : 'normal'}
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
