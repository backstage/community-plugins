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

import { useEffect, useState, MouseEvent, useMemo } from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

import {
  CatalogFilterLayout,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { Progress } from '@backstage/core-components';
import { Box, ButtonIcon, Text } from '@backstage/ui';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSkipLeftLine,
  RiSkipRightLine,
  RiSearchLine,
  RiCloseLine,
} from '@remixicon/react';

import {
  Order,
  SortingOrderEnum,
} from '@backstage-community/plugin-servicenow-common';

import { IncidentsFilter } from './IncidentsFilter';
import { useIncidentsListColumns } from './IncidentsListColumns';
import { IncidentsTableBody } from './IncidentsTableBody';
import { IncidentsTableHeader } from './IncidentsTableHeader';
import {
  IncidentTableFieldEnum,
  type IncidentsData,
  type IncidentTableField,
} from '../../types';
import { buildIncidentQueryParams } from '../../utils/queryParamsUtils';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useQueryState } from '../../hooks/useQueryState';
import { useQueryArrayState } from '../../hooks/useQueryArrayState';
import { serviceNowApiRef } from '../../api/ServiceNowBackendClient';
import useUserEmail from '../../hooks/useUserEmail';
import { useUpdateQueryParams } from '../../hooks/useQueryHelpers';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './EntityServicenowContent.module.css';

export const EntityServicenowContent = () => {
  const { t } = useTranslation();
  const { entity } = useEntity();
  const serviceNowApi = useApi(serviceNowApiRef);
  const incidentsListColumns = useIncidentsListColumns();

  const [search, setSearch] = useQueryState<string>('search', '');
  const [input, setInput] = useState(search);
  const debouncedInput = useDebouncedValue(input, 300);

  const [order, setOrder] = useQueryState<Order>('order', SortingOrderEnum.Asc);
  const [orderBy, setOrderBy] = useQueryState<IncidentTableField>(
    'orderBy',
    IncidentTableFieldEnum.Number,
  );

  const [rowsPerPage] = useQueryState<number>('limit', 5);
  const [offset, setOffset] = useQueryState<number>('offset', 0);
  const [state] = useQueryArrayState('state', []);
  const [priority] = useQueryArrayState('priority', []);

  const pageNumber = Math.floor(offset / rowsPerPage);

  const [count, setCount] = useState<number>(0);
  const [incidentsData, setIncidentsData] = useState<IncidentsData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateQueryParams = useUpdateQueryParams();

  const servicenowAnnotations = useMemo(() => {
    const annotations = entity.metadata.annotations;
    const snAnnotations: Record<string, string> = {};
    if (annotations) {
      for (const [key, value] of Object.entries(annotations)) {
        if (key.startsWith('servicenow.com/entity-id')) {
          snAnnotations.entityId = value;
          continue;
        }
        if (key.startsWith('servicenow.com/')) {
          const field = key.substring('servicenow.com/'.length);
          snAnnotations[field] = value;
        }
      }
    }
    return snAnnotations;
  }, [entity.metadata.annotations]);

  const kind = entity.kind.toLocaleLowerCase('en-US');
  const userEmail = useUserEmail(kind);

  const identityApi = useApi(identityApiRef);

  useEffect(() => {
    identityApi.getBackstageIdentity().then(identity => {
      if (identity.userEntityRef) {
        localStorage.setItem('userEntityRef', identity.userEntityRef);
      }
    });
  }, [identityApi]);

  useEffect(() => {
    if (debouncedInput !== search) {
      setSearch(debouncedInput);
      setOffset(0);
    }
  }, [debouncedInput, search, setSearch, setOffset]);

  useEffect(() => {
    async function fetchIncidents() {
      setLoading(true);
      setError(null);

      if (!userEmail && Object.keys(servicenowAnnotations).length === 0) {
        setIncidentsData([]);
        setLoading(false);
        return;
      }

      try {
        const queryParams = buildIncidentQueryParams({
          limit: rowsPerPage,
          offset,
          order,
          orderBy,
          search: search,
          priority: priority ?? undefined,
          state: state ?? undefined,
          userEmail,
          ...servicenowAnnotations,
        });

        const { incidents, totalCount } = await serviceNowApi.getIncidents(
          queryParams,
        );
        setIncidentsData(incidents);
        setCount(totalCount);
      } catch (e) {
        setError((e as Error).message);
        setIncidentsData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchIncidents();
  }, [
    rowsPerPage,
    offset,
    order,
    orderBy,
    search,
    serviceNowApi,
    servicenowAnnotations,
    priority,
    state,
    userEmail,
  ]);

  const handlePageChange = (page: number) => {
    setOffset(page * rowsPerPage);
  };

  const handleRequestSort = (
    _event: MouseEvent<unknown>,
    property: IncidentTableField,
  ) => {
    const isAsc = orderBy === property && order === SortingOrderEnum.Asc;
    setOrder(isAsc ? SortingOrderEnum.Desc : SortingOrderEnum.Asc);
    setOrderBy(property);
    setOffset(0);
  };

  const IncidentsTableHeaderComponent = () => {
    return (
      <IncidentsTableHeader
        order={order}
        orderBy={orderBy}
        onRequestSort={handleRequestSort}
      />
    );
  };

  const IncidentsTableBodyComponent = () => {
    if (loading) {
      return (
        <div className={styles.tableRowGroup}>
          <div className={styles.tableRow}>
            <div className={styles.tableCellLoading}>
              <Box className={styles.loadingRow}>
                <Progress />
              </Box>
            </div>
          </div>
        </div>
      );
    }
    return <IncidentsTableBody rows={incidentsData} />;
  };

  const TablePaginationComponent = () => {
    const rowsPerPageOptions = [5, 10, 20, 50, 100];
    return (
      <div className={styles.paginationContainer}>
        <select
          value={String(rowsPerPage)}
          onChange={e => {
            updateQueryParams({
              limit: e.target.value,
              offset: '0',
            });
          }}
          className={styles.rowsPerPageSelect}
        >
          {rowsPerPageOptions.map(n => (
            <option key={n} value={String(n)}>
              {t('table.labelRowsSelect', { count: String(n) })}
            </option>
          ))}
        </select>
        <Text as="div" className={styles.paginationInfo}>
          {count === 0
            ? '0 of 0'
            : `${offset + 1}-${Math.min(
                offset + rowsPerPage,
                count,
              )} of ${count}`}
        </Text>
        <div className={styles.paginationButtons}>
          <ButtonIcon
            icon={<RiSkipLeftLine size={16} />}
            onPress={() => setOffset(0)}
            isDisabled={pageNumber === 0}
            variant="secondary"
          />
          <ButtonIcon
            icon={<RiArrowLeftSLine size={16} />}
            onPress={() => handlePageChange(pageNumber - 1)}
            isDisabled={pageNumber === 0}
            variant="secondary"
          />
          <ButtonIcon
            icon={<RiArrowRightSLine size={16} />}
            onPress={() => handlePageChange(pageNumber + 1)}
            isDisabled={(pageNumber + 1) * rowsPerPage >= count}
            variant="secondary"
          />
          <ButtonIcon
            icon={<RiSkipRightLine size={16} />}
            onPress={() =>
              setOffset(Math.floor((count - 1) / rowsPerPage) * rowsPerPage)
            }
            isDisabled={(pageNumber + 1) * rowsPerPage >= count}
            variant="secondary"
          />
        </div>
      </div>
    );
  };

  return (
    <Box>
      <CatalogFilterLayout>
        <CatalogFilterLayout.Filters>
          <IncidentsFilter />
        </CatalogFilterLayout.Filters>
        <CatalogFilterLayout.Content>
          {error ? (
            <Box className={styles.errorContainer}>
              {t('errors.loadingIncidents', { error })}
            </Box>
          ) : (
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <h2 className={styles.titleHeading}>
                  {count === 0
                    ? t('page.title')
                    : t('page.titleWithCount', { count: String(count) })}
                </h2>
                <div className={styles.searchContainer}>
                  <RiSearchLine size={16} color="var(--bui-fg-secondary)" />
                  <input
                    type="text"
                    placeholder={t('table.searchPlaceholder')}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={{
                      paddingRight: input ? '24px' : '0',
                    }}
                    className={styles.searchInput}
                  />
                  {input && (
                    <ButtonIcon
                      icon={<RiCloseLine size={16} />}
                      onPress={() => setInput('')}
                      className={styles.clearSearchButton}
                      variant="secondary"
                      aria-label={t('actions.clearSearch')}
                    />
                  )}
                </div>
              </div>
              <div className={styles.table}>
                <IncidentsTableHeaderComponent />
                <IncidentsTableBodyComponent />
              </div>
              <TablePaginationComponent />
            </div>
          )}
        </CatalogFilterLayout.Content>
      </CatalogFilterLayout>
    </Box>
  );
};
