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
import { Table, TableProps } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { useStyles } from './utils';
import { useDeepCompareMemo } from 'use-deep-compare';

export function FluxEntityTable<T extends object = {}>({
  title,
  data,
  isLoading,
  columns,
  filters,
  many,
}: TableProps<T> & { many?: boolean }) {
  const classes = useStyles();

  // We use this memo not really for performance, but to avoid
  // re-rendering the table when the data changes. Makes it much easier to style etc.
  // Review this decision if we run into hard to debug issues.

  return useDeepCompareMemo(() => {
    return (
      <Table
        key={data.length}
        columns={columns}
        options={{
          padding: 'dense',
          paging: Boolean(many),
          search: Boolean(many),
          pageSize: 5,
          // Don't revert to "unsorted" on the 3rd click, just toggle between asc/desc
          thirdSortClick: false,
          emptyRowsWhenPaging: false,
          columnsButton: true,
        }}
        data={data}
        isLoading={isLoading}
        emptyContent={
          <div className={classes.empty}>
            <Typography variant="body1">
              No {title} found
              {title === 'flux controllers' ? '' : 'for this entity'}.
            </Typography>
          </div>
        }
        filters={Boolean(many) ? filters : []}
      />
    );
  }, [data, title, isLoading, classes.empty, columns]);
}
