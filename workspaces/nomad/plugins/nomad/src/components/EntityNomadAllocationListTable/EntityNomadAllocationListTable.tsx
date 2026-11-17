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

import { DateTime } from 'luxon';
import {
  ResponseErrorPanel,
  Link as CoreLink,
} from '@backstage/core-components';
import {
  useEntity,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import { useMemo, useState } from 'react';
import { Allocation, nomadApiRef } from '../../api';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  NOMAD_GROUP_ANNOTATION,
  NOMAD_JOB_ID_ANNOTATION,
  NOMAD_NAMESPACE_ANNOTATION,
  isNomadAllocationsAvailable,
} from '../../annotations';
import useAsync from 'react-use/esm/useAsync';
import {
  Table,
  Cell,
  CellText,
  Tag,
  TagGroup,
  useTable,
  Header,
  Container,
} from '@backstage/ui';
import type { ColumnConfig } from '@backstage/ui';

type rowType = Allocation & { nomadAddr: string; id: string };

const renderStatusTag = (status: string) => {
  return (
    <TagGroup>
      <Tag>{status}</Tag>
    </TagGroup>
  );
};

/**
 * EntityNomadAllocationListTable is roughly based off Nomad's Allocations tab's view.
 */
export const EntityNomadAllocationListTable = () => {
  // Wait on entity
  const { entity } = useEntity();

  // Get ref to the backend API
  const [init, setInit] = useState(true);
  const configApi = useApi(configApiRef);
  const nomadApi = useApi(nomadApiRef);
  const nomadAddr = configApi.getString('nomad.addr');

  // Store results of calling API
  const [allocations, setAllocations] = useState<rowType[]>([]);
  const [err, setErr] = useState<Error>();

  // Get plugin attributes
  const namespace =
    entity.metadata.annotations?.[NOMAD_NAMESPACE_ANNOTATION] ?? 'default';
  const job = entity.metadata.annotations?.[NOMAD_JOB_ID_ANNOTATION] ?? '';
  const group = entity.metadata.annotations?.[NOMAD_GROUP_ANNOTATION] ?? '';

  // Make filter from attributes
  const filter: string[] = [];
  if (job) {
    filter.push(`(JobID == "${job}")`);
  }
  if (group) {
    filter.push(`(TaskGroup matches "${group}")`);
  }

  // Create a query to update allocations
  const query = async () => {
    try {
      // Make call to nomad-backend
      const resp = await nomadApi.listAllocations({
        namespace,
        filter: filter.join(' and '),
      });

      // Sort results
      const results = resp.allocations
        .sort((a, b) => a.CreateTime - b.CreateTime)
        .sort(({ ClientStatus: a }, { ClientStatus: b }) => {
          if (a === 'running' || b !== 'running') {
            return -1;
          }
          return 0;
        });

      setAllocations(results.map(row => ({ ...row, id: row.ID, nomadAddr })));
      setErr(undefined);
    } catch (e) {
      setAllocations([]);
      setErr(e);
    }
  };

  // Start querying for allocations every 5s
  useAsync(async () => {
    if (init) {
      setInit(false);
      query();
    }

    const interval = setTimeout(() => {
      query();
    }, 5_000);

    return () => clearTimeout(interval);
  }, [allocations, entity]);

  // Build column configuration for BUI Table
  const columnConfig: ColumnConfig<rowType>[] = useMemo(
    () => [
      {
        id: 'id',
        label: 'ID',
        isRowHeader: true,
        cell: (row: rowType) => (
          <Cell>
            <CoreLink
              to={`${row.nomadAddr}/ui/allocations/${row.ID}`}
              underline="always"
            >
              {row.ID.split('-')[0]}
            </CoreLink>
          </Cell>
        ),
        isSortable: true,
      },
      {
        id: 'taskGroup',
        label: 'Task Group',
        cell: (row: rowType) => (
          <Cell>
            <CoreLink
              to={`${row.nomadAddr}/ui/jobs/${row.JobID}/${row.TaskGroup}`}
              underline="always"
            >
              {row.TaskGroup}
            </CoreLink>
          </Cell>
        ),
        isSortable: true,
      },
      {
        id: 'createTime',
        label: 'Created',
        cell: (row: rowType) => (
          <CellText
            title={DateTime.fromMillis(row.CreateTime / 1000000).toLocaleString(
              DateTime.DATETIME_MED_WITH_SECONDS,
            )}
          />
        ),
        isSortable: true,
      },
      {
        id: 'clientStatus',
        label: 'Status',
        cell: (row: rowType) => (
          <Cell>{renderStatusTag(row.ClientStatus)}</Cell>
        ),
        isSortable: true,
      },
      {
        id: 'jobVersion',
        label: 'Version',
        cell: (row: rowType) => <CellText title={String(row.JobVersion)} />,
        isSortable: true,
      },
      {
        id: 'nodeId',
        label: 'Client',
        cell: (row: rowType) => (
          <Cell>
            <CoreLink
              to={`${row.nomadAddr}/ui/clients/${row.NodeID}`}
              underline="always"
            >
              {row.ID.split('-')[0]}
            </CoreLink>
          </Cell>
        ),
        isSortable: true,
      },
    ],
    [],
  );

  // Custom search function
  const searchFn = (items: rowType[], search: string) => {
    const lowerSearch = search.toLowerCase();
    return items.filter(
      item =>
        item.ID.toLowerCase().includes(lowerSearch) ||
        item.TaskGroup.toLowerCase().includes(lowerSearch) ||
        item.ClientStatus.toLowerCase().includes(lowerSearch) ||
        item.NodeID.toLowerCase().includes(lowerSearch),
    );
  };

  // Setup table with search and pagination
  const { tableProps } = useTable<rowType>({
    mode: 'complete',
    data: allocations,
    searchFn,
    paginationOptions: { pageSize: 10 },
  });

  // Check that attributes are available
  if (!isNomadAllocationsAvailable(entity)) {
    return (
      <MissingAnnotationEmptyState
        annotation={[NOMAD_JOB_ID_ANNOTATION, NOMAD_GROUP_ANNOTATION]}
      />
    );
  }

  // Store a ref to a potential error
  if (err) {
    return <ResponseErrorPanel error={err} />;
  }

  return (
    <Container>
      <Header title="Allocations" />
      <Table
        aria-label="Nomad Allocations"
        columnConfig={columnConfig}
        {...tableProps}
      />
    </Container>
  );
};
