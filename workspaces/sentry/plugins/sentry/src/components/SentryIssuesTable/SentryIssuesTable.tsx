/*
 * Copyright 2020 The Backstage Authors
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

import { useCallback, useState } from 'react';
import { SentryIssue } from '../../api';
import { DateTime, Duration } from 'luxon';
import { ErrorCell } from '../ErrorCell/ErrorCell';
import { ErrorGraph } from '../ErrorGraph/ErrorGraph';
import { Button, Text } from '@backstage/ui';
import styles from './SentryIssuesTable.module.css';

const ONE_DAY_IN_MILLIS = 86400000;
const SEVEN_DAYS_IN_MILLIS = ONE_DAY_IN_MILLIS * 7;
const FOURTEEN_DAYS_IN_MILLIS = ONE_DAY_IN_MILLIS * 14;

type SentryIssuesTableProps = {
  sentryIssues: SentryIssue[];
  statsFor: '24h' | '14d' | '';
  tableOptions?: {
    pageSize?: number;
  };
};

const SentryIssuesTable = (props: SentryIssuesTableProps) => {
  const { sentryIssues, statsFor, tableOptions } = props;
  const [selected, setSelected] = useState(ONE_DAY_IN_MILLIS.toString());
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = tableOptions?.pageSize || 5;

  const filterByDate = useCallback(
    (issue: SentryIssue, selectedFilter: number) => {
      return (
        DateTime.fromISO(issue.lastSeen) >
        DateTime.now().minus(Duration.fromMillis(selectedFilter))
      );
    },
    [],
  );

  const filteredIssues =
    selected === Number.NEGATIVE_INFINITY.toString()
      ? sentryIssues
      : sentryIssues.filter(i => filterByDate(i, Number(selected)));

  const handleFilterChange = (value: string) => {
    setSelected(value);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const totalPages = Math.ceil(filteredIssues.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedIssues = filteredIssues.slice(startIndex, endIndex);

  return (
    <div>
      <div className={styles.tableHeader}>
        <div className={styles.headerTitle}>Sentry Issues</div>
        <div className={styles.filterControl}>
          <select
            aria-label="Filter by time period"
            value={selected}
            onChange={e => handleFilterChange(e.target.value)}
            className={styles.selectInput}
          >
            <option value={ONE_DAY_IN_MILLIS.toString()}>24H</option>
            <option value={SEVEN_DAYS_IN_MILLIS.toString()}>7D</option>
            <option value={FOURTEEN_DAYS_IN_MILLIS.toString()}>14D</option>
            <option value={Number.NEGATIVE_INFINITY.toString()}>All</option>
          </select>
        </div>
      </div>

      <div data-testid="sentry-issues-grid" className={styles.tableWrapper}>
        {filteredIssues.length === 0 ? (
          <div className={styles.emptyState}>No issues found</div>
        ) : (
          <>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Error</th>
                  <th className={styles.th}>Graph</th>
                  <th className={styles.th}>First seen</th>
                  <th className={styles.th}>Last seen</th>
                  <th className={styles.th}>Events</th>
                  <th className={styles.th}>Users</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {paginatedIssues.map((issue, idx) => (
                  <tr key={idx} className={styles.tr}>
                    <td className={styles.td}>
                      <ErrorCell sentryIssue={issue} />
                    </td>
                    <td className={styles.td}>
                      <ErrorGraph sentryIssue={issue} />
                    </td>
                    <td className={styles.td}>
                      {DateTime.fromISO(issue.firstSeen).toRelative({
                        locale: 'en',
                      })}
                    </td>
                    <td className={styles.td}>
                      {DateTime.fromISO(issue.lastSeen).toRelative({
                        locale: 'en',
                      })}
                    </td>
                    <td className={styles.td}>{issue.count}</td>
                    <td className={styles.td}>{issue.userCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <Button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  isDisabled={currentPage === 0}
                  variant="secondary"
                >
                  Previous
                </Button>
                <Text>
                  Page {currentPage + 1} of {totalPages}
                </Text>
                <Button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  isDisabled={currentPage === totalPages - 1}
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SentryIssuesTable;
