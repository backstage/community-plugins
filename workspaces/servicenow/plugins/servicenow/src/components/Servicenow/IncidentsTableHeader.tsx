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

import { MouseEvent } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from '@remixicon/react';

import type { Order } from '@backstage-community/plugin-servicenow-common';

import { useIncidentsListColumns } from './IncidentsListColumns';
import { IncidentTableField } from '../../types';
import styles from './IncidentsTableHeader.module.css';

type IncidentsTableHeaderProps = {
  order: Order;
  orderBy: IncidentTableField | undefined;
  onRequestSort: (
    event: MouseEvent<unknown>,
    property: IncidentTableField,
  ) => void;
};

export const IncidentsTableHeader = ({
  order,
  orderBy,
  onRequestSort,
}: IncidentsTableHeaderProps) => {
  const incidentsListColumns = useIncidentsListColumns();

  const createSortHandler =
    (property: IncidentTableField) => (event: MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <div className={styles.headerRow}>
      <div className={styles.headerRowContent}>
        {incidentsListColumns.map(column => (
          <div key={column.id as string} className={styles.headerCell}>
            <button
              className={styles.headerButton}
              onClick={
                column.sorting === false
                  ? undefined
                  : createSortHandler(column.field as IncidentTableField)
              }
              disabled={column.sorting === false}
              type="button"
            >
              {column.title}
              {orderBy === column.field &&
                (orderBy === column.field && order === 'asc' ? (
                  <RiArrowUpSLine size={16} />
                ) : (
                  <RiArrowDownSLine size={16} />
                ))}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
