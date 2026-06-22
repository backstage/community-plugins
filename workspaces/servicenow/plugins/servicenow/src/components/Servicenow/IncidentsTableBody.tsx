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

import { IncidentsTableRow } from './IncidentsTableRow';
import type { IncidentsData } from '../../types';
import { useIncidentsListColumns } from './IncidentsListColumns';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './IncidentsTableBody.module.css';

export const IncidentsTableBody = ({ rows }: { rows: IncidentsData[] }) => {
  const { t } = useTranslation();
  const columns = useIncidentsListColumns();

  if (rows?.length > 0) {
    return (
      <div data-testid="incidents" style={{ display: 'table-row-group' }}>
        {rows.map(row => (
          <IncidentsTableRow key={row.sysId} data={row} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'table-row-group' }}>
      <div style={{ display: 'table-row', borderBottom: '1px solid #e0e0e0' }}>
        <div
          style={{
            display: 'table-cell',
            padding: '24px 16px 24px 20px',
            textAlign: 'center',
          }}
          data-testid="no-incidents-found"
          className={styles.emptyRow}
        >
          {t('table.emptyContent')}
        </div>
        {Array.from({ length: columns.length - 1 }).map((_, index) => (
          <div
            key={index}
            style={{
              display: 'table-cell',
              padding: '24px 16px 24px 20px',
            }}
          />
        ))}
      </div>
    </div>
  );
};
