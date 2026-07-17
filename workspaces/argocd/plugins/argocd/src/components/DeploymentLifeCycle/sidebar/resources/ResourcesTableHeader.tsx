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
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

import { getResourcesColumnHeaders } from './ResourcesColumnHeader';
import { Order } from '@backstage-community/plugin-argocd-common';
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

export const ResourcesTableHeader: FC<ResourcesTableHeaderProps> = ({
  order,
  orderBy,
  orderById,
  onRequestSort,
}) => {
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
              sx={theme =>
                headCell.id !== 'expander'
                  ? {
                      py: 1,
                      px: 0,
                      fontWeight: 'bold',
                      color: theme.palette.text.primary,
                    }
                  : { width: '80px' }
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
