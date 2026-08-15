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

import { Text } from '@backstage/ui';
import useAsync from 'react-use/esm/useAsync';
import { newRelicApiRef, NewRelicApplications } from '../../api';

import { Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useState } from 'react';
import { RiCloseLine, RiSearchLine } from '@remixicon/react';
import styles from './NewRelicFetchComponent.module.css';

type NewRelicTableData = {
  name: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  instanceCount: number;
  apdexScore: number;
};

export const NewRelicAPMTable = ({ applications }: NewRelicApplications) => {
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const data: Array<NewRelicTableData> = applications.map(app => {
    const { name, application_summary: applicationSummary } = app;
    const {
      response_time: responseTime,
      throughput,
      error_rate: errorRate,
      instance_count: instanceCount,
      apdex_score: apdexScore,
    } = applicationSummary;

    return {
      name,
      responseTime,
      throughput,
      errorRate,
      instanceCount,
      apdexScore,
    };
  });

  const filteredData = data.filter(row =>
    row.name.toLowerCase().includes(filterText.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerWrapper}>
        <h3 className={styles.title}>Application Performance Monitoring</h3>
        <div className={styles.filterWrapper}>
          <div className={styles.filterInputWrapper}>
            <span className={styles.filterIcon}>
              <RiSearchLine size={18} />
            </span>
            <input
              type="text"
              placeholder="Filter"
              className={styles.filterInput}
              value={filterText}
              onChange={e => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {filterText && (
            <button
              className={styles.clearFilterBtn}
              onClick={() => setFilterText('')}
              title="Clear filter"
            >
              <RiCloseLine size={18} />
            </button>
          )}
        </div>
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Application</th>
              <th className={styles.th}>Response Time (ms)</th>
              <th className={styles.th}>Throughput (rpm)</th>
              <th className={styles.th}>Error Rate (%)</th>
              <th className={styles.th}>Instance Count</th>
              <th className={styles.th}>Apdex</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {paginatedData.map((row, index) => (
              <tr key={index}>
                <td className={styles.td}>{row.name}</td>
                <td className={styles.td}>{row.responseTime.toFixed(2)}</td>
                <td className={styles.td}>{row.throughput.toFixed(2)}</td>
                <td className={styles.td}>
                  {(row.errorRate * 100).toFixed(2)}
                </td>
                <td className={styles.td}>{row.instanceCount}</td>
                <td className={styles.td}>{row.apdexScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.paginationContainer}>
        <div className={styles.paginationInfo}>
          Showing {filteredData.length === 0 ? 0 : startIndex + 1} to{' '}
          {Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
          {filteredData.length} results
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.paginationBtn}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.paginationBtn} ${
                currentPage === page ? styles.active : ''
              }`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.paginationBtn}
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

const NewRelicFetchComponent = () => {
  const api = useApi(newRelicApiRef);

  const { value, loading, error } = useAsync(async () => {
    const data = await api.getApplications();
    return data.applications.filter(application => {
      return application.hasOwnProperty('application_summary');
    });
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return (
      <Text variant="body-medium" color="danger">
        Error: {error.message}
      </Text>
    );
  }

  return <NewRelicAPMTable applications={value || []} />;
};

export default NewRelicFetchComponent;
