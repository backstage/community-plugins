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
import type { MouseEvent, FC } from 'react';
import {
  makeStyles,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';

import { getResourcesColumnHeaders } from './ResourcesColumnHeader';
import { Order } from '@backstage-community/plugin-redhat-argocd-common';
import { useTranslation } from '../../../../hooks/useTranslation';

interface ResourcesTableHeaderProps {
  onRequestSort: (
    event: MouseEvent<unknown>,
    property: string,
    id: string,
  ) => void;
  order: Order;
  orderBy: string | null;
  orderById: string | null;
}

const useStyles = makeStyles(theme => ({
  header: {
    padding: theme.spacing(1, 0),
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  expander: {
    width: '80px',
  },
}));

export const ResourcesTableHeader: FC<ResourcesTableHeaderProps> = ({
  order,
  orderBy,
  orderById,
  onRequestSort,
}) => {
  const classes = useStyles();

  const createSortHandler =
    (property: string, id: string) => (event: MouseEvent<unknown>) => {
      onRequestSort(event, property, id);
    };
  const { t } = useTranslation();
  const resourcesColumnHeaders = getResourcesColumnHeaders(t);
  return (
    <TableHead>
      <TableRow>
        {resourcesColumnHeaders.map((headCell, index) => {
          return (
            <TableCell
              key={headCell.id as string}
              align="left"
              padding="normal"
              sortDirection={orderBy === headCell.id ? order : false}
              className={
                headCell.id !== 'expander' ? classes.header : classes.expander
              }
            >
              {headCell.title && (
                <TableSortLabel
                  active={orderBy === headCell.id && orderById === `${index}`}
                  direction={order}
                  onClick={createSortHandler(
                    headCell.id as string,
                    index.toString() as string,
                  )}
                >
                  {headCell.title}
                </TableSortLabel>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
