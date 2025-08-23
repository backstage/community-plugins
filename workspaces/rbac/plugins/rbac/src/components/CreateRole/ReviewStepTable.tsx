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
import { Fragment } from 'react';

export const ReviewStepTable = ({
  columns,
  rows,
  tableWrapperWidth,
}: {
  columns: any[];
  rows: any[];
  tableWrapperWidth: number;
}) => {
  return (
    <div
      style={{
        maxHeight: '230px',
        overflow: 'auto',
        width: `${tableWrapperWidth}px`,
      }}
    >
      <table style={{ width: `${tableWrapperWidth - 50}px` }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th style={{ width: '150px' }} key={col.title}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <Fragment key={rowIndex}>
              <tr>
                {columns.map(rowCol => (
                  <td
                    style={{ width: '150px' }}
                    key={`${rowCol.title}-${rowCol.field}`}
                  >
                    {rowCol.render
                      ? rowCol.render(row[rowCol.field])
                      : row[rowCol.field] || (rowCol.emptyValue ?? '')}
                  </td>
                ))}
              </tr>
              <tr />
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
